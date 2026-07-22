import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { v2 as cloudinary } from 'cloudinary';

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

@Injectable()
export class FileService implements OnModuleInit {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'uploads');
  private bucket: ReturnType<Storage['bucket']> | null = null;
  private useFirebase = false;
  private useCloudinary = false;

  onModuleInit() {
    // Local-disk fallback dir. Always created so local dev / tests keep
    // working out of the box without any Firebase/Cloudinary setup — only
    // used when neither of the persistent-storage backends below is
    // configured.
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Cloudinary is checked first: unlike Firebase Storage (which now
    // requires the project to be on the paid "Blaze" plan just to create a
    // bucket), Cloudinary's free tier (25GB storage/bandwidth) needs no
    // billing account at all, so it's the easiest zero-cost persistent
    // backend to stand up on a free-tier Render service.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      this.useCloudinary = true;
      console.log(`FileService: using Cloudinary (cloud "${cloudName}") for uploads.`);
      return;
    }

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (bucketName && serviceAccountB64) {
      try {
        const serviceAccount = JSON.parse(
          Buffer.from(serviceAccountB64, 'base64').toString('utf8'),
        );
        if (!getApps().length) {
          initializeApp({
            credential: cert(serviceAccount),
            storageBucket: bucketName,
          });
        }
        this.bucket = getStorage().bucket();
        this.useFirebase = true;
        console.log(`FileService: using Firebase Storage bucket "${bucketName}" for uploads.`);
      } catch (err) {
        console.error(
          'FileService: failed to initialize Firebase Storage, falling back to local disk (uploads will NOT survive restarts on ephemeral hosts):',
          err.message,
        );
      }
    } else {
      console.log(
        'FileService: no CLOUDINARY_* or FIREBASE_STORAGE_BUCKET/FIREBASE_SERVICE_ACCOUNT_KEY env vars set — using local disk for uploads. ' +
        'This is fine for local dev, but on ephemeral hosts (Render, Railway, Cloud Run) uploaded files are lost on every restart/redeploy.',
      );
    }
  }

  async uploadFile(
    originalname: string,
    buffer: Buffer,
    shopId: string,
  ): Promise<{ fileUrl: string; fileKey: string }> {
    const fileExt = path.extname(originalname);
    const cleanShopId = shopId.replace(/[^a-zA-Z0-9]/g, '');
    const uniqueName = `${cleanShopId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${fileExt}`;

    if (this.useCloudinary) {
      const safeName = (originalname || uniqueName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const publicId = uniqueName.slice(0, uniqueName.length - fileExt.length);
      const result = await new Promise<{ public_id: string; resource_type: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { public_id: publicId, resource_type: 'auto', type: 'upload' },
            (err, res) => (err || !res ? reject(err || new Error('Cloudinary upload failed')) : resolve(res)),
          );
          stream.end(buffer);
        },
      );
      // fl_attachment forces a Content-Disposition: attachment response
      // header at delivery time (rather than baking it in at upload time,
      // like Firebase's contentDisposition metadata) — this is what makes
      // both the web <a download> click and the native Filesystem.download
      // flow save the file instead of previewing it inline.
      //
      // The filename given to fl_attachment:<name> must NOT contain a "."
      // — Cloudinary's transformation-string parser treats a dot inside this
      // flag's value as a format suffix on the *transformation segment*
      // itself, which breaks parsing and returns 400 "Invalid flag in
      // transformation: <ext>" for every download (e.g.
      // fl_attachment:photo.jpg fails, fl_attachment:photo succeeds).
      // Stripping the extension here is safe: Cloudinary auto-appends the
      // resource's real extension to the Content-Disposition filename
      // regardless (e.g. still downloads as "photo.jpg" on the device).
      const safeNameNoExt = safeName.replace(/\.[a-zA-Z0-9]{1,8}$/, '');
      const fileUrl = cloudinary.url(result.public_id, {
        resource_type: result.resource_type as 'image' | 'video' | 'raw' | 'auto',
        secure: true,
        flags: `attachment:${encodeURIComponent(safeNameNoExt)}`,
      });
      return { fileUrl, fileKey: `${result.resource_type}:${result.public_id}` };
    }

    if (this.useFirebase && this.bucket) {
      const file = this.bucket.file(uniqueName);
      // contentDisposition: 'attachment' is what actually makes mobile
      // browsers save the file to the device instead of navigating to/
      // previewing it in a tab. Since these files are served directly from
      // storage.googleapis.com (not proxied through our API), this header
      // must be baked in at upload time — it can't be set per-request later.
      const safeName = (originalname || uniqueName).replace(/[^a-zA-Z0-9._-]/g, '_');
      await file.save(buffer, {
        metadata: {
          contentType: CONTENT_TYPE_BY_EXT[fileExt.toLowerCase()] || 'application/octet-stream',
          contentDisposition: `attachment; filename="${safeName}"`,
        },
        public: true,
        resumable: false,
      });
      const fileUrl = `https://storage.googleapis.com/${this.bucket.name}/${uniqueName}`;
      return { fileUrl, fileKey: uniqueName };
    }

    const filePath = path.join(this.uploadDir, uniqueName);
    await fs.promises.writeFile(filePath, buffer);
    const fileUrl = `/api/uploads/${uniqueName}`;
    return { fileUrl, fileKey: uniqueName };
  }

  async deleteFile(fileKey: string): Promise<void> {
    if (this.useCloudinary) {
      // Cloudinary fileKeys are stored as "resourceType:publicId" (see
      // uploadFile above). Older fileKeys created before Cloudinary was
      // configured are plain local-disk filenames with no ":" — those
      // point at files that are already gone (ephemeral disk), so this
      // is a harmless no-op for them rather than a real deletion.
      const sepIndex = fileKey.indexOf(':');
      if (sepIndex === -1) return;
      const resourceType = fileKey.slice(0, sepIndex);
      const publicId = fileKey.slice(sepIndex + 1);
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (err) {
        console.warn(`FileService: Cloudinary delete failed for "${publicId}":`, err.message);
      }
      return;
    }

    if (this.useFirebase && this.bucket) {
      try {
        await this.bucket.file(fileKey).delete();
      } catch (err) {
        if (err.code !== 404) throw err;
      }
      return;
    }

    const filePath = path.join(this.uploadDir, fileKey);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}
