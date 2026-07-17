/**
 * Generates docs/DATABASE_SCHEMA.pdf — a comprehensive database schema reference:
 * overview, conventions, a hand-laid-out ER diagram, per-table column/index/relation
 * reference, redacted live sample records pulled from the dev database, and a summary
 * of migration guidelines. Safe to re-run any time the schema changes; regenerates the
 * PDF from scratch each run.
 *
 * Usage:
 *   cd backend
 *   npx ts-node -r tsconfig-paths/register scripts/generate-schema-doc.ts
 */
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const OUT_PATH = path.join(process.cwd(), 'docs', 'DATABASE_SCHEMA.pdf');

// ============================================================================
// Table metadata (hand-maintained from prisma/schema.prisma — keep in sync)
// ============================================================================

interface ColumnDef {
  name: string;
  type: string;
  attrs: string; // PK / FK / unique / default / nullable notes
}

interface RelationDef {
  text: string;
}

interface TableDef {
  name: string;
  description: string;
  softDelete: boolean;
  tenantScoped: boolean;
  columns: ColumnDef[];
  indexes: string[];
  relations: RelationDef[];
}

const TABLES: TableDef[] = [
  {
    name: 'Shop',
    description:
      'A tenant. Represents a single key-duplication shop on the platform. The root of the ' +
      'multi-tenant hierarchy — most other tables hang off a shopId, directly or transitively.',
    softDelete: true,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'name', type: 'String', attrs: '' },
      { name: 'logoUrl', type: 'String?', attrs: 'nullable' },
      { name: 'companyDetails', type: 'String?', attrs: 'nullable, JSON text (scalar business fields only)' },
      { name: 'themeColor', type: 'String', attrs: "default '#9C27B0'" },
      { name: 'isActive', type: 'Boolean', attrs: 'default true' },
      { name: 'isApproved', type: 'Boolean', attrs: 'default false' },
      { name: 'storageUsed', type: 'BigInt', attrs: 'default 0, bytes' },
      { name: 'deletedAt', type: 'DateTime?', attrs: 'soft delete marker' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['deletedAt'],
    relations: [
      { text: 'users        1—N  User            (User.shopId, ON DELETE CASCADE)' },
      { text: 'subscriptions1—N  Subscription    (Subscription.shopId, ON DELETE CASCADE)' },
      { text: 'customers    1—N  Customer        (Customer.shopId, ON DELETE CASCADE)' },
      { text: 'documents    1—N  ShopDocument    (ShopDocument.shopId, ON DELETE CASCADE)' },
      { text: 'masterKeys   1—N  MasterKey       (MasterKey.shopId, ON DELETE CASCADE, nullable FK)' },
      { text: 'orders       1—N  Order           (Order.shopId, ON DELETE CASCADE)' },
      { text: 'activityLogs 1—N  ActivityLog     (ActivityLog.shopId, ON DELETE SET NULL, nullable FK)' },
      { text: 'notifications1—N  Notification    (Notification.shopId, ON DELETE SET NULL, nullable FK)' },
    ],
  },
  {
    name: 'User',
    description:
      'An authenticated account: either a SUPER_ADMIN (platform operator, shopId null) or a ' +
      'SHOP_ADMIN (scoped to exactly one shop).',
    softDelete: true,
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'email', type: 'String', attrs: 'UNIQUE' },
      { name: 'passwordHash', type: 'String', attrs: 'bcrypt hash' },
      { name: 'name', type: 'String', attrs: '' },
      { name: 'role', type: 'Role enum', attrs: 'SUPER_ADMIN | SHOP_ADMIN' },
      { name: 'shopId', type: 'String?', attrs: 'FK -> Shop.id, nullable (null for Super Admin)' },
      { name: 'deletedAt', type: 'DateTime?', attrs: 'soft delete marker' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['shopId', 'deletedAt'],
    relations: [
      { text: 'shop         N—1  Shop            (shopId, ON DELETE CASCADE)' },
      { text: 'activityLogs 1—N  ActivityLog     (ActivityLog.userId, ON DELETE CASCADE)' },
    ],
  },
  {
    name: 'Subscription',
    description: "A shop's billing plan period. Multiple rows accumulate over time; only the most recent is ACTIVE.",
    softDelete: false,
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'shopId', type: 'String', attrs: 'FK -> Shop.id' },
      { name: 'plan', type: 'Plan enum', attrs: 'TRIAL | MONTHLY | YEARLY' },
      { name: 'status', type: 'SubscriptionStatus enum', attrs: 'default ACTIVE; ACTIVE | SUSPENDED | EXPIRED' },
      { name: 'startDate', type: 'DateTime', attrs: '' },
      { name: 'endDate', type: 'DateTime', attrs: '' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['shopId', '(shopId, status)'],
    relations: [{ text: 'shop         N—1  Shop            (shopId, ON DELETE CASCADE)' }],
  },
  {
    name: 'MasterKey',
    description:
      'A key-blank catalog entry. shopId null = global/legacy catalog entry visible to all shops; ' +
      'shopId set = shop-specific key created during customer registration.',
    softDelete: true,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'keyNumber', type: 'String', attrs: 'UNIQUE with shopId' },
      { name: 'brand', type: 'String', attrs: '' },
      { name: 'category', type: 'String', attrs: '' },
      { name: 'blankNumber', type: 'String', attrs: '' },
      { name: 'frontImageUrl', type: 'String?', attrs: 'nullable' },
      { name: 'backImageUrl', type: 'String?', attrs: 'nullable' },
      { name: 'description', type: 'String?', attrs: 'nullable' },
      { name: 'notes', type: 'String?', attrs: 'nullable' },
      { name: 'status', type: 'KeyStatus enum', attrs: 'default ACTIVE; ACTIVE | INACTIVE' },
      { name: 'shopId', type: 'String?', attrs: 'FK -> Shop.id, nullable' },
      { name: 'deletedAt', type: 'DateTime?', attrs: 'soft delete marker' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['UNIQUE (shopId, keyNumber)', 'shopId', 'deletedAt'],
    relations: [
      { text: 'shop         N—1  Shop            (shopId, ON DELETE CASCADE, nullable)' },
      { text: 'customers    1—N  Customer        (Customer.masterKeyId, ON DELETE SET NULL, nullable)' },
    ],
  },
  {
    name: 'Customer',
    description:
      'A key-duplication customer record captured by a shop admin. idProofNumber is encrypted at ' +
      'rest (application-level, not column-level encryption).',
    softDelete: true,
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'shopId', type: 'String', attrs: 'FK -> Shop.id' },
      { name: 'name', type: 'String', attrs: '' },
      { name: 'phone', type: 'String', attrs: '' },
      { name: 'address', type: 'String?', attrs: 'nullable' },
      { name: 'idProofType', type: 'String?', attrs: 'nullable' },
      { name: 'idProofNumber', type: 'String?', attrs: 'nullable, encrypted at rest' },
      { name: 'reason', type: 'String?', attrs: 'nullable' },
      { name: 'keyNumber', type: 'String', attrs: '' },
      { name: 'vehicleNumber', type: 'String?', attrs: 'nullable' },
      { name: 'masterKeyId', type: 'String?', attrs: 'FK -> MasterKey.id, nullable' },
      { name: 'latitude / longitude', type: 'Float?', attrs: 'nullable' },
      { name: 'mapsLink', type: 'String?', attrs: 'nullable' },
      { name: 'capturedAddress', type: 'String?', attrs: 'nullable' },
      { name: 'photoUrl / signatureUrl', type: 'String?', attrs: 'nullable' },
      { name: 'deletedAt', type: 'DateTime?', attrs: 'soft delete marker' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['shopId', 'masterKeyId', '(shopId, deletedAt)', '(shopId, phone)'],
    relations: [
      { text: 'shop         N—1  Shop            (shopId, ON DELETE CASCADE)' },
      { text: 'masterKey    N—1  MasterKey       (masterKeyId, ON DELETE SET NULL, nullable)' },
      { text: 'documents    1—N  CustomerDocument(CustomerDocument.customerId, ON DELETE CASCADE)' },
    ],
  },
  {
    name: 'CustomerDocument',
    description:
      "A file attached to a customer record (ID proof scans, etc). Nested `include`s of this " +
      'relation MUST filter deletedAt: null explicitly — see docs/DEVELOPER_GUIDE.md §4.',
    softDelete: true,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'customerId', type: 'String', attrs: 'FK -> Customer.id' },
      { name: 'documentType', type: 'String', attrs: 'free-form, not an enum' },
      { name: 'fileUrl', type: 'String', attrs: '' },
      { name: 'fileKey', type: 'String', attrs: '' },
      { name: 'fileSize', type: 'Int', attrs: 'bytes' },
      { name: 'deletedAt', type: 'DateTime?', attrs: 'soft delete marker' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['customerId', 'deletedAt'],
    relations: [{ text: 'customer     N—1  Customer        (customerId, ON DELETE CASCADE)' }],
  },
  {
    name: 'ShopDocument',
    description:
      "A file attached to a shop record (shop photo, business license, owner's ID). Introduced by " +
      "this refactor to replace the legacy Shop.companyDetails.{shopPhoto,shopLicense,ownerAadhaar} " +
      'base64-embedded JSON fields. Mirrors CustomerDocument.',
    softDelete: true,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'shopId', type: 'String', attrs: 'FK -> Shop.id' },
      { name: 'documentType', type: 'String', attrs: "free-form; conventional values 'SHOP_PHOTO' | 'SHOP_LICENSE' | 'OWNER_AADHAAR'" },
      { name: 'fileUrl', type: 'String', attrs: '' },
      { name: 'fileKey', type: 'String', attrs: '' },
      { name: 'fileSize', type: 'Int', attrs: 'default 0, bytes' },
      { name: 'deletedAt', type: 'DateTime?', attrs: 'soft delete marker' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['shopId', '(shopId, documentType)', 'deletedAt'],
    relations: [{ text: 'shop         N—1  Shop            (shopId, ON DELETE CASCADE)' }],
  },
  {
    name: 'OtpCode',
    description: 'A one-time-password issued for a verification purpose (login/registration/reset). Standalone — no FKs.',
    softDelete: false,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'identifier', type: 'String', attrs: 'email/phone the OTP was sent to' },
      { name: 'method', type: 'String', attrs: "e.g. 'EMAIL' | 'SMS'" },
      { name: 'purpose', type: 'String', attrs: "e.g. 'LOGIN' | 'RESET_PASSWORD'" },
      { name: 'codeHash', type: 'String', attrs: 'hashed, never stored plaintext' },
      { name: 'consumed', type: 'Boolean', attrs: 'default false' },
      { name: 'expiresAt', type: 'DateTime', attrs: '' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
    ],
    indexes: ['(identifier, purpose)'],
    relations: [],
  },
  {
    name: 'Advertisement',
    description: 'A platform-wide or shop-targeted promotional banner/popup/notice. Standalone — no FKs (targetShops is a raw ID array, not a relation).',
    softDelete: false,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'title', type: 'String', attrs: '' },
      { name: 'imageUrl', type: 'String', attrs: '' },
      { name: 'type', type: 'AdType enum', attrs: 'POPUP | BANNER | NOTICE' },
      { name: 'startDate / endDate', type: 'DateTime', attrs: '' },
      { name: 'priority', type: 'Int', attrs: 'default 0' },
      { name: 'targetAll', type: 'Boolean', attrs: 'default true' },
      { name: 'targetShops', type: 'String[]', attrs: 'raw shop-ID array, no FK constraint' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: [],
    relations: [],
  },
  {
    name: 'ActivityLog',
    description:
      'An immutable audit-trail entry. Never soft- or hard-deleted by application code (no ' +
      'deletedAt column at all) — audit history must outlive the rows it describes.',
    softDelete: false,
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'shopId', type: 'String?', attrs: 'FK -> Shop.id, nullable' },
      { name: 'userId', type: 'String', attrs: 'FK -> User.id' },
      { name: 'action', type: 'String', attrs: "e.g. 'LOGIN', 'CUSTOMER_CREATE'" },
      { name: 'details', type: 'String', attrs: 'JSON string or description, PII masked' },
      { name: 'ipAddress', type: 'String?', attrs: 'nullable' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
    ],
    indexes: ['shopId', 'userId', 'action'],
    relations: [
      { text: 'shop         N—1  Shop            (shopId, ON DELETE SET NULL, nullable)' },
      { text: 'user         N—1  User            (userId, ON DELETE CASCADE)' },
    ],
  },
  {
    name: 'Notification',
    description: 'A shop-specific or system-wide (shopId null) announcement/alert.',
    softDelete: false,
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'shopId', type: 'String?', attrs: 'FK -> Shop.id, nullable (null = global)' },
      { name: 'title', type: 'String', attrs: '' },
      { name: 'message', type: 'String', attrs: '' },
      { name: 'type', type: 'String', attrs: "e.g. 'SUB_EXPIRY', 'NEW_KEY'" },
      { name: 'isRead', type: 'Boolean', attrs: 'default false' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
    ],
    indexes: ['shopId'],
    relations: [{ text: 'shop         N—1  Shop            (shopId, ON DELETE SET NULL, nullable)' }],
  },
  {
    name: 'RevenueRecord',
    description: 'A manually-entered platform revenue figure for a given month/year (Super Admin reporting). Standalone — no FKs.',
    softDelete: false,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'month', type: 'Int', attrs: '' },
      { name: 'year', type: 'Int', attrs: '' },
      { name: 'amount', type: 'Float', attrs: '' },
      { name: 'notes', type: 'String?', attrs: 'nullable' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: [],
    relations: [],
  },
  {
    name: 'Product',
    description: 'A catalog item sellable to shops (key blanks, machines, accessories).',
    softDelete: true,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'name', type: 'String', attrs: '' },
      { name: 'description', type: 'String?', attrs: 'nullable' },
      { name: 'price', type: 'Float', attrs: '' },
      { name: 'discountPercentage', type: 'Float', attrs: 'default 0' },
      { name: 'offerPrice', type: 'Float?', attrs: 'nullable, computed' },
      { name: 'imageUrl', type: 'String?', attrs: 'nullable' },
      { name: 'category', type: 'String', attrs: "'Key Blanks' | 'Machines' | 'Accessories'" },
      { name: 'stock', type: 'Int', attrs: 'default 0' },
      { name: 'status', type: 'KeyStatus enum', attrs: 'default ACTIVE; ACTIVE | INACTIVE' },
      { name: 'deletedAt', type: 'DateTime?', attrs: 'soft delete marker' },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['deletedAt'],
    relations: [{ text: 'orderItems   1—N  OrderItem       (OrderItem.productId, ON DELETE RESTRICT)' }],
  },
  {
    name: 'Order',
    description:
      'A shop purchase order for platform products. Transactional/financial record — intentionally ' +
      'has no deletedAt; only status-transitioned, never deleted.',
    softDelete: false,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'shopId', type: 'String', attrs: 'FK -> Shop.id' },
      { name: 'totalAmount', type: 'Float', attrs: '' },
      { name: 'status', type: 'String', attrs: "default 'PENDING'; PENDING | DISPATCHED | DELIVERED | CANCELLED" },
      { name: 'createdAt', type: 'DateTime', attrs: 'default now()' },
      { name: 'updatedAt', type: 'DateTime', attrs: 'auto-updated' },
    ],
    indexes: ['shopId', '(shopId, status)'],
    relations: [
      { text: 'shop         N—1  Shop            (shopId, ON DELETE CASCADE)' },
      { text: 'items        1—N  OrderItem       (OrderItem.orderId, ON DELETE CASCADE)' },
    ],
  },
  {
    name: 'OrderItem',
    description:
      'A line item within an order. productId is ON DELETE RESTRICT — a product with order history ' +
      'cannot be hard-deleted (ProductService.deleteProduct soft-deletes via status=INACTIVE instead).',
    softDelete: false,
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'String (uuid)', attrs: 'PK' },
      { name: 'orderId', type: 'String', attrs: 'FK -> Order.id' },
      { name: 'productId', type: 'String', attrs: 'FK -> Product.id' },
      { name: 'quantity', type: 'Int', attrs: '' },
      { name: 'price', type: 'Float', attrs: 'price at time of order (snapshot)' },
    ],
    indexes: ['orderId', 'productId'],
    relations: [
      { text: 'order        N—1  Order           (orderId, ON DELETE CASCADE)' },
      { text: 'product      N—1  Product         (productId, ON DELETE RESTRICT)' },
    ],
  },
];

// ============================================================================
// ER diagram layout (hand-placed grid; see script header for rationale)
// ============================================================================

interface Box {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  pk: string;
  fks: string[];
}

const BOX_W = 190;
const BOX_H = 92;

const BOXES: Box[] = [
  { name: 'Shop', x: 640, y: 20, w: BOX_W, h: BOX_H, pk: 'id', fks: [] },
  { name: 'User', x: 300, y: 190, w: BOX_W, h: BOX_H, pk: 'id', fks: ['shopId -> Shop'] },
  { name: 'Subscription', x: 530, y: 190, w: BOX_W, h: BOX_H, pk: 'id', fks: ['shopId -> Shop'] },
  { name: 'ShopDocument', x: 760, y: 190, w: BOX_W, h: BOX_H, pk: 'id', fks: ['shopId -> Shop'] },
  { name: 'MasterKey', x: 990, y: 190, w: BOX_W, h: BOX_H, pk: 'id', fks: ['shopId -> Shop (null)'] },
  { name: 'ActivityLog', x: 60, y: 350, w: BOX_W, h: BOX_H, pk: 'id', fks: ['shopId -> Shop (null)', 'userId -> User'] },
  { name: 'Customer', x: 530, y: 350, w: BOX_W, h: BOX_H, pk: 'id', fks: ['shopId -> Shop', 'masterKeyId -> MasterKey (null)'] },
  { name: 'Notification', x: 990, y: 350, w: BOX_W, h: BOX_H, pk: 'id', fks: ['shopId -> Shop (null)'] },
  { name: 'CustomerDocument', x: 530, y: 510, w: BOX_W, h: BOX_H, pk: 'id', fks: ['customerId -> Customer'] },
  { name: 'Order', x: 760, y: 510, w: BOX_W, h: BOX_H, pk: 'id', fks: ['shopId -> Shop'] },
  { name: 'OrderItem', x: 760, y: 670, w: BOX_W, h: BOX_H, pk: 'id', fks: ['orderId -> Order', 'productId -> Product'] },
  { name: 'Product', x: 1080, y: 670, w: BOX_W, h: BOX_H, pk: 'id', fks: [] },
  { name: 'OtpCode', x: 60, y: 510, w: BOX_W, h: BOX_H, pk: 'id', fks: ['(standalone)'] },
  { name: 'Advertisement', x: 60, y: 670, w: BOX_W, h: BOX_H, pk: 'id', fks: ['(standalone)'] },
  { name: 'RevenueRecord', x: 290, y: 670, w: BOX_W, h: BOX_H, pk: 'id', fks: ['(standalone)'] },
];

interface Edge {
  from: string;
  to: string;
  label: string;
  style: 'cascade' | 'setnull' | 'restrict';
}

const EDGES: Edge[] = [
  { from: 'User', to: 'Shop', label: '1—N (CASCADE)', style: 'cascade' },
  { from: 'Subscription', to: 'Shop', label: '1—N (CASCADE)', style: 'cascade' },
  { from: 'ShopDocument', to: 'Shop', label: '1—N (CASCADE)', style: 'cascade' },
  { from: 'MasterKey', to: 'Shop', label: '1—N (CASCADE, null)', style: 'cascade' },
  { from: 'Customer', to: 'Shop', label: '1—N (CASCADE)', style: 'cascade' },
  { from: 'Customer', to: 'MasterKey', label: '1—N (SET NULL)', style: 'setnull' },
  { from: 'ActivityLog', to: 'Shop', label: '1—N (SET NULL)', style: 'setnull' },
  { from: 'ActivityLog', to: 'User', label: '1—N (CASCADE)', style: 'cascade' },
  { from: 'Notification', to: 'Shop', label: '1—N (SET NULL)', style: 'setnull' },
  { from: 'CustomerDocument', to: 'Customer', label: '1—N (CASCADE)', style: 'cascade' },
  { from: 'Order', to: 'Shop', label: '1—N (CASCADE)', style: 'cascade' },
  { from: 'OrderItem', to: 'Order', label: '1—N (CASCADE)', style: 'cascade' },
  { from: 'OrderItem', to: 'Product', label: '1—N (RESTRICT)', style: 'restrict' },
];

function boxByName(name: string): Box {
  const b = BOXES.find((x) => x.name === name);
  if (!b) throw new Error(`Unknown box ${name}`);
  return b;
}

// Clip the center-to-center line to each box's rectangle boundary so the drawn
// segment runs edge-to-edge instead of overlapping the box interiors.
function clipToRect(cx: number, cy: number, ox: number, oy: number, box: Box): [number, number] {
  const dx = ox - cx;
  const dy = oy - cy;
  const halfW = box.w / 2;
  const halfH = box.h / 2;
  let tMin = Infinity;
  if (dx !== 0) {
    tMin = Math.min(tMin, Math.abs(halfW / dx));
  }
  if (dy !== 0) {
    tMin = Math.min(tMin, Math.abs(halfH / dy));
  }
  if (!isFinite(tMin)) tMin = 0;
  return [cx + dx * tMin, cy + dy * tMin];
}

// ============================================================================
// PDF rendering
// ============================================================================

const COLORS = {
  navy: '#1B2A4A',
  accent: '#8C24FF',
  gray: '#5A6270',
  lightGray: '#F2F3F7',
  border: '#C9CDD8',
  cascade: '#2E7D32',
  setnull: '#B8860B',
  restrict: '#C62828',
};

async function fetchSampleRecords() {
  const prisma = new PrismaClient();
  try {
    const shop = await prisma.shop.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
    const user = shop
      ? await prisma.user.findFirst({ where: { shopId: shop.id, deletedAt: null } })
      : await prisma.user.findFirst({ where: { deletedAt: null } });
    const customer = await prisma.customer.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
    const shopDocument = await prisma.shopDocument.findFirst({ where: { deletedAt: null } });
    const masterKey = await prisma.masterKey.findFirst({ where: { deletedAt: null } });
    const subscription = await prisma.subscription.findFirst({ orderBy: { createdAt: 'desc' } });
    return { shop, user, customer, shopDocument, masterKey, subscription };
  } finally {
    await prisma.$disconnect();
  }
}

function redact(obj: any, sensitiveKeys: string[]): Record<string, string> {
  if (!obj) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (sensitiveKeys.includes(k)) {
      out[k] = '<redacted>';
    } else if (v instanceof Date) {
      out[k] = v.toISOString();
    } else if (v === null || v === undefined) {
      out[k] = 'null';
    } else if (typeof v === 'bigint') {
      out[k] = v.toString();
    } else {
      out[k] = String(v);
    }
  }
  return out;
}

async function main() {
  const samples = await fetchSampleRecords();

  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true, info: {
    Title: 'KEE Database Schema Documentation',
    Author: 'KEE Engineering',
    Subject: 'PostgreSQL / Prisma schema reference',
  } });
  const stream = fs.createWriteStream(OUT_PATH);
  doc.pipe(stream);

  // ---------- Cover page ----------
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.navy);
  doc.fillColor('#FFFFFF').fontSize(34).font('Helvetica-Bold')
    .text('KEE Platform', 50, 260, { align: 'center' });
  doc.fontSize(24).font('Helvetica').text('Database Schema Documentation', 50, 310, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(12).fillColor('#C9CDD8').text('PostgreSQL 15 · Prisma ORM · Multi-tenant SaaS schema', { align: 'center' });
  doc.text('Generated 2026-07-17', { align: 'center' });
  doc.text('Covers: relational document storage, soft delete, referential integrity', { align: 'center' });
  doc.fillColor('#FFFFFF');

  // ---------- Table of contents ----------
  doc.addPage();
  addHeading(doc, '1. Table of Contents');
  const toc = [
    '2. Overview & Conventions',
    '3. Entity-Relationship Diagram',
    '4. Table Reference (all 15 models)',
    '5. Sample Records (live, redacted)',
    '6. Migration Guidelines',
    '7. Applied Migration History',
  ];
  doc.fontSize(12).font('Helvetica').fillColor('#000000');
  toc.forEach((t) => doc.text(t, { indent: 20 }).moveDown(0.3));

  // ---------- Overview & Conventions ----------
  doc.addPage();
  addHeading(doc, '2. Overview & Conventions');
  bodyPara(doc,
    'The KEE platform is a multi-tenant SaaS application. Each tenant is a "Shop" (a key-' +
    'duplication business); Shop Admin users operate within a single shop, while Super Admin ' +
    'users operate across all shops. The schema is defined in prisma/schema.prisma and managed ' +
    'via Prisma Migrate against PostgreSQL.');

  subHeading(doc, '2.1 Soft delete');
  bodyPara(doc,
    'Rows in soft-deletable tables are never physically removed by application code. Instead, a ' +
    'nullable deletedAt timestamp column marks a row as deleted. A Prisma Client Extension ' +
    '(src/tenant/tenant.service.ts) intercepts every query against these models: delete/deleteMany ' +
    'calls are transparently rewritten into update/updateMany calls that set deletedAt, and all ' +
    'read operations automatically get deletedAt: null merged into their where clause unless the ' +
    'caller already specified a deletedAt filter. Soft-deletable models: Shop, User, MasterKey, ' +
    'Customer, CustomerDocument, ShopDocument, Product.');
  bodyPara(doc,
    'Important limitation: this filtering only applies to the top-level queried model. Nested ' +
    'include/select relations are resolved by Prisma via a separate join/query that the extension ' +
    'does not intercept, so a soft-deleted related row can still surface inside a nested include ' +
    'unless the caller adds an explicit where: { deletedAt: null } on that nested relation. See ' +
    '§6 for the concrete pattern.');

  subHeading(doc, '2.2 Tenant (shopId) row-level scoping');
  bodyPara(doc,
    'For a subset of models (Customer, Subscription, User, ActivityLog, Notification), the same ' +
    'extension automatically scopes all queries to the current request\'s shopId when a Shop ' +
    'Admin request context is active (read via AsyncLocalStorage, set by TenantInterceptor on ' +
    'every request). Super Admin requests are not row-scoped by this mechanism; those services ' +
    'pass explicit filters where shop-specific scoping is needed.');

  subHeading(doc, '2.3 Document storage');
  bodyPara(doc,
    'Files (shop verification documents, customer ID proofs) are stored on disk/object storage ' +
    'and referenced by pointer (fileUrl, fileKey, fileSize) in dedicated relational tables ' +
    '(ShopDocument, CustomerDocument) rather than embedded as base64 inside JSON columns. This ' +
    'refactor specifically eliminated the legacy pattern where Shop.companyDetails held base64-' +
    'encoded document blobs directly in a JSON text column — see §5 and the migration report ' +
    '(docs/MIGRATION_REPORT.md) for details of the data migration that moved existing records.');

  subHeading(doc, '2.4 Identifiers');
  bodyPara(doc,
    'All primary keys are UUID strings generated client-side by Prisma (uuid()). No auto-' +
    'incrementing integer IDs are used, which avoids ID-guessing/enumeration concerns and works ' +
    'cleanly with the eventual possibility of multi-region / offline-first writes.');

  // ---------- ER Diagram ----------
  // NOTE: do NOT also pass layout: 'landscape' here — pdfkit swaps width/height when
  // that option is set, which silently clips everything placed beyond x=980 (i.e.
  // MasterKey/Notification/Product) off the right edge of the page. An explicit
  // [width, height] array with width > height is already landscape; no extra flag needed.
  doc.addPage({ size: [1600, 820], margin: 30 } as any);
  drawERDiagram(doc);

  // ---------- Table reference ----------
  doc.addPage({ size: 'A4', margin: 50 });
  addHeading(doc, '4. Table Reference');
  bodyPara(doc, 'Full column, index, and relationship listing for all 15 tables, in the order they appear in prisma/schema.prisma.');

  for (const t of TABLES) {
    renderTablePage(doc, t);
  }

  // ---------- Sample records ----------
  doc.addPage();
  addHeading(doc, '5. Sample Records (live, redacted)');
  bodyPara(doc,
    'The following records were pulled live from the development database at documentation-' +
    'generation time to illustrate real row shapes. Sensitive fields (password hashes, encrypted ' +
    'PII) are redacted.');

  renderSample(doc, 'Shop', samples.shop, ['companyDetails']);
  renderSample(doc, 'User', samples.user, ['passwordHash']);
  renderSample(doc, 'Customer', samples.customer, ['idProofNumber']);
  renderSample(doc, 'ShopDocument', samples.shopDocument, []);
  renderSample(doc, 'MasterKey', samples.masterKey, []);
  renderSample(doc, 'Subscription', samples.subscription, []);

  // ---------- Migration guidelines ----------
  doc.addPage();
  addHeading(doc, '6. Migration Guidelines');
  subHeading(doc, '6.1 Adding soft delete to a new model');
  bulletList(doc, [
    'Add deletedAt DateTime? to the model, plus @@index([deletedAt]) (or a composite index if tenant-scoped).',
    'Add the model name to SOFT_DELETE_MODELS in src/tenant/tenant.service.ts.',
    "Run npx prisma migrate dev --name <description> to generate and apply the migration.",
    'Audit every existing nested include/select of this model elsewhere in the codebase and add ' +
      'an explicit where: { deletedAt: null } filter on the relation — the extension does not ' +
      'filter nested includes automatically (see §2.1).',
  ]);
  subHeading(doc, '6.2 Adding tenant scoping to a new model');
  bulletList(doc, [
    'Add the model name to TENANT_SCOPED_MODELS in src/tenant/tenant.service.ts.',
    'Check whether the create-input auto-injection logic needs a model-specific branch (some ' +
      'models need relation-connect shape instead of a bare shopId scalar — see the code comment ' +
      "in the extension's create branch).",
    "Add a model-specific where-merge branch if the model doesn't want simple shopId equality " +
      "(e.g. Notification's shop-specific-OR-global OR clause).",
  ]);
  subHeading(doc, '6.3 Document storage convention');
  bodyPara(doc,
    'New document-attachment features should follow the ShopDocument/CustomerDocument shape: id, ' +
    'owning-entity FK, documentType (free-form string), fileUrl, fileKey, fileSize, deletedAt, ' +
    'timestamps. Do not add new base64-embedded-in-JSON document fields.');
  subHeading(doc, '6.4 Testing checklist');
  bulletList(doc, [
    'Run npx tsc --noEmit and npx jest before and after any schema/query change.',
    'For tenant-scoping or soft-delete changes, manually verify against a running dev server: ' +
      'cross-tenant isolation, soft-delete-then-refetch exclusion (including derived counts), and ' +
      'both the Shop Admin and Super Admin read paths (they are separate methods that can drift).',
  ]);

  // ---------- Migration history ----------
  doc.addPage();
  addHeading(doc, '7. Applied Migration History');
  renderMigrationHistory(doc);

  addPageNumbers(doc);
  doc.end();

  await new Promise<void>((resolve) => stream.on('finish', () => resolve()));
  console.log(`Written: ${OUT_PATH}`);
}

// ============================================================================
// Rendering helpers
// ============================================================================

function addHeading(doc: PDFKit.PDFDocument, text: string) {
  doc.fillColor(COLORS.navy).font('Helvetica-Bold').fontSize(20).text(text);
  doc.moveTo(doc.x, doc.y + 4).lineTo(doc.page.width - doc.page.margins.right, doc.y + 4)
    .strokeColor(COLORS.accent).lineWidth(2).stroke();
  doc.moveDown(1);
  doc.fillColor('#000000');
}

function subHeading(doc: PDFKit.PDFDocument, text: string) {
  doc.moveDown(0.5);
  doc.fillColor(COLORS.navy).font('Helvetica-Bold').fontSize(14).text(text);
  doc.moveDown(0.3);
  doc.fillColor('#000000').font('Helvetica').fontSize(10.5);
}

function bodyPara(doc: PDFKit.PDFDocument, text: string) {
  doc.font('Helvetica').fontSize(10.5).fillColor('#1A1A1A').text(text, { align: 'left', lineGap: 2 });
  doc.moveDown(0.6);
}

function bulletList(doc: PDFKit.PDFDocument, items: string[]) {
  doc.font('Helvetica').fontSize(10.5).fillColor('#1A1A1A');
  for (const item of items) {
    doc.text(`•  ${item}`, { indent: 10, lineGap: 2 });
    doc.moveDown(0.25);
  }
  doc.moveDown(0.4);
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) {
    doc.addPage({ size: 'A4', margin: 50 });
  }
}

function renderTablePage(doc: PDFKit.PDFDocument, t: TableDef) {
  ensureSpace(doc, 160);
  doc.moveDown(0.5);
  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(15).text(t.name);
  const badges: string[] = [];
  if (t.softDelete) badges.push('SOFT-DELETE');
  if (t.tenantScoped) badges.push('TENANT-SCOPED');
  if (badges.length) {
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.gray).text(badges.join('   ·   '));
  }
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10).fillColor('#333333').text(t.description, { lineGap: 1.5 });
  doc.moveDown(0.5);

  // Columns table
  const colX = doc.page.margins.left;
  const colWidths = [150, 150, 220];
  const startY = doc.y;
  drawTableRow(doc, colX, doc.y, colWidths, ['Column', 'Type', 'Notes'], true);
  let y = doc.y;
  for (const col of t.columns) {
    ensureSpace(doc, 20);
    y = doc.y;
    drawTableRow(doc, colX, y, colWidths, [col.name, col.type, col.attrs], false);
  }
  doc.moveDown(0.4);

  if (t.indexes.length) {
    ensureSpace(doc, 30);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.navy).text('Indexes: ', { continued: true });
    doc.font('Helvetica').fillColor('#333333').text(t.indexes.join('  |  '));
    doc.moveDown(0.2);
  }
  if (t.relations.length) {
    ensureSpace(doc, 14 * t.relations.length + 20);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.navy).text('Relations:');
    doc.font('Courier').fontSize(8.5).fillColor('#333333');
    for (const r of t.relations) {
      doc.text(r.text);
    }
  }
  doc.moveDown(0.8);
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor(COLORS.border).lineWidth(0.5).stroke();
  doc.moveDown(0.6);
}

function drawTableRow(doc: PDFKit.PDFDocument, x: number, y: number, widths: number[], values: string[], header: boolean) {
  const rowHeight = 16;
  if (header) {
    doc.rect(x, y, widths.reduce((a, b) => a + b, 0), rowHeight).fill(COLORS.lightGray);
    doc.fillColor(COLORS.navy).font('Helvetica-Bold').fontSize(9);
  } else {
    doc.fillColor('#1A1A1A').font('Helvetica').fontSize(9);
  }
  let cx = x;
  values.forEach((v, i) => {
    doc.text(v, cx + 3, y + 3, { width: widths[i] - 6, ellipsis: true });
    cx += widths[i];
  });
  doc.y = y + rowHeight;
  doc.x = doc.page.margins.left;
}

function renderSample(doc: PDFKit.PDFDocument, name: string, record: any, sensitive: string[]) {
  ensureSpace(doc, 100);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.accent).text(name);
  doc.moveDown(0.2);
  if (!record) {
    doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(COLORS.gray).text('(no active row found in dev database at generation time)');
    doc.moveDown(0.6);
    return;
  }
  const redacted = redact(record, sensitive);
  doc.font('Courier').fontSize(8).fillColor('#1A1A1A');
  for (const [k, v] of Object.entries(redacted)) {
    ensureSpace(doc, 12);
    const truncated = v.length > 90 ? v.slice(0, 90) + '…' : v;
    doc.text(`${k.padEnd(18)}: ${truncated}`);
  }
  doc.moveDown(0.6);
}

function renderMigrationHistory(doc: PDFKit.PDFDocument) {
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  let dirs: string[] = [];
  try {
    dirs = fs.readdirSync(migrationsDir).filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory()).sort();
  } catch {
    dirs = [];
  }
  bodyPara(doc, `${dirs.length} migration(s) found under prisma/migrations/, applied in order:`);
  doc.font('Courier').fontSize(9.5).fillColor('#1A1A1A');
  dirs.forEach((d, i) => {
    doc.text(`${i + 1}. ${d}`);
  });
  doc.moveDown(0.8);
  bodyPara(doc,
    'To apply pending migrations against a target database: cd backend && npx prisma migrate ' +
    'deploy. To generate a new migration during development: npx prisma migrate dev --name ' +
    '<description>. Always run npx prisma migrate status before deploying to confirm the target ' +
    'database is in the expected state.');
  bodyPara(doc,
    'The one-off data migration for legacy embedded shop documents ' +
    '(scripts/migrate-shop-documents.ts) is separate from schema migrations — it is an ' +
    'idempotent, re-runnable data-fixup script, not a Prisma migration, and only needs to be run ' +
    'once per environment after the ShopDocument table exists. See docs/MIGRATION_REPORT.md §3 ' +
    'for full details and execution results.');
}

function drawERDiagram(doc: PDFKit.PDFDocument) {
  doc.fillColor(COLORS.navy).font('Helvetica-Bold').fontSize(20).text('3. Entity-Relationship Diagram', 30, 20);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.gray)
    .text('Boxes show PK/FK columns only — see §4 for full column listings. Line color indicates ON DELETE behavior.', 30, 46);

  // Legend
  const legendY = 70;
  legendSwatch(doc, 30, legendY, COLORS.cascade, 'CASCADE');
  legendSwatch(doc, 160, legendY, COLORS.setnull, 'SET NULL');
  legendSwatch(doc, 300, legendY, COLORS.restrict, 'RESTRICT');

  // Draw edges first (so boxes render on top of line ends)
  for (const edge of EDGES) {
    const from = boxByName(edge.from);
    const to = boxByName(edge.to);
    const fromCenter = [from.x + from.w / 2, from.y + from.h / 2];
    const toCenter = [to.x + to.w / 2, to.y + to.h / 2];
    const [x1, y1] = clipToRect(fromCenter[0], fromCenter[1], toCenter[0], toCenter[1], from);
    const [x2, y2] = clipToRect(toCenter[0], toCenter[1], fromCenter[0], fromCenter[1], to);
    const color = edge.style === 'cascade' ? COLORS.cascade : edge.style === 'setnull' ? COLORS.setnull : COLORS.restrict;
    doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(1.3).stroke();
    // small arrowhead at the "to" (parent) end
    drawArrowhead(doc, x2, y2, x1, y1, color);
    // Label near midpoint, offset perpendicular to the line direction so it doesn't sit
    // directly on top of the stroke (which reads poorly, especially on short/steep segments
    // between adjacent boxes like OrderItem -> Product).
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const perpX = (-dy / len) * 9;
    const perpY = (dx / len) * 9;
    doc.font('Helvetica').fontSize(6.5).fillColor(color)
      .text(edge.label, mx - 35 + perpX, my - 3 + perpY, { width: 70, align: 'center' });
  }

  // Draw boxes on top
  for (const box of BOXES) {
    doc.rect(box.x, box.y, box.w, box.h).fillAndStroke('#FFFFFF', COLORS.navy);
    doc.rect(box.x, box.y, box.w, 20).fill(COLORS.navy);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10).text(box.name, box.x + 6, box.y + 5, { width: box.w - 12 });
    doc.fillColor('#1A1A1A').font('Courier-Bold').fontSize(7.5).text(`PK ${box.pk}`, box.x + 6, box.y + 26, { width: box.w - 12 });
    doc.font('Courier').fontSize(7).fillColor('#333333');
    let fy = box.y + 40;
    for (const fk of box.fks) {
      doc.text(fk.length > 30 ? fk.slice(0, 30) : fk, box.x + 6, fy, { width: box.w - 12 });
      fy += 10;
    }
  }
}

function legendSwatch(doc: PDFKit.PDFDocument, x: number, y: number, color: string, label: string) {
  doc.moveTo(x, y + 5).lineTo(x + 24, y + 5).strokeColor(color).lineWidth(2).stroke();
  doc.font('Helvetica').fontSize(8.5).fillColor('#333333').text(label, x + 30, y);
}

function drawArrowhead(doc: PDFKit.PDFDocument, tipX: number, tipY: number, fromX: number, fromY: number, color: string) {
  const angle = Math.atan2(tipY - fromY, tipX - fromX);
  const size = 6;
  const a1 = angle + Math.PI - Math.PI / 7;
  const a2 = angle + Math.PI + Math.PI / 7;
  const x1 = tipX + size * Math.cos(a1);
  const y1 = tipY + size * Math.sin(a1);
  const x2 = tipX + size * Math.cos(a2);
  const y2 = tipY + size * Math.sin(a2);
  doc.moveTo(tipX, tipY).lineTo(x1, y1).lineTo(x2, y2).closePath().fill(color);
}

function addPageNumbers(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    if (i === 0) continue; // skip cover page
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    // NOTE: do NOT pass a `width` option here (even with lineBreak: false). Internally,
    // pdfkit's text() only skips its line-wrapping engine (LineWrapper) when `options.width`
    // is falsy; if a width is present it always goes through wrap(), which independently
    // re-checks "does this y fit before the page's bottom margin" and silently inserts a
    // brand new page + redraws there if not — regardless of lineBreak. Since our y
    // (pageHeight - 30) intentionally sits inside the bottom margin (below page.maxY()),
    // that check always failed and doubled the page count (15 real pages -> 29, every
    // other one a near-blank page containing only a footer) before this fix. Avoiding
    // `width` entirely skips LineWrapper altogether, so no page-break check runs; we
    // compute the centered x position manually instead of relying on `align: 'center'`.
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.gray);
    const footerText = `KEE Database Schema Documentation — Page ${i + 1} of ${range.count}`;
    const footerWidth = doc.widthOfString(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 30, { lineBreak: false });
  }
}

main().catch((err) => {
  console.error('Failed to generate schema doc:', err);
  process.exit(1);
});
