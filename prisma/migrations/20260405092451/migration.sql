-- AlterEnum - Drop old enum values and add new ones
ALTER TYPE "FinanceType" RENAME TO "FinanceType_old";

CREATE TYPE "FinanceType" AS ENUM ('income', 'expenses');

-- Alter table to use new enum
ALTER TABLE "finance_transactions" 
  ALTER COLUMN "type" TYPE "FinanceType" USING 
  CASE 
    WHEN "type"::text = 'INCOME' THEN 'income'::text
    WHEN "type"::text = 'EXPENSE' THEN 'expenses'::text
  END::"FinanceType";

-- Drop old enum
DROP TYPE "FinanceType_old";

-- CreateTable for Admins
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
CREATE INDEX "admins_email_idx" ON "admins"("email");
