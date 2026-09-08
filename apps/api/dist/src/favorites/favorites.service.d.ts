import { FavoriteType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { FavoriteDto } from './dto/favorite.dto';
export declare class FavoritesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(userId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        targetId: string;
        type: import(".prisma/client").$Enums.FavoriteType;
    }[]>;
    add(userId: string, dto: FavoriteDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        targetId: string;
        type: import(".prisma/client").$Enums.FavoriteType;
    }>;
    remove(userId: string, type: FavoriteType, targetId: string): Promise<{
        deleted: boolean;
    }>;
}
