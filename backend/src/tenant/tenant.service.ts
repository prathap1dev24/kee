import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getTenantContext } from './tenant.context';

// Models that participate in the application-wide soft-delete convention: rows are
// never physically removed by application code, they are marked with a `deletedAt`
// timestamp instead. Every read through `TenantService.prisma` automatically excludes
// soft-deleted rows unless the caller explicitly supplies its own `deletedAt` filter
// (e.g. to power a future "view deleted / restore" screen).
//
// NOTE: this only filters the *top-level* query for the model being queried. Nested
// `include`/`select` relations (e.g. `masterKey.findMany({ include: { shop: true } })`)
// are resolved by Prisma via a join/batched query that this extension does not
// intercept, so a soft-deleted related row can still surface inside a nested include.
// Application code that needs to guarantee a related row is active must filter
// explicitly (see key.service.ts for an example).
const SOFT_DELETE_MODELS = ['Shop', 'User', 'MasterKey', 'Customer', 'CustomerDocument', 'ShopDocument', 'Promotion'];

// Tenant (shopId) row-level scoping applies to these models when a Shop Admin's
// request context is active.
const TENANT_SCOPED_MODELS = ['Customer', 'Subscription', 'User', 'ActivityLog', 'Notification'];

function delegateName(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

@Injectable()
export class TenantService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private _extendedClient: any;

  // Raw (unextended) per-model delegates, captured once here in the constructor.
  //
  // WHY: `PrismaClient` instances are actually a Proxy wrapping an internal target -
  // property access like `this.shop` only resolves to a real model delegate when it
  // goes *through that proxy* (e.g. `new TenantService().shop`, or any access from
  // outside the class). Inside a method/getter defined on this subclass (like
  // `get prisma()` below), `this` is bound to the proxy's internal target, not the
  // proxy itself, so `this.shop` resolves to `undefined` there - the delegate lookup
  // silently fails at runtime (`Cannot read properties of undefined (reading 'update')`)
  // even though `this instanceof TenantService` and everything else looks normal.
  //
  // The constructor is a safe place to capture them because - per JS derived-class
  // semantics - `this` inside a derived constructor, immediately after `super()`
  // returns, *is* the object `super()` returned (the Proxy), so `this.shop` etc.
  // resolve correctly right here. We snapshot them into a plain object so the
  // extension's query hook (which cannot rely on `this` either - see above, and also
  // because `this` there is bound to the extension config, not the class instance)
  // can look them up without ever touching `this` again.
  private readonly _rawDelegates: Record<string, any> = {};

  constructor() {
    super({
      log: ['error', 'warn'],
    });
    for (const model of SOFT_DELETE_MODELS) {
      this._rawDelegates[model] = (this as any)[delegateName(model)];
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  get prisma() {
    if (!this._extendedClient) {
      // Do NOT use `this` inside the query callbacks below for delegate lookups (see
      // the `_rawDelegates` comment above for why) - use the pre-captured map instead.
      const rawDelegates = this._rawDelegates;

      this._extendedClient = this.$extends({
        query: {
          $allModels: {
            async $allOperations({ model, operation, args, query }) {
              const context = getTenantContext();
              const queryArgs = args as any;

              // ==========================================
              // 1. TENANT (shopId) ROW-LEVEL SCOPING
              // ==========================================
              // Only enforce row-level filtering if:
              // 1. Request context is active
              // 2. shopId is set in the context (means it's a Shop Admin request)
              // 3. Model is tenant-scoped
              if (context && context.shopId && TENANT_SCOPED_MODELS.includes(model)) {
                // Enforce filter for query operations
                if ([
                  'findFirst',
                  'findMany',
                  'update',
                  'updateMany',
                  'delete',
                  'deleteMany',
                  'count',
                  'aggregate',
                  'groupBy'
                ].includes(operation)) {
                  queryArgs.where = queryArgs.where || {};

                  if (model === 'User') {
                    queryArgs.where.shopId = context.shopId;
                  } else if (model === 'Notification') {
                    // Shop Admins see notifications for their own shop, plus true
                    // global broadcasts (shopId: null AND audience: 'SHOP'). They must
                    // NOT see shopId: null notifications tagged audience: 'SUPER_ADMIN'
                    // (e.g. "new shop X requests approval") - those are internal to the
                    // Super Admin panel and were leaking to every shop admin before the
                    // `audience` column existed (see migration
                    // 20260717120000_notification_audience_scoping).
                    const currentWhere = { ...queryArgs.where };
                    delete currentWhere.shopId; // Ensure we don't double filter
                    queryArgs.where = {
                      ...currentWhere,
                      OR: [
                        { shopId: context.shopId },
                        { shopId: null, audience: 'SHOP' }
                      ]
                    };
                  } else {
                    queryArgs.where.shopId = context.shopId;
                  }
                }

                // Enforce context shopId for create operations.
                //
                // If the caller already supplied `shopId` (the normal/expected pattern
                // throughout the existing services - e.g. CustomerService.addCustomer
                // passes `data: { shopId, ... }` explicitly), leave it untouched: Prisma's
                // client-side argument validator picks which variant of the create input
                // union (relation-based "Checked" vs scalar-FK "Unchecked") to validate
                // against based on the ORIGINAL shape of `data` as passed by the caller,
                // before this hook runs. So if the caller omitted shopId entirely, injecting
                // a bare `shopId` scalar here does NOT satisfy validation (it still expects
                // a `shop` relation object and throws "Argument `shop` is missing") even
                // though the mutation happens before the query executes. In that case we
                // must inject via the relation-connect shape instead, matching what the
                // validator resolved to.
                if (operation === 'create') {
                  queryArgs.data = queryArgs.data || {};
                  if (model !== 'User' && queryArgs.data.shopId === undefined && queryArgs.data.shop === undefined) {
                    queryArgs.data.shop = { connect: { id: context.shopId } };
                  }
                }

                if (operation === 'createMany') {
                  if (Array.isArray(queryArgs.data)) {
                    queryArgs.data.forEach((item: any) => {
                      item.shopId = context.shopId;
                    });
                  } else if (queryArgs.data) {
                    queryArgs.data.shopId = context.shopId;
                  }
                }
              }

              // ==========================================
              // 2. SOFT DELETE ENFORCEMENT (consistent across all applicable models)
              // ==========================================
              if (SOFT_DELETE_MODELS.includes(model)) {
                const delegate = rawDelegates[model];

                if (operation === 'delete') {
                  return delegate.update({
                    where: { ...queryArgs.where, deletedAt: queryArgs.where?.deletedAt ?? null },
                    data: { deletedAt: new Date() },
                  });
                }

                if (operation === 'deleteMany') {
                  return delegate.updateMany({
                    where: { ...queryArgs.where, deletedAt: queryArgs.where?.deletedAt ?? null },
                    data: { deletedAt: new Date() },
                  });
                }

                if ([
                  'findFirst',
                  'findFirstOrThrow',
                  'findMany',
                  'findUnique',
                  'findUniqueOrThrow',
                  'count',
                  'aggregate',
                  'groupBy',
                  'update',
                  'updateMany',
                ].includes(operation)) {
                  queryArgs.where = queryArgs.where || {};
                  if (queryArgs.where.deletedAt === undefined) {
                    queryArgs.where.deletedAt = null;
                  }
                }

                if (operation === 'upsert') {
                  queryArgs.where = queryArgs.where || {};
                  if (queryArgs.where.deletedAt === undefined) {
                    queryArgs.where.deletedAt = null;
                  }
                }
              }

              return query(queryArgs);
            },
          },
        },
      });
    }
    return this._extendedClient;
  }
}
