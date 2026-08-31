-- User: add activate/deactivate support for admin user management
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "User_role_idx" ON "User"("role");
