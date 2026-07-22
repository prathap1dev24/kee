-- AlterTable
ALTER TABLE "MasterKey" DROP COLUMN "blankNumber",
DROP COLUMN "brand",
DROP COLUMN "description",
DROP COLUMN "frontImageUrl",
DROP COLUMN "notes",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "KeyStatus";

