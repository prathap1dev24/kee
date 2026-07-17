import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextPayload {
  shopId: string | null;
  role: string;
  userId: string;
}

export const tenantLocalStorage = new AsyncLocalStorage<TenantContextPayload>();

export function getTenantContext(): TenantContextPayload | undefined {
  return tenantLocalStorage.getStore();
}

// NOTE on the `async () => await fn()` wrapper below (do not "simplify" this to
// `tenantLocalStorage.run(context, fn)`):
//
// Prisma's query methods (e.g. `tenantService.prisma.customer.create(...)`) return
// *lazy* thenables ("PrismaPromise") - the actual query (and therefore the
// TenantService `$allOperations` extension hook that reads this context) does not
// run until something calls `.then()`/awaits the returned value. `AsyncLocalStorage
// .run(store, callback)` only guarantees `getStore()` returns `store` for the
// synchronous duration of `callback`, plus any continuation whose `.then()`
// registration happened *during* that synchronous window.
//
// If `callback` is a plain (non-async) function that just does
// `return someLazyPrismaCall()` without awaiting it, `.run()` returns immediately
// with that still-pending thenable, popping the ALS store before anyone has called
// `.then()` on it. Whoever awaits the result afterwards (a caller further up the
// stack) triggers the actual query dispatch *outside* the tenant context, so
// `getTenantContext()` reads back `undefined` inside the extension hook - silently
// disabling both tenant scoping and soft-delete filtering for that call.
//
// Wrapping `fn` in `async () => await fn()` forces the `.then()` registration to
// happen synchronously, inside this function's own execution - which itself runs
// synchronously inside `tenantLocalStorage.run()` - so the continuation is
// causally linked to (and inherits) the active store even though the query itself
// resolves later, asynchronously.
export function runWithTenantContext<T>(context: TenantContextPayload, fn: () => T | Promise<T>): Promise<T> {
  return tenantLocalStorage.run(context, async () => await fn());
}
