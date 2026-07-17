-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "audience" TEXT NOT NULL DEFAULT 'SHOP';

-- Backfill: existing SHOP_REGISTRATION notifications were always intended for the
-- Super Admin panel only (they announce a new shop's approval request), never for
-- shop admins. Before this migration, the application had no way to express that
-- distinction, so they were stored with shopId: null the same way a true
-- shop-wide broadcast would be, and every shop admin's notification list leaked
-- every other shop's registration request. Retag them so the new 'SHOP' default
-- (applied to the column above) doesn't perpetuate that leak for existing rows.
UPDATE "Notification" SET "audience" = 'SUPER_ADMIN' WHERE "type" = 'SHOP_REGISTRATION';

-- CreateIndex
CREATE INDEX "Notification_shopId_audience_idx" ON "Notification"("shopId", "audience");
