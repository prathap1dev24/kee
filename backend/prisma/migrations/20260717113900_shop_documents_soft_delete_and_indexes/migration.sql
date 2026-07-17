-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CustomerDocument" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MasterKey" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ShopDocument" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopDocument_shopId_idx" ON "ShopDocument"("shopId");

-- CreateIndex
CREATE INDEX "ShopDocument_shopId_documentType_idx" ON "ShopDocument"("shopId", "documentType");

-- CreateIndex
CREATE INDEX "ShopDocument_deletedAt_idx" ON "ShopDocument"("deletedAt");

-- CreateIndex
CREATE INDEX "ActivityLog_shopId_idx" ON "ActivityLog"("shopId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "Customer_masterKeyId_idx" ON "Customer"("masterKeyId");

-- CreateIndex
CREATE INDEX "Customer_shopId_deletedAt_idx" ON "Customer"("shopId", "deletedAt");

-- CreateIndex
CREATE INDEX "Customer_shopId_phone_idx" ON "Customer"("shopId", "phone");

-- CreateIndex
CREATE INDEX "CustomerDocument_customerId_idx" ON "CustomerDocument"("customerId");

-- CreateIndex
CREATE INDEX "CustomerDocument_deletedAt_idx" ON "CustomerDocument"("deletedAt");

-- CreateIndex
CREATE INDEX "MasterKey_deletedAt_idx" ON "MasterKey"("deletedAt");

-- CreateIndex
CREATE INDEX "Notification_shopId_idx" ON "Notification"("shopId");

-- CreateIndex
CREATE INDEX "Order_shopId_status_idx" ON "Order"("shopId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

-- CreateIndex
CREATE INDEX "Shop_deletedAt_idx" ON "Shop"("deletedAt");

-- CreateIndex
CREATE INDEX "Subscription_shopId_idx" ON "Subscription"("shopId");

-- CreateIndex
CREATE INDEX "Subscription_shopId_status_idx" ON "Subscription"("shopId", "status");

-- CreateIndex
CREATE INDEX "User_shopId_idx" ON "User"("shopId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- AddForeignKey
ALTER TABLE "ShopDocument" ADD CONSTRAINT "ShopDocument_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

