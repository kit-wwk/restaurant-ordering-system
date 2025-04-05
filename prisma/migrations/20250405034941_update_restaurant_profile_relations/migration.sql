/*
  Warnings:

  - You are about to drop the column `category` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `categories` on the `RestaurantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `promotions` on the `RestaurantProfile` table. All the data in the column will be lost.
  - You are about to drop the `OperatingHours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `restaurantId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `OperatingHours` DROP FOREIGN KEY `OperatingHours_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `Promotion` DROP FOREIGN KEY `Promotion_restaurantId_fkey`;

-- DropIndex
DROP INDEX `Promotion_restaurantId_fkey` ON `Promotion`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `restaurantId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `MenuItem` DROP COLUMN `category`,
    DROP COLUMN `image`,
    ADD COLUMN `categoryId` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Promotion` ADD COLUMN `isAutoApplied` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `RestaurantProfile` DROP COLUMN `categories`,
    DROP COLUMN `promotions`;

-- DropTable
DROP TABLE `OperatingHours`;

-- DropTable
DROP TABLE `Restaurant`;
