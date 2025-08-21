-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "trustScore" INTEGER NOT NULL,
    "mint_price" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "News_id_key" ON "News"("id");
