-- Remove manual Shop Approval workflow: shops are now automatically active
-- upon successful registration, so the isApproved gate is no longer needed.
ALTER TABLE "Shop" DROP COLUMN "isApproved";
