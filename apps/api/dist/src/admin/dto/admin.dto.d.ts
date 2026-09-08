import { MerchantStatus, UserStatus } from '@prisma/client';
export declare class RejectMerchantDto {
    reason: string;
}
export declare class MerchantStatusDto {
    status: MerchantStatus;
}
export declare class UserStatusDto {
    status: UserStatus;
}
export declare class CategoryDto {
    nameJa: string;
    parentId?: string;
    icon?: string;
    enabled?: boolean;
}
export declare class BannerDto {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    enabled?: boolean;
}
