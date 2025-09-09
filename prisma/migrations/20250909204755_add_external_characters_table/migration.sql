-- DropIndex
DROP INDEX "public"."external_characters_isExternal_idx";

-- DropIndex
DROP INDEX "public"."external_characters_status_idx";

-- AlterTable
ALTER TABLE "public"."external_characters" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "vocation" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE TEXT;
