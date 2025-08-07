/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `MediaAccessLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenId]` on the table `MediaTransfer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "MediaAccessPermission" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAccessPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAccessPermission_tokenId_key" ON "MediaAccessPermission"("tokenId");

-- CreateIndex
CREATE INDEX "MediaAccessPermission_tokenId_idx" ON "MediaAccessPermission"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAccessLog_tokenId_key" ON "MediaAccessLog"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTransfer_tokenId_key" ON "MediaTransfer"("tokenId");
