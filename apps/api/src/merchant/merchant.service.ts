import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MerchantStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { MediaDto, ProductDto, ServiceDto, SetBusinessHoursDto, UpdateMerchantDto, VerificationDto } from './dto/merchant.dto';

@Injectable()
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(userId: string) {
    const member = await this.member(userId);
    return this.prisma.merchant.findUniqueOrThrow({ where: { id: member.merchantId }, include: { address: true, categories: { include: { category: true } }, businessHours: { orderBy: { dayOfWeek: 'asc' } }, verifications: { orderBy: { createdAt: 'desc' }, take: 1 } } });
  }

  async create(userId: string, dto: UpdateMerchantDto) {
    const existing = await this.prisma.merchantMember.findFirst({ where: { userId } });
    if (existing) throw new ForbiddenException('すでに店舗に所属しています');
    return this.prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({ data: {
        nameJa: dto.nameJa, nameKana: dto.nameKana, descriptionJa: dto.descriptionJa, shortDescriptionJa: dto.shortDescriptionJa,
        phone: dto.phone, email: dto.email, website: dto.website, lineUrl: dto.lineUrl, logoUrl: dto.logoUrl, coverUrl: dto.coverUrl,
        ...(dto.address ? { address: { create: dto.address } } : {}),
        ...(dto.categoryIds ? { categories: { create: dto.categoryIds.map((categoryId) => ({ categoryId })) } } : {}),
        members: { create: { userId, isOwner: true } },
      } });
      await tx.user.update({ where: { id: userId }, data: { role: 'MERCHANT_ADMIN' } });
      return merchant;
    });
  }

  async update(userId: string, dto: UpdateMerchantDto) {
    const { merchantId } = await this.member(userId);
    return this.prisma.$transaction(async (tx) => {
      if (dto.categoryIds) {
        await tx.merchantCategory.deleteMany({ where: { merchantId } });
        await tx.merchantCategory.createMany({ data: dto.categoryIds.map((categoryId) => ({ merchantId, categoryId })) });
      }
      if (dto.address) await tx.merchantAddress.upsert({ where: { merchantId }, create: { merchantId, ...dto.address }, update: dto.address });
      const merchantData = {
        nameJa: dto.nameJa, nameKana: dto.nameKana, descriptionJa: dto.descriptionJa,
        shortDescriptionJa: dto.shortDescriptionJa, phone: dto.phone, email: dto.email,
        website: dto.website, lineUrl: dto.lineUrl, logoUrl: dto.logoUrl, coverUrl: dto.coverUrl,
      };
      return tx.merchant.update({ where: { id: merchantId }, data: merchantData });
    });
  }

  async submit(userId: string, dto: VerificationDto) {
    const { merchantId } = await this.member(userId);
    return this.prisma.$transaction(async (tx) => {
      const verification = await tx.merchantVerification.create({ data: { merchantId, ...dto, documentUrls: dto.documentUrls ?? Prisma.JsonNull } });
      await tx.merchant.update({ where: { id: merchantId }, data: { status: MerchantStatus.PENDING } });
      return verification;
    });
  }

  async dashboard(userId: string) {
    const { merchantId } = await this.member(userId);
    const [merchant, serviceCount, productCount, conversationCount, recentConversations] = await Promise.all([
      this.prisma.merchant.findUniqueOrThrow({ where: { id: merchantId }, select: { viewCount: true, consultCount: true, favoriteCount: true, status: true } }),
      this.prisma.service.count({ where: { merchantId } }), this.prisma.product.count({ where: { merchantId } }),
      this.prisma.conversation.count({ where: { merchantId } }),
      this.prisma.conversation.findMany({ where: { merchantId }, include: { customer: { select: { id: true, nickname: true, avatarUrl: true } } }, orderBy: { lastMessageAt: 'desc' }, take: 5 }),
    ]);
    return { ...merchant, serviceCount, productCount, conversationCount, recentConversations };
  }

  async setHours(userId: string, dto: SetBusinessHoursDto) {
    const { merchantId } = await this.member(userId);
    return this.prisma.$transaction(dto.hours.map((hour) => this.prisma.merchantBusinessHour.upsert({ where: { merchantId_dayOfWeek: { merchantId, dayOfWeek: hour.dayOfWeek } }, create: { merchantId, ...hour }, update: hour })));
  }

  async listServices(userId: string) { const { merchantId } = await this.member(userId); return this.prisma.service.findMany({ where: { merchantId }, orderBy: { updatedAt: 'desc' } }); }
  async createService(userId: string, dto: ServiceDto) { const { merchantId } = await this.member(userId); return this.prisma.service.create({ data: { merchantId, ...dto } }); }
  async updateService(userId: string, id: string, dto: ServiceDto) { await this.owns('service', userId, id); return this.prisma.service.update({ where: { id }, data: dto }); }
  async deleteService(userId: string, id: string) { await this.owns('service', userId, id); return this.prisma.service.delete({ where: { id } }); }
  async listProducts(userId: string) { const { merchantId } = await this.member(userId); return this.prisma.product.findMany({ where: { merchantId }, orderBy: { updatedAt: 'desc' } }); }
  async createProduct(userId: string, dto: ProductDto) { const { merchantId } = await this.member(userId); return this.prisma.product.create({ data: { merchantId, ...dto } }); }
  async updateProduct(userId: string, id: string, dto: ProductDto) { await this.owns('product', userId, id); return this.prisma.product.update({ where: { id }, data: dto }); }
  async deleteProduct(userId: string, id: string) { await this.owns('product', userId, id); return this.prisma.product.delete({ where: { id } }); }
  async listMedia(userId: string) { const { merchantId } = await this.member(userId); return this.prisma.mediaFile.findMany({ where: { merchantId }, orderBy: { sort: 'asc' } }); }
  async conversations(userId: string) { const { merchantId } = await this.member(userId); return this.prisma.conversation.findMany({ where: { merchantId }, include: { customer: { select: { id: true, nickname: true, avatarUrl: true } } }, orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }] }); }
  async addMedia(userId: string, dto: MediaDto) { const { merchantId } = await this.member(userId); return this.prisma.mediaFile.create({ data: { merchantId, ...dto } }); }
  async deleteMedia(userId: string, id: string) { const { merchantId } = await this.member(userId); const result = await this.prisma.mediaFile.deleteMany({ where: { id, merchantId } }); if (!result.count) throw new NotFoundException('メディアが見つかりません'); return { deleted: true }; }

  private async member(userId: string) {
    const member = await this.prisma.merchantMember.findFirst({ where: { userId } });
    if (!member) throw new ForbiddenException('店舗へのアクセス権がありません');
    return member;
  }

  private async owns(type: 'service' | 'product', userId: string, id: string): Promise<void> {
    const { merchantId } = await this.member(userId);
    const count = type === 'service' ? await this.prisma.service.count({ where: { id, merchantId } }) : await this.prisma.product.count({ where: { id, merchantId } });
    if (!count) throw new NotFoundException('コンテンツが見つかりません');
  }
}
