import { IsEnum, IsString } from 'class-validator';
import { FavoriteType } from '@prisma/client';
export class FavoriteDto { @IsEnum(FavoriteType) type!: FavoriteType; @IsString() targetId!: string; }
