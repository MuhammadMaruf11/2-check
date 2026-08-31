-- ============================================================================
-- Product System Overhaul
-- Adds: AUTHOR role, expanded Blog workflow, Category, full Product model,
-- ProductSpecification, richer AffiliateLink, VideoReview, ExpertReview,
-- moderated Review (customer reviews), and the RelatedProducts self-relation.
-- ============================================================================

-- ---------- Role enum: add AUTHOR ----------
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'AUTHOR';

-- ---------- BlogStatus enum: expand workflow ----------
-- Old values: REJECTED, PENDING, PUBLISHED
-- New values: DRAFT, PENDING_REVIEW, APPROVED, SCHEDULED, PUBLISHED, REJECTED
-- RENAME VALUE (rather than ADD + data backfill) retags the existing 'PENDING'
-- rows to 'PENDING_REVIEW' automatically, with no data migration needed, and
-- avoids Postgres's restriction on using a brand-new enum value inside the
-- same transaction it was added in.
ALTER TYPE "BlogStatus" RENAME VALUE 'PENDING' TO 'PENDING_REVIEW';
ALTER TYPE "BlogStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "BlogStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "BlogStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';

-- ---------- New enums ----------
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "AvailabilityStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'LIMITED_STOCK', 'PREORDER', 'DISCONTINUED');

-- ---------- Blog: scheduling columns ----------
ALTER TABLE "Blog" ADD COLUMN "scheduledAt" TIMESTAMP(3);
ALTER TABLE "Blog" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Backfill: any blog previously PUBLISHED gets a publishedAt of its createdAt
-- so existing published posts don't disappear from a future "publishedAt"-sorted feed.
UPDATE "Blog" SET "publishedAt" = "createdAt" WHERE "status" = 'PUBLISHED' AND "publishedAt" IS NULL;

CREATE INDEX "Blog_status_scheduledAt_idx" ON "Blog"("status", "scheduledAt");

-- ---------- Category ----------
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_displayOrder_idx" ON "Category"("displayOrder");

-- Backfill: turn each distinct existing Product.category string into a real Category row.
INSERT INTO "Category" ("id", "name", "slug", "displayOrder", "createdAt", "updatedAt")
SELECT
    'cat_' || substr(md5(random()::text || clock_timestamp()::text), 1, 20),
    c.category,
    trim(both '-' from regexp_replace(lower(trim(c.category)), '[^a-z0-9]+', '-', 'g')),
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "category" FROM "Product" WHERE "category" IS NOT NULL AND trim("category") <> '') c;

-- ---------- Product: expand columns ----------
ALTER TABLE "Product" ADD COLUMN "brand" TEXT;
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Product" ADD COLUMN "verdict" TEXT;
ALTER TABLE "Product" ADD COLUMN "thumbnailUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN "pros" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "cons" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "price" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "originalPrice" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Product" ADD COLUMN "releaseDate" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Product" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Product" ADD COLUMN "seoKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Point existing products at their newly-created Category row.
UPDATE "Product" p
SET "categoryId" = c."id"
FROM "Category" c
WHERE p."category" = c."name";

-- Existing products keep working end-to-end: treat pre-existing rows as already published.
UPDATE "Product" SET "isPublished" = true, "publishedAt" = "createdAt" WHERE "isPublished" = false;

ALTER TABLE "Product" DROP COLUMN "category";

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_isPublished_publishedAt_idx" ON "Product"("isPublished", "publishedAt");
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");

-- ---------- ProductSpecification ----------
CREATE TABLE "ProductSpecification" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "groupName" TEXT,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductSpecification_productId_idx" ON "ProductSpecification"("productId");

ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- AffiliateLink: expand into a real multi-store model ----------
ALTER TABLE "AffiliateLink" RENAME COLUMN "platform" TO "storeName";
ALTER TABLE "AffiliateLink" RENAME COLUMN "url" TO "affiliateUrl";

ALTER TABLE "AffiliateLink" ADD COLUMN "storeLogo" TEXT;
ALTER TABLE "AffiliateLink" ADD COLUMN "productUrl" TEXT;
ALTER TABLE "AffiliateLink" ADD COLUMN "availability" "AvailabilityStatus" NOT NULL DEFAULT 'IN_STOCK';
ALTER TABLE "AffiliateLink" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AffiliateLink" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AffiliateLink" ADD COLUMN "trackingId" TEXT;
ALTER TABLE "AffiliateLink" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AffiliateLink" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- price used to be free-text (e.g. "$12.99" or "৳1,200"); salvage numeric value where possible.
ALTER TABLE "AffiliateLink" ALTER COLUMN "price" TYPE DECIMAL(10,2)
  USING (NULLIF(regexp_replace("price", '[^0-9.]', '', 'g'), '')::DECIMAL(10,2));
ALTER TABLE "AffiliateLink" ALTER COLUMN "currency" SET DEFAULT 'USD';
UPDATE "AffiliateLink" SET "currency" = 'USD' WHERE "currency" IS NULL;

CREATE INDEX "AffiliateLink_productId_isActive_idx" ON "AffiliateLink"("productId", "isActive");

-- ---------- VideoReview ----------
CREATE TABLE "VideoReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "youtubeId" TEXT,
    "thumbnailUrl" TEXT,
    "reviewerName" TEXT,
    "reviewerChannelUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VideoReview_productId_idx" ON "VideoReview"("productId");

ALTER TABLE "VideoReview" ADD CONSTRAINT "VideoReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- ExpertReview ----------
CREATE TABLE "ExpertReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerRole" TEXT,
    "reviewerAvatar" TEXT,
    "quote" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "rating" DOUBLE PRECISION,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExpertReview_productId_idx" ON "ExpertReview"("productId");

ALTER TABLE "ExpertReview" ADD CONSTRAINT "ExpertReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- Review: add moderation workflow ----------
ALTER TABLE "Review" ADD COLUMN "title" TEXT;
ALTER TABLE "Review" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Review" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Review" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Existing reviews are treated as already-moderated/approved so they keep showing up.
UPDATE "Review" SET "status" = 'APPROVED';

-- Guard against pre-existing duplicate (productId, userId) rows before adding the unique
-- constraint - keep the earliest review per pair, drop the rest.
DELETE FROM "Review" r
WHERE r."id" NOT IN (
  SELECT DISTINCT ON ("productId", "userId") "id"
  FROM "Review"
  ORDER BY "productId", "userId", "createdAt" ASC
);

CREATE UNIQUE INDEX "Review_productId_userId_key" ON "Review"("productId", "userId");
CREATE INDEX "Review_productId_status_idx" ON "Review"("productId", "status");

-- Recompute the cached Product.rating / ratingCount from approved reviews.
UPDATE "Product" p
SET "rating" = COALESCE(agg.avg_rating, 0),
    "ratingCount" = COALESCE(agg.cnt, 0)
FROM (
  SELECT "productId", AVG("rating")::DOUBLE PRECISION AS avg_rating, COUNT(*) AS cnt
  FROM "Review"
  WHERE "status" = 'APPROVED'
  GROUP BY "productId"
) agg
WHERE p."id" = agg."productId";

-- ---------- RelatedProducts (self many-to-many) ----------
CREATE TABLE "_RelatedProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RelatedProducts_AB_pkey" PRIMARY KEY ("A", "B")
);

CREATE INDEX "_RelatedProducts_B_index" ON "_RelatedProducts"("B");

ALTER TABLE "_RelatedProducts" ADD CONSTRAINT "_RelatedProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_RelatedProducts" ADD CONSTRAINT "_RelatedProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
