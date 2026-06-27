/*
  Warnings:

  - A unique constraint covering the columns `[cartId,dishId,notes]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Cart` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `CartItem` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Order` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Role` MODIFY `name` ENUM('SUPER_ADMIN', 'CUSTOMER', 'DRIVER', 'ADMIN') NOT NULL;

-- CreateTable
CREATE TABLE `PlaywrightDemo` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `CartItem_cartId_dishId_notes_key` ON `CartItem`(`cartId`, `dishId`, `notes`);
