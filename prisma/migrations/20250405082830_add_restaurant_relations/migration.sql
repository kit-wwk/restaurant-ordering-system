-- CreateIndex
CREATE INDEX `Category_restaurantId_idx` ON `Category`(`restaurantId`);

-- CreateIndex
CREATE INDEX `MenuItem_categoryId_idx` ON `MenuItem`(`categoryId`);

-- CreateIndex
CREATE INDEX `Promotion_restaurantId_idx` ON `Promotion`(`restaurantId`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `RestaurantProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Promotion` ADD CONSTRAINT `Promotion_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `RestaurantProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
