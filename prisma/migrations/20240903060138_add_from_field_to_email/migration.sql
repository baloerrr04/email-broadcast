/*
  Warnings:

  - Added the required column `from` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `email` ADD COLUMN `from` INTEGER NOT NULL;
