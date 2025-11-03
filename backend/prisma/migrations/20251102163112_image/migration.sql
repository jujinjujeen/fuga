/*
  Warnings:

  - The values [avif] on the enum `ImageFormat` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ImageFormat_new" AS ENUM ('jpeg', 'png', 'webp');
ALTER TABLE "Image" ALTER COLUMN "format" TYPE "ImageFormat_new" USING ("format"::text::"ImageFormat_new");
ALTER TYPE "ImageFormat" RENAME TO "ImageFormat_old";
ALTER TYPE "ImageFormat_new" RENAME TO "ImageFormat";
DROP TYPE "ImageFormat_old";
COMMIT;
