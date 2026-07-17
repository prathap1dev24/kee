/**
 * One-time data migration: moves shop verification documents that are
 * currently embedded inside `Shop.companyDetails` (a free-form JSON text
 * column) out into proper `ShopDocument` rows, then strips the migrated
 * keys from `companyDetails`.
 *
 * Historically, `companyDetails.shopPhoto` / `.shopLicense` / `.ownerAadhaar`
 * could hold THREE different shapes, depending on which code path wrote
 * them:
 *
 *   1. A base64 data URI string, e.g. "data:image/png;base64,iVBOR..."
 *      -> written by the public registration wizard or the Super Admin
 *         "Provision Shop" form (pre-refactor `AuthService.registerShop` /
 *         `ShopService.createShop`).
 *   2. An object `{ fileUrl, fileKey }`
 *      -> written by the old Shop Settings "upload document" flow, which
 *         called `FileService.uploadFile()` directly and stored the
 *         resulting pointer in the JSON blob.
 *   3. A plain fileUrl string (no fileKey)
 *      -> a defensive case some older records may have from manual data
 *         entry / partial writes. Treated like (2) but with a synthesized
 *         fileKey derived from the URL, since the physical file's on-disk
 *         name is recoverable from the URL itself
 *         (`/api/uploads/<fileKey>`).
 *
 * This script normalizes all three shapes into `ShopDocument` rows and is
 * SAFE TO RE-RUN: it skips shops that already have an active ShopDocument
 * of a given `documentType`, so re-running after a partial failure will
 * only process what's left.
 *
 * Usage:
 *   cd backend
 *   npx ts-node -r tsconfig-paths/register scripts/migrate-shop-documents.ts
 *   npx ts-node scripts/migrate-shop-documents.ts --dry-run   (report only, no writes)
 *
 * Prerequisite: the `ShopDocument` table must already exist, i.e. the
 * `20260717113900_shop_documents_soft_delete_and_indexes` Prisma migration
 * (or later) must be applied first.
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

const SHOP_DOCUMENT_TYPES = {
  SHOP_PHOTO: 'SHOP_PHOTO',
  SHOP_LICENSE: 'SHOP_LICENSE',
  OWNER_AADHAAR: 'OWNER_AADHAAR',
} as const;

const LEGACY_KEY_TO_TYPE: Record<string, string> = {
  shopPhoto: SHOP_DOCUMENT_TYPES.SHOP_PHOTO,
  shopLicense: SHOP_DOCUMENT_TYPES.SHOP_LICENSE,
  ownerAadhaar: SHOP_DOCUMENT_TYPES.OWNER_AADHAAR,
};

const EXT_BY_MIME: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

function parseBase64DataUri(dataUri: string): { buffer: Buffer; ext: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUri.trim());
  if (!match) return null;
  let buffer: Buffer;
  try {
    buffer = Buffer.from(match[2], 'base64');
  } catch {
    return null;
  }
  if (!buffer.length) return null;
  return { buffer, ext: EXT_BY_MIME[match[1]] || '' };
}

function writeUploadedFile(shopId: string, buffer: Buffer, ext: string): { fileUrl: string; fileKey: string } {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const cleanShopId = shopId.replace(/[^a-zA-Z0-9]/g, '');
  const uniqueName = `${cleanShopId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
  fs.writeFileSync(path.join(uploadDir, uniqueName), buffer);
  return { fileUrl: `/api/uploads/${uniqueName}`, fileKey: uniqueName };
}

// Derives a fileKey from a legacy fileUrl of the form `/api/uploads/<name>`
// (or bare `<name>`) so we always have a stable, non-null fileKey.
function fileKeyFromUrl(fileUrl: string): string {
  const parts = fileUrl.split('/');
  return parts[parts.length - 1] || fileUrl;
}

interface Stats {
  shopsScanned: number;
  shopsWithLegacyDocs: number;
  documentsCreated: number;
  documentsSkippedAlreadyMigrated: number;
  shopsUpdated: number;
  errors: Array<{ shopId: string; error: string }>;
}

async function run() {
  const prisma = new PrismaClient();
  const stats: Stats = {
    shopsScanned: 0,
    shopsWithLegacyDocs: 0,
    documentsCreated: 0,
    documentsSkippedAlreadyMigrated: 0,
    shopsUpdated: 0,
    errors: [],
  };

  console.log(`\n=== Shop document migration${DRY_RUN ? ' (DRY RUN - no writes)' : ''} ===\n`);

  const shops = await prisma.shop.findMany({
    select: { id: true, name: true, companyDetails: true },
  });
  stats.shopsScanned = shops.length;

  for (const shop of shops) {
    if (!shop.companyDetails) continue;

    let details: Record<string, any>;
    try {
      details = JSON.parse(shop.companyDetails);
    } catch {
      continue; // not valid JSON - nothing to migrate for this shop
    }

    const legacyKeysPresent = Object.keys(LEGACY_KEY_TO_TYPE).filter((k) => details[k]);
    if (legacyKeysPresent.length === 0) continue;

    stats.shopsWithLegacyDocs++;
    let anyMigratedForShop = false;

    for (const legacyKey of legacyKeysPresent) {
      const documentType = LEGACY_KEY_TO_TYPE[legacyKey];
      const value = details[legacyKey];

      try {
        // Idempotency: skip if this shop already has an active ShopDocument
        // of this type (e.g. from a prior partial run, or because
        // persistShopDocuments already handled it going forward).
        const existing = await prisma.shopDocument.findFirst({
          where: { shopId: shop.id, documentType, deletedAt: null },
        });
        if (existing) {
          stats.documentsSkippedAlreadyMigrated++;
          delete details[legacyKey];
          anyMigratedForShop = true;
          continue;
        }

        let fileUrl: string;
        let fileKey: string;
        let fileSize = 0;

        if (typeof value === 'string' && value.startsWith('data:')) {
          // Shape 1: base64 data URI - decode and write a real file.
          const parsed = parseBase64DataUri(value);
          if (!parsed) {
            throw new Error(`Unparseable base64 data URI for ${legacyKey}`);
          }
          if (!DRY_RUN) {
            const upload = writeUploadedFile(shop.id, parsed.buffer, parsed.ext);
            fileUrl = upload.fileUrl;
            fileKey = upload.fileKey;
          } else {
            fileUrl = '(dry-run: file would be written)';
            fileKey = '(dry-run)';
          }
          fileSize = parsed.buffer.length;
        } else if (typeof value === 'object' && value !== null && value.fileUrl) {
          // Shape 2: already-uploaded { fileUrl, fileKey } pointer.
          fileUrl = value.fileUrl;
          fileKey = value.fileKey || fileKeyFromUrl(value.fileUrl);
        } else if (typeof value === 'string' && value.trim()) {
          // Shape 3: plain fileUrl string, no fileKey.
          fileUrl = value;
          fileKey = fileKeyFromUrl(value);
        } else {
          // Unrecognized/empty shape - leave it alone rather than guess.
          continue;
        }

        if (!DRY_RUN) {
          await prisma.shopDocument.create({
            data: { shopId: shop.id, documentType, fileUrl, fileKey, fileSize },
          });
        }
        stats.documentsCreated++;
        delete details[legacyKey];
        anyMigratedForShop = true;
        console.log(`  [OK] ${shop.name} (${shop.id}): migrated ${legacyKey} -> ShopDocument(${documentType})`);
      } catch (err: any) {
        stats.errors.push({ shopId: shop.id, error: `${legacyKey}: ${err.message || err}` });
        console.error(`  [ERROR] ${shop.name} (${shop.id}) - ${legacyKey}: ${err.message || err}`);
      }
    }

    if (anyMigratedForShop && !DRY_RUN) {
      await prisma.shop.update({
        where: { id: shop.id },
        data: { companyDetails: JSON.stringify(details) },
      });
      stats.shopsUpdated++;
    }
  }

  console.log(`\n=== Migration summary ===`);
  console.log(`Shops scanned:                    ${stats.shopsScanned}`);
  console.log(`Shops with legacy embedded docs:  ${stats.shopsWithLegacyDocs}`);
  console.log(`ShopDocument rows created:        ${stats.documentsCreated}`);
  console.log(`Skipped (already migrated):       ${stats.documentsSkippedAlreadyMigrated}`);
  console.log(`Shops with companyDetails updated:${stats.shopsUpdated}`);
  console.log(`Errors:                           ${stats.errors.length}`);
  if (stats.errors.length) {
    console.log('\nError details:');
    for (const e of stats.errors) console.log(`  - shop ${e.shopId}: ${e.error}`);
  }
  if (DRY_RUN) console.log('\n(Dry run - no data was written. Re-run without --dry-run to apply.)');

  await prisma.$disconnect();
  process.exit(stats.errors.length ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal error running migration script:', err);
  process.exit(1);
});
