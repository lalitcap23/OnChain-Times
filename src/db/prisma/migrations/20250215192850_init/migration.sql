/*
  Warnings:

  - You are about to drop the column `description` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `mint_price` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `trustScore` on the `News` table. All the data in the column will be lost.
  - Added the required column `summary` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "description",
DROP COLUMN "mint_price",
DROP COLUMN "trustScore",
ADD COLUMN     "confidence_score" INTEGER,
ADD COLUMN     "has_minted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_seen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "summary" TEXT NOT NULL,
ADD CONSTRAINT "News_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "News_id_key";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "totalRewards" INTEGER NOT NULL DEFAULT 0,
    "swappedNews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MintedNews" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MintedNews_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SeenNews" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SeenNews_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "_MintedNews_B_index" ON "_MintedNews"("B");

-- CreateIndex
CREATE INDEX "_SeenNews_B_index" ON "_SeenNews"("B");

-- AddForeignKey
ALTER TABLE "_MintedNews" ADD CONSTRAINT "_MintedNews_A_fkey" FOREIGN KEY ("A") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MintedNews" ADD CONSTRAINT "_MintedNews_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeenNews" ADD CONSTRAINT "_SeenNews_A_fkey" FOREIGN KEY ("A") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeenNews" ADD CONSTRAINT "_SeenNews_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
