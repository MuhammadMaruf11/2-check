-- Blog: add featured flag for editorial curation
ALTER TABLE "Blog" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Blog_isFeatured_idx" ON "Blog"("isFeatured");

-- Comment: add moderation (hide) + edit tracking
ALTER TABLE "Comment" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Comment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
