import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';

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

  onModuleInit() {
    // Local-disk fallback dir. Always created so local dev / tests keep
    // working out of the box without any Firebase setup — only used when
    // Firebase Storage env vars below are absent.
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
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
        'FileService: FIREBASE_STORAGE_BUCKET/FIREBASE_SERVICE_ACCOUNT_KEY not set — using local disk for uploads. ' +
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

    if (this.useFirebase && this.bucket) {
      const file = this.bucket.file(uniqueName);
      await file.save(buffer, {
        metadata: { contentType: CONTENT_TYPE_BY_EXT[fileExt.toLowerCase()] || 'application/octet-stream' },
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
