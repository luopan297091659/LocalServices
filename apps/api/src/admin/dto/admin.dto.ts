import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { MerchantStatus, UserStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class RejectMerchantDto { @IsString() @MaxLength(500) reason!: string; }
export class MerchantStatusDto { @IsEnum(MerchantStatus) status!: MerchantStatus; }
export class UserStatusDto { @IsEnum(UserStatus) status!: UserStatus; }
export class CategoryDto { @IsString() nameJa!: string; @IsOptional() @IsString() parentId?: string; @IsOptional() @IsString() icon?: string; @IsOptional() @IsBoolean() enabled?: boolean; }
export class BannerDto { @IsString() title!: string; @IsUrl() imageUrl!: string; @IsOptional() @IsUrl() linkUrl?: string; @IsOptional() @IsBoolean() enabled?: boolean; }
