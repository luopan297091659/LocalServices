import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEmail, IsEnum, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { ContentStatus, EntityType, MediaBizType, MediaType, PriceType } from '@prisma/client';

export class AddressDto {
  @IsOptional() @Matches(/^\d{7}$/) postalCode?: string;
  @IsOptional() @IsString() prefectureCode?: string;
  @IsOptional() @IsString() prefectureName?: string;
  @IsOptional() @IsString() municipalityCode?: string;
  @IsOptional() @IsString() municipalityName?: string;
  @IsOptional() @IsString() town?: string;
  @IsOptional() @IsString() chome?: string;
  @IsOptional() @IsString() block?: string;
  @IsOptional() @IsString() building?: string;
  @IsOptional() @IsString() room?: string;
  @IsString() @MaxLength(300) fullAddress!: string;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;
}

export class UpdateMerchantDto {
  @IsString() @MaxLength(120) nameJa!: string;
  @IsOptional() @IsString() @MaxLength(120) nameKana?: string;
  @IsOptional() @IsString() @MaxLength(3000) descriptionJa?: string;
  @IsOptional() @IsString() @MaxLength(180) shortDescriptionJa?: string;
  @IsOptional() @Matches(/^0\d{9,10}$/) phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsUrl() website?: string;
  @IsOptional() @IsUrl() lineUrl?: string;
  @IsOptional() @IsUrl() logoUrl?: string;
  @IsOptional() @IsUrl() coverUrl?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(5) @IsString({ each: true }) categoryIds?: string[];
  @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
}

export class VerificationDto {
  @IsEnum(EntityType) entityType!: EntityType;
  @IsOptional() @IsString() representativeName?: string;
  @IsOptional() @IsString() corporateName?: string;
  @IsOptional() @Matches(/^\d{13}$/) corporateNumber?: string;
  @IsOptional() @IsString() invoiceRegistrationNumber?: string;
  @IsOptional() @IsArray() @IsUrl({}, { each: true }) documentUrls?: string[];
}

export class BusinessHourDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsBoolean() isClosed!: boolean;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) openTime1?: string;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) closeTime1?: string;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) openTime2?: string;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) closeTime2?: string;
}

export class SetBusinessHoursDto {
  @IsArray() @ArrayMaxSize(7) @ValidateNested({ each: true }) @Type(() => BusinessHourDto) hours!: BusinessHourDto[];
}

export class ServiceDto {
  @IsString() @MaxLength(120) nameJa!: string;
  @IsOptional() @IsString() nameKana?: string;
  @IsOptional() @IsString() @MaxLength(300) summaryJa?: string;
  @IsOptional() @IsString() @MaxLength(5000) descriptionJa?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsEnum(PriceType) priceType!: PriceType;
  @IsOptional() @IsInt() @Min(0) priceMin?: number;
  @IsOptional() @IsInt() @Min(0) priceMax?: number;
  @IsOptional() @IsString() unit?: string;
  @IsBoolean() taxIncluded = true;
  @IsOptional() @IsUrl() coverUrl?: string;
  @IsOptional() @IsEnum(ContentStatus) status: ContentStatus = ContentStatus.DRAFT;
}

export class ProductDto {
  @IsString() @MaxLength(120) nameJa!: string;
  @IsOptional() @IsString() @MaxLength(300) summaryJa?: string;
  @IsOptional() @IsString() @MaxLength(5000) descriptionJa?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsInt() @Min(0) price?: number;
  @IsOptional() @IsInt() @Min(0) originalPrice?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsString() unit?: string;
  @IsBoolean() taxIncluded = true;
  @IsOptional() @IsUrl() coverUrl?: string;
  @IsOptional() @IsEnum(ContentStatus) status: ContentStatus = ContentStatus.DRAFT;
}

export class MediaDto {
  @IsEnum(MediaBizType) bizType!: MediaBizType;
  @IsString() bizId!: string;
  @IsEnum(MediaType) mediaType!: MediaType;
  @IsUrl() url!: string;
  @IsOptional() @IsUrl() thumbnailUrl?: string;
  @IsOptional() @IsString() mimeType?: string;
  @IsOptional() @IsInt() @Min(0) size?: number;
}
