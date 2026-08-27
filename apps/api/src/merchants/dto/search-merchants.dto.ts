import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchMerchantsDto {
  @IsOptional() @IsString() keyword?: string;
  @IsOptional() @IsString() prefectureCode?: string;
  @IsOptional() @IsString() municipalityCode?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @Type(() => Number) @IsLatitude() lat?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() lng?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(100) @Max(50000) radius?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() openNow?: boolean;
  @IsOptional() @IsIn(['recommended', 'distance', 'rating', 'popular', 'newest']) sort: string = 'recommended';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize = 20;
}
