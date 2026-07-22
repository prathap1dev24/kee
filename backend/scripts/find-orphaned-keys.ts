// One-off scan: finds shop-scoped MasterKey rows (created via the shop-admin customer-
// registration wizard, either matched against the catalog or auto-registered inline)
// that have zero customers referencing them - i.e. orphans left behind by the two-request
// race that customer.service.ts's createCustomer() transaction now closes. Pre-existing
// orphans from before the fix (like TN69097) still need a one-time cleanup since the
// fix only prevents *new* orphans, it doesn't retroactively repair old ones. Global/legacy
// catalog entries (shopId null) are intentionally excluded - those aren't tied to any one
// customer by design.
//
// Usage:
//   npx ts-node scripts/find-orphaned-keys.ts            (dry run, lists only)
//   npx ts-node scripts/find-orphaned-keys.ts --delete    (soft-deletes the orphans found)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const doDelete = process.argv.includes('--delete');

  const shopKeys = await prisma.masterKey.findMany({
    where: { deletedAt: null, shopId: { not: null } },
    include: { shop: { select: { name: true } } },
  });

  const orphans: typeof shopKeys = [];
  for (const key of shopKeys) {
    const customerCount = await prisma.customer.count({
      where: { deletedAt: null, OR: [{ masterKeyId: key.id }, { shopId: key.shopId ?? undefined, keyNumber: key.keyNumber }] },
    });
    if (customerCount === 0) orphans.push(key);
  }

  console.log(`Scanned ${shopKeys.length} shop-scoped key(s); found ${orphans.length} orphan(s) with zero customers:`);
  for (const o of orphans) {
    console.log(`  - ${o.keyNumber} (id=${o.id}, shop=${o.shop?.name ?? 'unknown'}, createdAt=${o.createdAt.toISOString()})`);
  }

  if (doDelete && orphans.length > 0) {
    const now = new Date();
    await prisma.masterKey.updateMany({
      where: { id: { in: orphans.map(o => o.id) } },
      data: { deletedAt: now },
    });
    console.log(`\nSoft-deleted ${orphans.length} orphaned key(s).`);
  } else if (orphans.length > 0) {
    console.log('\nDry run only - re-run with --delete to soft-delete these rows.');
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
