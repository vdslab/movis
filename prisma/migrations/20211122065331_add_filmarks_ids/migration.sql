/*
  Warnings:

  - Added the required column `filmarksId` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filmarksId` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "filmarksId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "filmarksId" INTEGER NOT NULL;
