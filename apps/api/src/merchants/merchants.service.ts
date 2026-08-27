import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SearchMerchantsDto } from './dto/search-merchants.dto';

export interface MerchantWithDistance { distance?: number; [key: string]: unknown }

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchMerchantsDto) {
    const where: Prisma.MerchantWhereInput = {
      status: 'ACTIVE',
      ...(query.prefectureCode || query.municipalityCode ? { address: { is: { ...(query.prefectureCode ? { prefectureCode: query.prefectureCode } : {}), ...(query.municipalityCode ? { municipalityCode: query.municipalityCode } : {}) } } } : {}),
      ...(query.categoryId ? { categories: { some: { categoryId: query.categoryId } } } : {}),
      ...(query.keyword ? { OR: [
        { nameJa: { contains: query.keyword, mode: 'insensitive' } },
        { nameKana: { contains: query.keyword, mode: 'insensitive' } },
        { descriptionJa: { contains: query.keyword, mode: 'insensitive' } },
        { categories: { some: { category: { nameJa: { contains: query.keyword, mode: 'insensitive' } } } } },
        { services: { some: { status: 'PUBLISHED', OR: [{ nameJa: { contains: query.keyword, mode: 'insensitive' } }, { nameKana: { contains: query.keyword, mode: 'insensitive' } }] } } },
        { products: { some: { status: 'PUBLISHED', nameJa: { contains: query.keyword, mode: 'insensitive' } } } },
      ] } : {}),
      ...(query.openNow ? this.openNowWhere() : {}),
    };

    const orderBy: Prisma.MerchantOrderByWithRelationInput = query.sort === 'rating' ? { rating: 'desc' }
      : query.sort === 'popular' ? { viewCount: 'desc' }
      : query.sort === 'newest' ? { createdAt: 'desc' }
      : { favoriteCount: 'desc' };
    const useDistance = query.lat !== undefined && query.lng !== undefined;
    const raw = await this.prisma.merchant.findMany({
      where,
      include: {
        address: true,
        categories: { include: { category: true }, take: 3 },
        services: { where: { status: 'PUBLISHED' }, orderBy: { sort: 'asc' }, take: 1 },
      },
      orderBy,
      ...(useDistance ? {} : { skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
    });
    let items: MerchantWithDistance[] = raw.map((merchant) => ({
      ...merchant,
      ...(useDistance && merchant.address?.latitude && merchant.address.longitude
        ? { distance: this.distanceMeters(query.lat!, query.lng!, Number(merchant.address.latitude), Number(merchant.address.longitude)) }
        : {}),
    }));
    if (query.radius && useDistance) items = items.filter((item) => typeof item.distance === 'number' && item.distance <= query.radius!);
    if (query.sort === 'distance') items.sort((a, b) => (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE));
    const total = useDistance ? items.length : await this.prisma.merchant.count({ where });
    if (useDistance) items = items.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    return { items, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }

  async getOne(idOrSlug: string) {
    const merchant = await this.prisma.merchant.findFirst({
      where: { status: 'ACTIVE', OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        address: true, businessHours: { orderBy: { dayOfWeek: 'asc' } }, specialHours: true,
        categories: { include: { category: true } }, services: { where: { status: 'PUBLISHED' }, orderBy: { sort: 'asc' } },
        products: { where: { status: 'PUBLISHED' } }, media: { orderBy: { sort: 'asc' } },
      },
    });
    if (!merchant) throw new NotFoundException('店舗が見つかりません');
    await this.prisma.merchant.update({ where: { id: merchant.id }, data: { viewCount: { increment: 1 } } });
    return merchant;
  }

  services(merchantId: string) { return this.prisma.service.findMany({ where: { merchantId, status: 'PUBLISHED' }, include: { category: true }, orderBy: { sort: 'asc' } }); }
  products(merchantId: string) { return this.prisma.product.findMany({ where: { merchantId, status: 'PUBLISHED' }, include: { category: true } }); }
  media(merchantId: string) { return this.prisma.mediaFile.findMany({ where: { merchantId }, orderBy: { sort: 'asc' } }); }
  hours(merchantId: string) { return this.prisma.merchantBusinessHour.findMany({ where: { merchantId }, orderBy: { dayOfWeek: 'asc' } }); }

  private openNowWhere(): Prisma.MerchantWhereInput {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts();
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
    const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
    const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
    const time = `${hour}:${minute}`;
    return { businessHours: { some: { dayOfWeek: day, isClosed: false, OR: [
      { openTime1: { lte: time }, closeTime1: { gt: time } },
      { openTime2: { lte: time }, closeTime2: { gt: time } },
    ] } } };
  }

  private distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (degrees: number): number => degrees * Math.PI / 180;
    const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
}
