/*
  Warnings:

  - You are about to drop the column `authorName` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `Blog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `affiliateLinks` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "authorName",
DROP COLUMN "imageUrl",
DROP COLUMN "updatedAt",
ADD COLUMN     "authorId" TEXT NOT NULL,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
DROP COLUMN "updatedAt",
ADD COLUMN     "affiliateLinks" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
