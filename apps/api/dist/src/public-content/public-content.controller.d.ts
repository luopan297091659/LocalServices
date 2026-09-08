import { PrismaService } from '../prisma/prisma.service';
export declare class PublicContentController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    service(id: string): Promise<{
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
        merchant: {
            id: string;
            nameJa: string;
            slug: string | null;
            logoUrl: string | null;
        };
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
    }>;
    product(id: string): Promise<{
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
        merchant: {
            id: string;
            nameJa: string;
            slug: string | null;
            logoUrl: string | null;
        };
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
        attributes: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    prefectures(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        sort: number;
        nameJa: string;
        nameEn: string | null;
        code: string;
    }[]>;
    municipalities(prefectureCode?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        nameJa: string;
        nameKana: string | null;
        code: string;
        prefectureId: number;
    }[]>;
    banners(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sort: number;
        enabled: boolean;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        startsAt: Date | null;
        endsAt: Date | null;
    }[]>;
}
