# KEE Backend — Developer Guide: Tenant Scoping & Soft Delete

This document explains how multi-tenant row scoping and soft delete work in the KEE backend,
and what conventions to follow when adding new models or services. Read this before writing any
new Prisma query in this codebase.

---

## 1. The golden rule: always use `tenantService.prisma`, never `tenantService.<model>`

```ts
// Correct
await this.tenantService.prisma.customer.findMany({ where: { shopId } });

// Wrong — bypasses soft-delete filtering AND tenant scoping entirely
await this.tenantService.customer.findMany({ where: { shopId } });
```

`TenantService` (in `src/tenant/tenant.service.ts`) extends `PrismaClient` directly, so
`tenantService.customer` etc. still resolve (they're the raw, unextended delegates) — nothing
will throw, it will just silently skip all tenant/soft-delete enforcement. This is the most
dangerous failure mode in the codebase: it compiles, it runs, it returns data, and the data is
subtly wrong (includes other shops' rows, includes soft-deleted rows). Always go through
`.prisma`.

## 2. What `tenantService.prisma` automatically does for you

It's a single Prisma Client Extension (`$extends`) registered once, applied to every query on
every model, that does two things:

### 2.1 Soft delete enforcement

For models in `SOFT_DELETE_MODELS` (`Shop`, `User`, `MasterKey`, `Customer`, `CustomerDocument`,
`ShopDocument`, `Product`):

- `delete` / `deleteMany` are transparently rewritten into `update` / `updateMany` that set
  `deletedAt: new Date()`. **No application code should ever expect a `.delete()` call on these
  models to actually remove the row** — it soft-deletes.
- All read operations (`findFirst`, `findMany`, `findUnique`, `count`, `aggregate`, `groupBy`,
  `update`, `updateMany`, `upsert`, plus the `OrThrow` variants) automatically get
  `where: { deletedAt: null }` merged in, UNLESS the caller already specified a `deletedAt`
  filter explicitly (e.g. to build a future "show deleted" admin view).

### 2.2 Tenant (shopId) row-level scoping

For models in `TENANT_SCOPED_MODELS` (`Customer`, `Subscription`, `User`, `ActivityLog`,
`Notification`), when there's an active Shop Admin request context (see §3), all query/mutation
operations are automatically scoped to `shopId: context.shopId`, and `create`/`createMany`
automatically inject the current shop's ID if the caller didn't already supply one.

This only fires when `getTenantContext()` returns a context **with `shopId` set** — i.e. a Shop
Admin request. Super Admin requests (`shopId: null` in the JWT) are never row-scoped by this
mechanism; Super Admin services are expected to pass explicit `where` filters when they need to
scope to a specific shop (e.g. `getShopById(id)`).

## 3. How the tenant context gets set

`TenantInterceptor` (`src/tenant/tenant.interceptor.ts`) runs on every request, reads the
authenticated user's JWT payload, and wraps the rest of the request pipeline in
`runWithTenantContext({ shopId, role, userId }, () => next.handle().subscribe(...))`.

`runWithTenantContext` (`src/tenant/tenant.context.ts`) uses Node's `AsyncLocalStorage` so that
any code running anywhere in the async call chain of that request — no matter how many
services/awaits deep — can call `getTenantContext()` and get the right shop/user/role, without
having to thread it through every function signature manually.

**Gotcha to know about:** `AsyncLocalStorage.run(store, callback)` only guarantees
`getStore()` works for the synchronous portion of `callback`, plus any `.then()` continuation
registered during that synchronous window. Prisma query methods return *lazy* thenables — the
actual query doesn't dispatch until something awaits them. `runWithTenantContext` accounts for
this internally (see the code comment there), but if you ever write your own
`AsyncLocalStorage`-based context propagation elsewhere, remember: **a callback that returns an
un-awaited lazy promise without itself awaiting it can silently lose the ALS context** by the
time that promise is actually consumed. Always `await` inside the callback, or let
`runWithTenantContext` do it for you.

## 4. Adding soft delete to a new model

1. Add `deletedAt DateTime?` to the model in `prisma/schema.prisma`, plus `@@index([deletedAt])`
   (or a composite index like `@@index([shopId, deletedAt])` if the model is also tenant-scoped
   and that combination is a common query shape).
2. Add the model name to `SOFT_DELETE_MODELS` in `src/tenant/tenant.service.ts`.
3. Add the model to the constructor's raw-delegate capture loop — this happens automatically
   since it iterates `SOFT_DELETE_MODELS`, no extra code needed.
4. Run `npx prisma migrate dev --name <description>` to generate and apply the migration.
5. **Audit every existing nested `include`/`select` of this model elsewhere in the codebase.**
   The extension hook only filters the *top-level* queried model — it does NOT intercept nested
   relation includes (Prisma resolves those via a separate join/query). If another service does
   `someModel.findMany({ include: { <yourNewModel>: true } })`, soft-deleted rows of your new
   model WILL leak into that response. You must filter explicitly:
   ```ts
   include: { yourNewModel: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } } }
   ```
   This bit the codebase once already — see `docs/MIGRATION_REPORT.md` §4.3 for the real bug
   this caused in `customer.service.ts` / `report.service.ts`, fixed by adopting this exact
   pattern (mirrors `shop.service.ts`'s pre-existing `ACTIVE_DOCUMENTS_INCLUDE` convention).

## 5. Adding tenant scoping to a new model

1. Add the model name to `TENANT_SCOPED_MODELS` in `src/tenant/tenant.service.ts`.
2. If the model's `create` input is relation-based rather than a bare `shopId` scalar in some
   code paths, double check the auto-injection logic in the extension (`operation === 'create'`
   branch) — it injects `shop: { connect: { id: context.shopId } } }` only when the caller
   omitted both `shopId` and `shop` from `data`, to match whichever create-input variant Prisma's
   client-side validator already resolved against based on the original argument shape. See the
   code comment there for why a bare scalar injection after the fact does not work.
3. If the model needs different `where`-merging behavior than a flat `shopId` scalar (e.g.
   `Notification`'s "shop-specific OR global" `OR` clause), add a model-specific branch — don't
   assume every tenant-scoped model wants the same merge strategy.

## 6. Document storage convention (`ShopDocument` / `CustomerDocument`)

Both follow the same shape: `id`, owning-entity FK, `documentType` (free-form string, not an
enum, so new categories don't require a migration), `fileUrl`, `fileKey`, `fileSize`,
`deletedAt`, timestamps. Files are uploaded via `FileService.uploadFile()` (shared across
modules via `FileModule` to avoid circular dependencies) and referenced by pointer, not stored
as base64 in the database. **Do not add new base64-embedded-in-JSON document fields** — this
refactor specifically eliminated that pattern (see `docs/MIGRATION_REPORT.md` §2.1); use a
proper document table instead.

Physical files are intentionally NOT deleted when a document row is soft-deleted (see the code
comment in `customer.service.ts::deleteCustomerDocument`) — retained on disk in case of restore,
with physical cleanup deferred to a future scheduled housekeeping job.

## 7. Testing

Jest is configured for this project (`jest.config.js` / `package.json` `jest` block). Run the
full suite with:

```
cd backend
npx jest
```

Key test files:

- `src/tenant/tenant.service.spec.ts` — integration tests against a real (test) database for
  the soft-delete + tenant-scoping extension itself. Uses a `__jest_tenant_test__`-prefixed
  naming convention for test data so it's identifiable/cleanable.
- `src/shop/shop.service.spec.ts`, `src/customer/customer.service.spec.ts` — unit tests
  (mocked `TenantService`) for service-layer logic, including assertions on the exact `include`
  shape passed to Prisma (e.g. `expect(includeArg.documents).toEqual({ where: { deletedAt: null
  }, ... })`) — this is the pattern to follow when adding a regression test for the
  nested-include soft-delete filtering described in §4.
- `src/common/base64.util.spec.ts`, `src/common/shop-document.util.spec.ts` — utility unit
  tests.

When adding a new service method that reads a soft-deletable relation via `include`/`select`,
add an assertion on the `include` argument shape (not just the returned data) — mocked unit
tests can't catch the leak itself (the mock just returns whatever you tell it to), but they can
catch a regression where someone changes `include: { documents: { where: { deletedAt: null } } }`
back to `include: { documents: true }` without meaning to.

## 8. Manual/E2E verification checklist

For any change touching tenant scoping or soft delete, verify against a running dev server (not
just Jest) at least once:

1. `npm run start:dev` and confirm all routes map successfully in the log (no startup errors).
2. Log in as Shop Admin A, create a row, confirm Shop Admin B (different shop) cannot see it via
   list/get endpoints.
3. Soft-delete a row (or a nested document), re-fetch the parent, confirm the deleted row/nested
   document is excluded — including from any `count`/aggregate fields derived from it (this is
   exactly the class of bug found in `report.service.ts`'s `documentsCount`).
4. Repeat the read-after-soft-delete check from the Super Admin endpoints too, if the model is
   also exposed there — the two code paths (`getX` vs `getSuperX`) are separate methods and can
   drift independently, as they did before this fix.
