# KEE Database Refactor — Migration Report

**Date:** 2026-07-17
**Scope:** Relational document storage, soft delete, referential integrity, and centralized
tenant-scoping for the KEE backend (`c:\kee\backend`).

---

## 1. Summary

This refactor replaced ad-hoc JSON-embedded document storage with a proper relational model,
introduced a consistent, centrally-enforced soft-delete convention across all major entities,
and reviewed/hardened primary keys, foreign keys, unique constraints, indexes, and cascade
rules. All existing API surfaces continue to work unchanged from the client's perspective; the
data-access layer was fixed underneath them.

Two Prisma migrations implement the schema changes, one data-migration script moves legacy
embedded documents into the new table, and a Jest suite (38 tests, 5 suites) now exercises the
critical multi-tenant / soft-delete logic. Live end-to-end verification against the running dev
server was performed with real HTTP requests (not just unit tests) to confirm the fix behaves
correctly for actual API consumers (Shop Admin and Super Admin panels).

---

## 2. Schema Changes

### 2.1 New table: `ShopDocument`

Replaces the legacy `Shop.companyDetails` JSON blob's embedded `shopPhoto` / `shopLicense` /
`ownerAadhaar` fields with a proper relational table, mirroring the existing `CustomerDocument`
pattern for consistency:

```
ShopDocument
  id            String   @id @default(uuid())
  shopId        String
  shop          Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  documentType  String   -- 'SHOP_PHOTO' | 'SHOP_LICENSE' | 'OWNER_AADHAAR' (free-form, not enum)
  fileUrl       String
  fileKey       String
  fileSize      Int      @default(0)
  deletedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([shopId])
  @@index([shopId, documentType])
  @@index([deletedAt])
```

`companyDetails` is retained on `Shop` for genuinely scalar business fields (address, GST
number, phone, WhatsApp number) — only the three document-shaped keys were extracted.

### 2.2 Soft delete (`deletedAt`) added to

`Shop`, `User`, `MasterKey`, `Customer`, `CustomerDocument`, `Product` (in addition to the
already-relational `ShopDocument`, `CustomerDocument`). `Order`/`OrderItem` intentionally do
**not** get a `deletedAt` column — they are immutable financial/transactional records that are
status-transitioned, never deleted. `ActivityLog` is an append-only audit trail and likewise has
no `deletedAt`.

### 2.3 Indexes added

| Table | Index | Reason |
|---|---|---|
| `Shop` | `deletedAt` | fast active-row filtering |
| `User` | `shopId`, `deletedAt` | tenant scoping + active filtering |
| `MasterKey` | `deletedAt` | active filtering |
| `Customer` | `masterKeyId`, `(shopId, deletedAt)`, `(shopId, phone)` | FK lookups, combined tenant+active filter (most common query shape), phone search |
| `CustomerDocument` | `customerId`, `deletedAt` | FK lookups, active filtering |
| `ShopDocument` | `shopId`, `(shopId, documentType)`, `deletedAt` | FK lookups, per-type lookup (e.g. "get the shop's license doc"), active filtering |
| `Product` | `deletedAt` | active filtering |
| `ActivityLog` | `shopId`, `userId`, `action` | dashboard/activity queries |
| `Notification` | `shopId` | tenant scoping |
| `Order` | `(shopId, status)` | order-list filtering |
| `OrderItem` | `orderId`, `productId` | FK lookups |
| `Subscription` | `shopId`, `(shopId, status)` | active-subscription lookups |

### 2.4 Cascade rules (reviewed, confirmed correct)

- `User.shopId → Shop.id`: `ON DELETE CASCADE` — a shop's admin users are removed with it.
- `Subscription.shopId → Shop.id`: `CASCADE`.
- `MasterKey.shopId → Shop.id`: `CASCADE` (shop-scoped keys only; global catalog entries have
  `shopId = null`).
- `Customer.shopId → Shop.id`: `CASCADE`.
- `Customer.masterKeyId → MasterKey.id`: `SET NULL` — deleting a master key blank must not
  destroy the customer record that referenced it.
- `CustomerDocument.customerId → Customer.id`: `CASCADE`.
- `ShopDocument.shopId → Shop.id`: `CASCADE` (new).
- `ActivityLog.shopId → Shop.id`: `SET NULL` (audit trail must survive shop deletion).
- `ActivityLog.userId → User.id`: `CASCADE`.
- `Notification.shopId → Shop.id`: `SET NULL` (system-wide notifications have `shopId = null`
  already; shop-specific ones are cleared, not deleted, if the shop goes away).
- `Order.shopId → Shop.id`: `CASCADE`.
- `OrderItem.orderId → Order.id`: `CASCADE`.
- `OrderItem.productId → Product.id`: `RESTRICT` — intentional: prevents deleting a product
  that appears in historical order line items (guarded in `ProductService.deleteProduct`, which
  soft-deletes via `status = INACTIVE` instead when the product has order history).

All of the above were true before this refactor as well; they were audited, not changed, except
for the new `ShopDocument.shopId → Shop.id CASCADE` relation.

### 2.5 Migrations applied

1. `20260717113455_baseline` — snapshot of pre-existing schema (baseline for a previously
   unmigrated dev database).
2. `20260717113900_shop_documents_soft_delete_and_indexes` — adds `ShopDocument` table,
   `deletedAt` columns, and the indexes listed above. See
   `prisma/migrations/20260717113900_shop_documents_soft_delete_and_indexes/migration.sql` for
   the exact SQL executed.

Both migrations have been applied to the dev database (`npx prisma migrate deploy` /
`migrate dev`, confirmed via `npx prisma migrate status` showing no pending migrations).

---

## 3. Data Migration

**Script:** `scripts/migrate-shop-documents.ts`
**Purpose:** move legacy `companyDetails.{shopPhoto,shopLicense,ownerAadhaar}` values into
`ShopDocument` rows, then strip the migrated keys from the JSON blob.

### 3.1 Handling of legacy data shapes

The script defensively handles three shapes found in production/dev data, depending on which
historical code path wrote them:

1. **Base64 data URI string** (`data:image/png;base64,...`) — written by the original
   registration wizard / Super Admin "Provision Shop" form. Decoded and written to disk as a
   real file under `public/uploads/`, then referenced via a new `ShopDocument` row.
2. **`{ fileUrl, fileKey }` object** — written by the old Shop Settings upload flow, which
   already used `FileService.uploadFile()` internally but stored the pointer in the JSON blob
   instead of a relational row. Directly re-pointed into `ShopDocument`.
3. **Plain `fileUrl` string** (no `fileKey`) — a defensive case for older/partial records.
   `fileKey` is synthesized from the URL's trailing path segment.

### 3.2 Idempotency & safety

- The script is safe to re-run: for each `(shopId, documentType)` pair it first checks whether
  an active (`deletedAt: null`) `ShopDocument` already exists, and skips if so.
- Supports `--dry-run` (report-only, no writes) for pre-flight review.
- Errors for individual shops/documents are collected and reported at the end rather than
  aborting the whole run, so one malformed record cannot block migration of the rest.
- No destructive action is taken until the corresponding `ShopDocument` row (or file, in the
  base64 case) is successfully created — `companyDetails` is only rewritten (to drop the
  migrated key) after the row exists.

### 3.3 Execution result (dev database)

```
Shops scanned:                    5
Shops with legacy embedded docs:  1
ShopDocument rows created:        3
Skipped (already migrated):       0
Shops with companyDetails updated:1
Errors:                           0
```

Verified post-migration via the live API (`GET /api/super/shops`): the migrated shop ("Doc
Verify Shop") now reports 3 `ShopDocument` rows and a `companyDetails` blob containing only the
scalar business fields (`address`, `gst`, `phone`, `whatsappNumber`) — the three legacy document
keys are gone. All other shops in the dev database were provisioned after the refactor landed
and already write directly to `ShopDocument`, so they had nothing to migrate (0 legacy keys
found).

### 3.4 Rollback plan

The migration is additive and non-destructive at the row level (original file bytes for
base64-shape documents are preserved as new files, not overwritten in place; the JSON blob edit
only removes now-redundant keys, it doesn't delete anything irreplaceable). To roll back:

1. Restore `companyDetails` from a pre-migration DB backup/snapshot (standard practice before
   running any data migration against production).
2. The `ShopDocument` rows created by the migration can be identified by `createdAt` timestamp
   matching the migration run and safely deleted if reverting.

---

## 4. Production-Impacting Bugs Found & Fixed During This Work

The new Jest integration suite (`tenant.service.spec.ts`) and subsequent live E2E verification
surfaced three real defects, all fixed as part of this refactor:

1. **Prisma Proxy delegate-binding bug** (`tenant.service.ts`) — model delegates accessed via
   `this.<model>` inside the extension's query hook silently resolved to `undefined`
   (`TypeError: Cannot read properties of undefined (reading 'update')`) because Prisma Client
   instances are a Proxy, and `this` inside a subclass method is bound to the Proxy's internal
   target, not the Proxy itself. Fixed by capturing raw delegates once in the constructor (where
   `this` correctly resolves to the Proxy per JS derived-class semantics) into a `_rawDelegates`
   map, referenced from the query hook instead of `this`.

2. **AsyncLocalStorage context loss for lazy Prisma promises** (`tenant.context.ts`) —
   `runWithTenantContext(context, fn)` could silently lose the tenant/soft-delete context if
   `fn` returned an un-awaited lazy Prisma "PrismaPromise" without itself awaiting it, because
   `AsyncLocalStorage.run()` only guarantees context propagation for the synchronous extent of
   the callback. Fixed by wrapping the callback in `async () => await fn()`, forcing `.then()`
   registration to happen synchronously inside the ALS-active scope.

3. **Soft-deleted `CustomerDocument` rows leaking through nested `include`** — the
   `$allOperations` Prisma extension hook only filters the *top-level* queried model; nested
   `include`/`select` relations are resolved via a separate join/query that the hook does not
   intercept (this limitation is explicitly documented in `tenant.service.ts`). Four methods in
   `customer.service.ts` (`getCustomers`, `getCustomerById`, `getSuperCustomers`,
   `getSuperCustomerById`) and one in `report.service.ts` (`getShopReport`) used
   `include: { documents: true }` without an explicit `deletedAt: null` filter, so a
   soft-deleted customer document remained visible (and counted) in API responses after
   "deletion". Fixed by changing all five call sites to
   `include: { documents: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } } }`,
   matching the pattern already used correctly in `shop.service.ts` for `ShopDocument`.
   Confirmed fixed via live E2E curl testing: upload → soft-delete → re-fetch now correctly
   returns an empty `documents: []` array and `documentsCount: 0` on all four customer read
   paths and the shop report.

None of these were caught by manual testing before this refactor because they only manifest
under specific conditions (proxy-bound `this`, non-awaited lazy promises, and nested-include
soft-delete filtering) that are easy to overlook in day-to-day development but are exactly the
kind of thing a systematic test suite is designed to catch.

---

## 5. Verification Performed

- `npx tsc --noEmit` — zero type errors.
- `npx jest` — 5 suites / 38 tests, all passing.
- Live E2E verification against the running dev server (`npm run start:dev`), covering:
  - Shop registration → Super Admin approval → Shop Admin login flow.
  - Shop provisioning with document upload → `ShopDocument` row creation.
  - `GET /api/super/shops` / `GET /api/shop/settings` correctly return `documents` +
    `subscriptions` relations.
  - Customer creation with tenant-context-based `shopId` auto-injection (validates the
    AsyncLocalStorage fix end-to-end, not just in the Jest environment).
  - Customer document upload → soft-delete → re-fetch (validates the nested-include fix on all
    four affected `customer.service.ts` methods, both Shop Admin and Super Admin variants).
  - Shop report `documentsCount` reflects soft-deleted documents correctly (0, not 1).
  - All test artifacts created during E2E verification were cleaned up afterward (hard-deleted
    from the dev database via a one-off script — see `git log`/this report; the script itself
    was deleted after use, not committed).

---

## 6. Non-Goals / Explicitly Out of Scope

- Physical file cleanup for soft-deleted documents (orphaned files on disk past a retention
  window) is intentionally deferred to a future scheduled housekeeping job, not the request
  path — see the comment in `customer.service.ts::deleteCustomerDocument`.
- A `DELETE /api/shop/customers/:id` (customer-record-level delete) endpoint does not exist and
  was not added; only document-level soft delete was in scope.
- Restoring soft-deleted rows via a "view deleted / restore" admin screen is supported at the
  data-model level (soft delete instead of hard delete) but no UI for it was requested or built
  in this refactor.
