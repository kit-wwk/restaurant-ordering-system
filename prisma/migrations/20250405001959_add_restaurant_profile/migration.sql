-- CreateTable
CREATE TABLE `restaurant_profile` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
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
    `metaDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
