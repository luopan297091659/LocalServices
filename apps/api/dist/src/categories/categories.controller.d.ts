import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        children: {
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
        }[];
    } & {
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
    })[]>;
}
