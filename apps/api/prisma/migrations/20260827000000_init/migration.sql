-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `refreshTokenHash` VARCHAR(191) NULL,
    `nickname` VARCHAR(191) NULL,
    `avatarUrl` TEXT NULL,
    `locale` VARCHAR(191) NOT NULL DEFAULT 'ja-JP',
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MERCHANT_ADMIN', 'MERCHANT_STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    `status` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prefecture` (
    `id` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `nameJa` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL,

    UNIQUE INDEX `Prefecture_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Municipality` (
    `id` VARCHAR(191) NOT NULL,
    `prefectureId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `nameJa` VARCHAR(191) NOT NULL,
    `nameKana` VARCHAR(191) NULL,

    UNIQUE INDEX `Municipality_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `nameJa` VARCHAR(191) NOT NULL,
    `nameKana` VARCHAR(191) NULL,
    `nameEn` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Merchant` (
    `id` VARCHAR(191) NOT NULL,
    `nameJa` VARCHAR(191) NOT NULL,
    `nameKana` VARCHAR(191) NULL,
    `nameEn` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NULL,
    `logoUrl` TEXT NULL,
    `coverUrl` TEXT NULL,
    `descriptionJa` TEXT NULL,
    `shortDescriptionJa` TEXT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` TEXT NULL,
    `lineUrl` TEXT NULL,
    `instagramUrl` TEXT NULL,
    `status` ENUM('DRAFT', 'PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `rating` DECIMAL(2, 1) NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `consultCount` INTEGER NOT NULL DEFAULT 0,
    `favoriteCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Merchant_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MerchantMember` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isOwner` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `MerchantMember_merchantId_userId_key`(`merchantId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MerchantCategory` (
    `merchantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`merchantId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MerchantAddress` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NULL,
    `prefectureCode` VARCHAR(191) NULL,
    `prefectureName` VARCHAR(191) NULL,
    `municipalityCode` VARCHAR(191) NULL,
    `municipalityName` VARCHAR(191) NULL,
    `town` VARCHAR(191) NULL,
    `chome` VARCHAR(191) NULL,
    `block` VARCHAR(191) NULL,
    `building` VARCHAR(191) NULL,
    `room` VARCHAR(191) NULL,
    `fullAddress` TEXT NOT NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MerchantAddress_merchantId_key`(`merchantId`),
    INDEX `MerchantAddress_prefectureCode_municipalityCode_idx`(`prefectureCode`, `municipalityCode`),
    INDEX `MerchantAddress_latitude_longitude_idx`(`latitude`, `longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MerchantBusinessHour` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `openTime1` VARCHAR(191) NULL,
    `closeTime1` VARCHAR(191) NULL,
    `openTime2` VARCHAR(191) NULL,
    `closeTime2` VARCHAR(191) NULL,

    UNIQUE INDEX `MerchantBusinessHour_merchantId_dayOfWeek_key`(`merchantId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MerchantSpecialHour` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `isClosed` BOOLEAN NOT NULL,
    `openTime1` VARCHAR(191) NULL,
    `closeTime1` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MerchantSpecialHour_merchantId_date_key`(`merchantId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MerchantVerification` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `entityType` ENUM('INDIVIDUAL', 'SOLE_PROPRIETOR', 'CORPORATION') NOT NULL,
    `representativeName` VARCHAR(191) NULL,
    `corporateName` VARCHAR(191) NULL,
    `corporateNumber` VARCHAR(191) NULL,
    `invoiceRegistrationNumber` VARCHAR(191) NULL,
    `documentUrls` JSON NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectReason` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `nameJa` VARCHAR(191) NOT NULL,
    `nameKana` VARCHAR(191) NULL,
    `summaryJa` TEXT NULL,
    `descriptionJa` TEXT NULL,
    `priceType` ENUM('FIXED', 'START_FROM', 'RANGE', 'NEGOTIABLE', 'HOURLY', 'DAILY', 'PER_TIME', 'PER_PERSON', 'PER_ROOM', 'CUSTOM') NOT NULL,
    `priceMin` INTEGER NULL,
    `priceMax` INTEGER NULL,
    `unit` VARCHAR(191) NULL,
    `taxIncluded` BOOLEAN NOT NULL DEFAULT true,
    `coverUrl` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'SUSPENDED') NOT NULL DEFAULT 'DRAFT',
    `sort` INTEGER NOT NULL DEFAULT 0,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `nameJa` VARCHAR(191) NOT NULL,
    `summaryJa` TEXT NULL,
    `descriptionJa` TEXT NULL,
    `price` INTEGER NULL,
    `originalPrice` INTEGER NULL,
    `stock` INTEGER NULL,
    `unit` VARCHAR(191) NULL,
    `attributes` JSON NULL,
    `taxIncluded` BOOLEAN NOT NULL DEFAULT true,
    `coverUrl` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'SUSPENDED') NOT NULL DEFAULT 'DRAFT',
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaFile` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NULL,
    `bizType` ENUM('MERCHANT', 'SERVICE', 'PRODUCT', 'MESSAGE', 'VERIFICATION') NOT NULL,
    `bizId` VARCHAR(191) NOT NULL,
    `mediaType` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `url` TEXT NOT NULL,
    `thumbnailUrl` TEXT NULL,
    `mimeType` VARCHAR(191) NULL,
    `size` INTEGER NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MediaFile_bizType_bizId_idx`(`bizType`, `bizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favorite` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('MERCHANT', 'SERVICE', 'PRODUCT') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Favorite_userId_type_targetId_key`(`userId`, `type`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `lastMessage` TEXT NULL,
    `lastMessageAt` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'CLOSED', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Conversation_customerId_idx`(`customerId`),
    INDEX `Conversation_merchantId_idx`(`merchantId`),
    UNIQUE INDEX `Conversation_customerId_merchantId_key`(`customerId`, `merchantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `senderType` ENUM('CUSTOMER', 'MERCHANT', 'SYSTEM') NOT NULL,
    `messageType` ENUM('TEXT', 'IMAGE', 'SERVICE', 'PRODUCT') NOT NULL,
    `content` TEXT NULL,
    `mediaUrl` TEXT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Message_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `linkUrl` TEXT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NULL,
    `changes` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_adminId_createdAt_idx`(`adminId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Municipality` ADD CONSTRAINT `Municipality_prefectureId_fkey` FOREIGN KEY (`prefectureId`) REFERENCES `Prefecture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MerchantMember` ADD CONSTRAINT `MerchantMember_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MerchantMember` ADD CONSTRAINT `MerchantMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MerchantCategory` ADD CONSTRAINT `MerchantCategory_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MerchantCategory` ADD CONSTRAINT `MerchantCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MerchantAddress` ADD CONSTRAINT `MerchantAddress_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MerchantBusinessHour` ADD CONSTRAINT `MerchantBusinessHour_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MerchantSpecialHour` ADD CONSTRAINT `MerchantSpecialHour_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MerchantVerification` ADD CONSTRAINT `MerchantVerification_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaFile` ADD CONSTRAINT `MediaFile_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
