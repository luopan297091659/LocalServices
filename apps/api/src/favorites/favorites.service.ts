import { Injectable } from '@nestjs/common';
import { FavoriteType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { FavoriteDto } from './dto/favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}
  list(userId: string) { return this.prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }); }
  async add(userId: string, dto: FavoriteDto) {
    const favorite = await this.prisma.favorite.upsert({ where: { userId_type_targetId: { userId, ...dto } }, create: { userId, ...dto }, update: {} });
    if (dto.type === FavoriteType.MERCHANT) await this.prisma.merchant.update({ where: { id: dto.targetId }, data: { favoriteCount: { increment: 1 } } }).catch(() => undefined);
    return favorite;
  }
  async remove(userId: string, type: FavoriteType, targetId: string) {
    const result = await this.prisma.favorite.deleteMany({ where: { userId, type, targetId } });
    if (result.count && type === FavoriteType.MERCHANT) await this.prisma.merchant.update({ where: { id: targetId }, data: { favoriteCount: { decrement: 1 } } }).catch(() => undefined);
    return { deleted: Boolean(result.count) };
  }
}
