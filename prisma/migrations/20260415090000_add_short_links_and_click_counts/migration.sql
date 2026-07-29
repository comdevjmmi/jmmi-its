-- AlterTable
ALTER TABLE "links"
ADD COLUMN "short_code" TEXT,
ADD COLUMN "click_count" INTEGER NOT NULL DEFAULT 0;

UPDATE "links"
SET "short_code" = lower(substr(replace("id"::text, '-', ''), 1, 10))
WHERE "short_code" IS NULL;

ALTER TABLE "links"
ALTER COLUMN "short_code" SET NOT NULL;

CREATE UNIQUE INDEX "links_short_code_key" ON "links"("short_code");