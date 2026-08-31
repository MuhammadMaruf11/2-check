/*
  Warnings:

  - You are about to drop the column `published` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `affiliateLinks` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longDescription` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('REJECTED', 'PENDING', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "published",
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "status" "BlogStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "subTitle" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "News" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Newsletter" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "affiliateLinks",
DROP COLUMN "description",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "longDescription" TEXT NOT NULL,
ADD COLUMN     "shortDescription" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" TEXT,
    "currency" TEXT,
    "productId" TEXT NOT NULL,

    CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BlogToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlogToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Comment_blogId_idx" ON "Comment"("blogId");

-- CreateIndex
CREATE INDEX "AffiliateLink_productId_idx" ON "AffiliateLink"("productId");

-- CreateIndex
CREATE INDEX "_BlogToProduct_B_index" ON "_BlogToProduct"("B");

-- CreateIndex
CREATE INDEX "Blog_title_idx" ON "Blog"("title");

-- CreateIndex
CREATE INDEX "Blog_status_createdAt_idx" ON "Blog"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Blog_authorId_idx" ON "Blog"("authorId");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogToProduct" ADD CONSTRAINT "_BlogToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogToProduct" ADD CONSTRAINT "_BlogToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
