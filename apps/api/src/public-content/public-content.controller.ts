import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Public()
@Controller()
export class PublicContentController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('services/:id')
  async service(@Param('id') id: string) {
    const service = await this.prisma.service.findFirst({ where: { id, status: 'PUBLISHED', merchant: { status: 'ACTIVE' } }, include: { merchant: { select: { id: true, nameJa: true, slug: true, logoUrl: true } }, category: true } });
    if (!service) throw new NotFoundException('サービスが見つかりません');
    await this.prisma.service.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return service;
  }

  @Get('products/:id')
  async product(@Param('id') id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, status: 'PUBLISHED', merchant: { status: 'ACTIVE' } }, include: { merchant: { select: { id: true, nameJa: true, slug: true, logoUrl: true } }, category: true } });
    if (!product) throw new NotFoundException('商品が見つかりません');
    await this.prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return product;
  }

  @Get('prefectures')
  prefectures() { return this.prisma.prefecture.findMany({ orderBy: { sort: 'asc' } }); }

  @Get('municipalities')
  municipalities(@Query('prefectureCode') prefectureCode?: string) {
    return this.prisma.municipality.findMany({ where: prefectureCode ? { prefecture: { code: prefectureCode } } : {}, orderBy: { code: 'asc' } });
  }

  @Get('banners')
  banners() {
    const now = new Date();
    return this.prisma.banner.findMany({ where: { enabled: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] }, orderBy: { sort: 'asc' } });
  }
}
