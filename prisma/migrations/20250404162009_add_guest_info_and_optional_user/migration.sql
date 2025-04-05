-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropIndex
DROP INDEX `Booking_userId_fkey` ON `Booking`;

-- DropIndex
DROP INDEX `Order_userId_fkey` ON `Order`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `guestEmail` VARCHAR(191) NULL,
    ADD COLUMN `guestName` VARCHAR(191) NULL,
    ADD COLUMN `guestPhone` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `guestEmail` VARCHAR(191) NULL,
    ADD COLUMN `guestName` VARCHAR(191) NULL,
    ADD COLUMN `guestPhone` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
