/*
  Warnings:

  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `promotionId` VARCHAR(191) NULL,
    ADD COLUMN `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Update existing orders to set subtotal equal to total
UPDATE `Order` SET `subtotal` = `total`;

-- Remove the default value from subtotal after updating existing data
ALTER TABLE `Order` ALTER COLUMN `subtotal` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `Order_promotionId_idx` ON `Order`(`promotionId`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
