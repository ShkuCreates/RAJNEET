-- AlterTable
ALTER TABLE "News" ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false;
