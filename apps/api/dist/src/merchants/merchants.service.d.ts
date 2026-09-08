import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SearchMerchantsDto } from './dto/search-merchants.dto';
export interface MerchantWithDistance {
    distance?: number;
    [key: string]: unknown;
}
export declare class MerchantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    search(query: SearchMerchantsDto): Promise<{
        items: MerchantWithDistance[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getOne(idOrSlug: string): Promise<{
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            prefectureCode: string | null;
            municipalityCode: string | null;
            merchantId: string;
            postalCode: string | null;
            prefectureName: string | null;
            municipalityName: string | null;
            town: string | null;
            chome: string | null;
            block: string | null;
            building: string | null;
            room: string | null;
            fullAddress: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
        } | null;
        businessHours: {
            id: string;
            merchantId: string;
            dayOfWeek: number;
            isClosed: boolean;
            openTime1: string | null;
            closeTime1: string | null;
            openTime2: string | null;
            closeTime2: string | null;
        }[];
        specialHours: {
            id: string;
            createdAt: Date;
            merchantId: string;
            isClosed: boolean;
            openTime1: string | null;
            closeTime1: string | null;
            date: Date;
            note: string | null;
        }[];
        categories: ({
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sort: number;
                nameJa: string;
                nameKana: string | null;
                nameEn: string | null;
                parentId: string | null;
                icon: string | null;
                enabled: boolean;
            };
        } & {
            categoryId: string;
            merchantId: string;
        })[];
        services: {
            id: string;
            status: import(".prisma/client").$Enums.ContentStatus;
            createdAt: Date;
            updatedAt: Date;
            categoryId: string | null;
            sort: number;
            nameJa: string;
            nameKana: string | null;
            coverUrl: string | null;
            descriptionJa: string | null;
            viewCount: number;
            merchantId: string;
            summaryJa: string | null;
            priceType: import(".prisma/client").$Enums.PriceType;
            priceMin: number | null;
            priceMax: number | null;
            unit: string | null;
            taxIncluded: boolean;
        }[];
        products: {
            id: string;
            status: import(".prisma/client").$Enums.ContentStatus;
            createdAt: Date;
            updatedAt: Date;
            categoryId: string | null;
            nameJa: string;
            coverUrl: string | null;
            descriptionJa: string | null;
            viewCount: number;
            merchantId: string;
            summaryJa: string | null;
            unit: string | null;
            taxIncluded: boolean;
            price: number | null;
            originalPrice: number | null;
            stock: number | null;
            attributes: Prisma.JsonValue | null;
        }[];
        media: {
            id: string;
            createdAt: Date;
            sort: number;
            merchantId: string | null;
            bizType: import(".prisma/client").$Enums.MediaBizType;
            bizId: string;
            mediaType: import(".prisma/client").$Enums.MediaType;
            url: string;
            thumbnailUrl: string | null;
            mimeType: string | null;
            size: number | null;
        }[];
    } & {
        email: string | null;
        phone: string | null;
        id: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        updatedAt: Date;
        rating: Prisma.Decimal;
        nameJa: string;
        nameKana: string | null;
        nameEn: string | null;
        slug: string | null;
        logoUrl: string | null;
        coverUrl: string | null;
        descriptionJa: string | null;
        shortDescriptionJa: string | null;
        website: string | null;
        lineUrl: string | null;
        instagramUrl: string | null;
        reviewCount: number;
        viewCount: number;
        consultCount: number;
        favoriteCount: number;
    }>;
    services(merchantId: string): Prisma.PrismaPromise<({
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sort: number;
            nameJa: string;
            nameKana: string | null;
            nameEn: string | null;
            parentId: string | null;
            icon: string | null;
            enabled: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ContentStatus;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        sort: number;
        nameJa: string;
        nameKana: string | null;
        coverUrl: string | null;
        descriptionJa: string | null;
        viewCount: number;
        merchantId: string;
        summaryJa: string | null;
        priceType: import(".prisma/client").$Enums.PriceType;
        priceMin: number | null;
        priceMax: number | null;
        unit: string | null;
        taxIncluded: boolean;
    })[]>;
    products(merchantId: string): Prisma.PrismaPromise<({
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sort: number;
            nameJa: string;
            nameKana: string | null;
            nameEn: string | null;
            parentId: string | null;
            icon: string | null;
            enabled: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ContentStatus;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        nameJa: string;
        coverUrl: string | null;
        descriptionJa: string | null;
        viewCount: number;
        merchantId: string;
        summaryJa: string | null;
        unit: string | null;
        taxIncluded: boolean;
        price: number | null;
        originalPrice: number | null;
        stock: number | null;
        attributes: Prisma.JsonValue | null;
    })[]>;
    media(merchantId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        sort: number;
        merchantId: string | null;
        bizType: import(".prisma/client").$Enums.MediaBizType;
        bizId: string;
        mediaType: import(".prisma/client").$Enums.MediaType;
        url: string;
        thumbnailUrl: string | null;
        mimeType: string | null;
        size: number | null;
    }[]>;
    hours(merchantId: string): Prisma.PrismaPromise<{
        id: string;
        merchantId: string;
        dayOfWeek: number;
        isClosed: boolean;
        openTime1: string | null;
        closeTime1: string | null;
        openTime2: string | null;
        closeTime2: string | null;
    }[]>;
    private openNowWhere;
    private distanceBounds;
    private distanceMeters;
}
