/*
  Warnings:

  - A unique constraint covering the columns `[metadataHash]` on the table `MediaNFT` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MediaNFT_metadataHash_key" ON "MediaNFT"("metadataHash");

-- CreateIndex
CREATE INDEX "MediaNFT_metadataHash_idx" ON "MediaNFT"("metadataHash");
