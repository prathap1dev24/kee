-- Product Promotions & Admin Screen Updates:
--  1. Adds the OFFER variant to PromotionType so Shop Admins can publish
--     discount/offer listings tied to their own products or advertisements.
--  2. Adds a HALF_YEARLY subscription plan tier.

ALTER TYPE "PromotionType" ADD VALUE 'OFFER';
ALTER TYPE "Plan" ADD VALUE 'HALF_YEARLY';

ALTER TABLE "Promotion" ADD COLUMN "discountPercentage" DOUBLE PRECISION;
ALTER TABLE "Promotion" ADD COLUMN "validUntil" TIMESTAMP(3);
ALTER TABLE "Promotion" ADD COLUMN "linkedPromotionId" TEXT;

CREATE INDEX "Promotion_linkedPromotionId_idx" ON "Promotion"("linkedPromotionId");

ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_linkedPromotionId_fkey" FOREIGN KEY ("linkedPromotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
