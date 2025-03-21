-- CreateTable
CREATE TABLE `SalesData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `totalSales` DOUBLE NOT NULL,
    `totalProfit` DOUBLE NOT NULL,
    `malfunctions` INTEGER NOT NULL,
    `diesel` DOUBLE NOT NULL,
    `adBlue` DOUBLE NOT NULL,
    `superE5` DOUBLE NOT NULL,
    `superE10` DOUBLE NOT NULL,
    `cleaning` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
