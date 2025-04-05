/*
  Warnings:

  - You are about to drop the `restaurant_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `restaurant_profile`;

-- CreateTable
CREATE TABLE `RestaurantProfile` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `openingHours` JSON NOT NULL,
    `facebook` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `bannerUrl` VARCHAR(191) NULL,
    `maxBookingDays` INTEGER NOT NULL DEFAULT 14,
    `maxBookingPerSlot` INTEGER NOT NULL DEFAULT 10,
    `maxTableSize` INTEGER NOT NULL DEFAULT 12,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'HKD',
    `taxRate` DOUBLE NOT NULL DEFAULT 0,
    `serviceCharge` DOUBLE NOT NULL DEFAULT 0,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
