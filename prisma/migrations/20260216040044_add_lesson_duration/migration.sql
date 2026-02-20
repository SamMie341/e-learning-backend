-- AlterTable
ALTER TABLE "lesson_progress" ADD COLUMN     "last_watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "time_spent_seconds" INTEGER NOT NULL DEFAULT 0;
