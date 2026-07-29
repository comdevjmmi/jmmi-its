-- AlterTable
ALTER TABLE "calendar_events"
ADD COLUMN "recurrence_interval" INTEGER NOT NULL DEFAULT 1;
