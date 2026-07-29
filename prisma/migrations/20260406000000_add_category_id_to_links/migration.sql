-- AlterTable
ALTER TABLE "links"
ADD COLUMN "category_id" TEXT;

-- CreateIndex
CREATE INDEX "links_category_id_idx" ON "links"("category_id");

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
