import { ContentStatus, EntityType, MediaBizType, MediaType, PriceType } from '@prisma/client';
export declare class AddressDto {
    postalCode?: string;
    prefectureCode?: string;
    prefectureName?: string;
    municipalityCode?: string;
    municipalityName?: string;
    town?: string;
    chome?: string;
    block?: string;
    building?: string;
    room?: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
}
export declare class UpdateMerchantDto {
    nameJa: string;
    nameKana?: string;
    descriptionJa?: string;
    shortDescriptionJa?: string;
    phone?: string;
    email?: string;
    website?: string;
    lineUrl?: string;
    logoUrl?: string;
    coverUrl?: string;
    categoryIds?: string[];
    address?: AddressDto;
}
export declare class VerificationDto {
    entityType: EntityType;
    representativeName?: string;
    corporateName?: string;
    corporateNumber?: string;
    invoiceRegistrationNumber?: string;
    documentUrls?: string[];
}
export declare class BusinessHourDto {
    dayOfWeek: number;
    isClosed: boolean;
    openTime1?: string;
    closeTime1?: string;
    openTime2?: string;
    closeTime2?: string;
}
export declare class SetBusinessHoursDto {
    hours: BusinessHourDto[];
}
export declare class ServiceDto {
    nameJa: string;
    nameKana?: string;
    summaryJa?: string;
    descriptionJa?: string;
    categoryId?: string;
    priceType: PriceType;
    priceMin?: number;
    priceMax?: number;
    unit?: string;
    taxIncluded: boolean;
    coverUrl?: string;
    status: ContentStatus;
}
export declare class ProductDto {
    nameJa: string;
    summaryJa?: string;
    descriptionJa?: string;
    categoryId?: string;
    price?: number;
    originalPrice?: number;
    stock?: number;
    unit?: string;
    taxIncluded: boolean;
    coverUrl?: string;
    status: ContentStatus;
}
export declare class MediaDto {
    bizType: MediaBizType;
    bizId: string;
    mediaType: MediaType;
    url: string;
    thumbnailUrl?: string;
    mimeType?: string;
    size?: number;
}
