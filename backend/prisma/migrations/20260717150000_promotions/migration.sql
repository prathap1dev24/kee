-- Cross-Shop Advertisements & Product Promotion feature.
-- Adds a Promotion table for shop-admin-created listings (ads or promotional
-- products) that are visible across every shop on the platform. Kept separate
-- from Advertisement (super-admin campaign banners) and Product (internal
-- supply-store catalog).

CREATE TYPE "PromotionType" AS ENUM ('AD', 'PRODUCT');

CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" DOUBLE PRECISION,
    "shopId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Promotion_shopId_idx" ON "Promotion"("shopId");
CREATE INDEX "Promotion_deletedAt_idx" ON "Promotion"("deletedAt");
CREATE INDEX "Promotion_type_idx" ON "Promotion"("type");

ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
