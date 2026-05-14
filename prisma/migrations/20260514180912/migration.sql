/*
  Warnings:

  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `employees`;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` ENUM('SUPER_ADMIN', 'CUSTOMER', 'DRIVER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `avatarId` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restaurant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `description` VARCHAR(191) NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(150) NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(100) NULL,
    `province` VARCHAR(100) NULL,
    `postalCode` VARCHAR(20) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `logoId` VARCHAR(191) NULL,
    `bannerId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `isOpen` BOOLEAN NOT NULL DEFAULT false,
    `openTime` TIME NULL,
    `closeTime` TIME NULL,
    `rejectedReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Restaurant_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantUser` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `restaurantRole` ENUM('OWNER', 'ADMIN', 'STAFF') NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RestaurantUser_restaurantId_idx`(`restaurantId`),
    INDEX `RestaurantUser_userId_idx`(`userId`),
    UNIQUE INDEX `RestaurantUser_restaurantId_userId_key`(`restaurantId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dish` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `imageId` VARCHAR(191) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Dish_imageId_key`(`imageId`),
    INDEX `Dish_restaurantId_idx`(`restaurantId`),
    INDEX `Dish_categoryId_idx`(`categoryId`),
    INDEX `Dish_isAvailable_idx`(`isAvailable`),
    UNIQUE INDEX `Dish_restaurantId_slug_key`(`restaurantId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DishImage` (
    `id` VARCHAR(191) NOT NULL,
    `dishId` VARCHAR(191) NOT NULL,
    `uploadId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DishImage_dishId_uploadId_key`(`dishId`, `uploadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantImage` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `uploadId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RestaurantImage_restaurantId_uploadId_key`(`restaurantId`, `uploadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Upload` (
    `id` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `type` ENUM('avatar', 'restaurant_logo', 'restaurant_banner', 'dish_image') NOT NULL,
    `folder` VARCHAR(100) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `size` BIGINT NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Upload_filename_key`(`filename`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Cart_userId_idx`(`userId`),
    UNIQUE INDEX `Cart_userId_restaurantId_key`(`userId`, `restaurantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` VARCHAR(191) NOT NULL,
    `cartId` VARCHAR(191) NOT NULL,
    `dishId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CartItem_cartId_idx`(`cartId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNo` VARCHAR(50) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `deliveryFee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `paymentStatus` ENUM('UNPAID', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `paymentMethod` ENUM('CASH', 'TRANSFER', 'EWALLET', 'QRIS') NULL,
    `customerName` VARCHAR(150) NOT NULL,
    `customerPhone` VARCHAR(30) NOT NULL,
    `deliveryAddress` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `orderedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `confirmedAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Order_orderNo_key`(`orderNo`),
    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_restaurantId_idx`(`restaurantId`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_paymentStatus_idx`(`paymentStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `dishId` VARCHAR(191) NOT NULL,
    `dishName` VARCHAR(150) NOT NULL,
    `dishPrice` DECIMAL(12, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderItem_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Delivery` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `driverId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `startedAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Delivery_driverId_idx`(`driverId`),
    INDEX `Delivery_status_idx`(`status`),
    UNIQUE INDEX `Delivery_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    INDEX `RefreshToken_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(100) NOT NULL,
    `module` VARCHAR(100) NOT NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `oldData` JSON NULL,
    `newData` JSON NULL,
    `ipAddress` VARCHAR(100) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_entityType_idx`(`entityType`),
    INDEX `AuditLog_entityId_idx`(`entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_avatarId_fkey` FOREIGN KEY (`avatarId`) REFERENCES `Upload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `Upload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_bannerId_fkey` FOREIGN KEY (`bannerId`) REFERENCES `Upload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantUser` ADD CONSTRAINT `RestaurantUser_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantUser` ADD CONSTRAINT `RestaurantUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dish` ADD CONSTRAINT `Dish_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dish` ADD CONSTRAINT `Dish_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dish` ADD CONSTRAINT `Dish_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Upload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DishImage` ADD CONSTRAINT `DishImage_dishId_fkey` FOREIGN KEY (`dishId`) REFERENCES `Dish`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DishImage` ADD CONSTRAINT `DishImage_uploadId_fkey` FOREIGN KEY (`uploadId`) REFERENCES `Upload`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantImage` ADD CONSTRAINT `RestaurantImage_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantImage` ADD CONSTRAINT `RestaurantImage_uploadId_fkey` FOREIGN KEY (`uploadId`) REFERENCES `Upload`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Upload` ADD CONSTRAINT `Upload_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_dishId_fkey` FOREIGN KEY (`dishId`) REFERENCES `Dish`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_dishId_fkey` FOREIGN KEY (`dishId`) REFERENCES `Dish`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
