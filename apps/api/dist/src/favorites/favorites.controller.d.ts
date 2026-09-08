import { FavoriteType } from '@prisma/client';
import type { AuthUser } from '../common/auth.types';
import { FavoriteDto } from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favorites;
    constructor(favorites: FavoritesService);
    list(user: AuthUser): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        targetId: string;
        type: import(".prisma/client").$Enums.FavoriteType;
    }[]>;
    add(user: AuthUser, dto: FavoriteDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        targetId: string;
        type: import(".prisma/client").$Enums.FavoriteType;
    }>;
    remove(user: AuthUser, type: FavoriteType, targetId: string): Promise<{
        deleted: boolean;
    }>;
}
