/*
  Warnings:

  - You are about to drop the column `appPassword` on the `user` table. All the data in the column will be lost.
  - Added the required column `broadcasterId` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `email` ADD COLUMN `broadcasterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `appPassword`,
    ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL;

-- CreateTable
CREATE TABLE `Broadcaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `appPassword` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Broadcaster_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_broadcasterId_fkey` FOREIGN KEY (`broadcasterId`) REFERENCES `Broadcaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
