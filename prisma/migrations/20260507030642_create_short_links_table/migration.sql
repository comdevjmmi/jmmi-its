/*
  Warnings:

  - You are about to drop the column `click_count` on the `links` table. All the data in the column will be lost.
  - You are about to drop the column `short_code` on the `links` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX IF EXISTS "links_category_id_idx";

-- DropIndex
DROP INDEX IF EXISTS "links_short_code_key";

-- AlterTable
ALTER TABLE "links" DROP COLUMN IF EXISTS "click_count",
DROP COLUMN IF EXISTS "short_code";

-- CreateTable
CREATE TABLE "short_links" (
    "id" TEXT NOT NULL,
    "short_code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "short_links_short_code_key" ON "short_links"("short_code");
