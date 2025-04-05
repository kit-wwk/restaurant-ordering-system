-- AlterTable
ALTER TABLE `RestaurantProfile` ADD COLUMN `categories` JSON NOT NULL,
    ADD COLUMN `licenseNumber` VARCHAR(191) NULL,
    ADD COLUMN `promotions` JSON NOT NULL,
    ADD COLUMN `rating` DOUBLE NOT NULL DEFAULT 4.5,
    ADD COLUMN `totalReviews` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `website` VARCHAR(191) NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `metaDescription` TEXT NULL;
