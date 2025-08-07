/*
  Warnings:

  - A unique constraint covering the columns `[tokenId,address]` on the table `MediaAccessPermission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MediaAccessPermission_tokenId_address_key" ON "MediaAccessPermission"("tokenId", "address");
