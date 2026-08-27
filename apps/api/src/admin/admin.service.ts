import { Injectable, NotFoundException } from '@nestjs/common';
import { MerchantStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { BannerDto, CategoryDto, RejectMerchantDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [users, merchants, activeMerchants, pendingMerchants, conversations, favorites, views] = await Promise.all([
      this.prisma.user.count(), this.prisma.merchant.count(), this.prisma.merchant.count({ where: { status: 'ACTIVE' } }),
      this.prisma.merchant.count({ where: { status: 'PENDING' } }), this.prisma.conversation.count(), this.prisma.favorite.count(),
      this.prisma.merchant.aggregate({ _sum: { viewCount: true } }),
    ]);
    return { users, merchants, activeMerchants, pendingMerchants, conversations, favorites, merchantViews: views._sum.viewCount ?? 0, consultConversionRate: views._sum.viewCount ? Number((conversations / views._sum.viewCount * 100).toFixed(2)) : 0 };
  }

  users() { return this.prisma.user.findMany({ select: { id: true, email: true, phone: true, nickname: true, role: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' } }); }
  updateUser(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'DELETED') { return this.prisma.user.update({ where: { id }, data: { status } }); }
  merchants(status?: MerchantStatus) { return this.prisma.merchant.findMany({ where: status ? { status } : {}, include: { address: true, categories: { include: { category: true } }, verifications: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { updatedAt: 'desc' } }); }
  merchant(id: string) { return this.prisma.merchant.findUniqueOrThrow({ where: { id }, include: { address: true, businessHours: true, categories: { include: { category: true } }, verifications: { orderBy: { createdAt: 'desc' } }, members: { include: { user: { select: { id: true, email: true, phone: true, nickname: true } } } } } }); }

  async approve(adminId: string, id: string, ip?: string) {
    return this.prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.update({ where: { id }, data: { status: 'ACTIVE' } });
      await tx.merchantVerification.updateMany({ where: { merchantId: id, status: 'PENDING' }, data: { status: 'APPROVED', reviewedAt: new Date() } });
      await tx.auditLog.create({ data: { adminId, action: 'MERCHANT_APPROVE', targetType: 'Merchant', targetId: id, ip } });
      return merchant;
    });
  }

  async reject(adminId: string, id: string, dto: RejectMerchantDto, ip?: string) {
    return this.prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.update({ where: { id }, data: { status: 'REJECTED' } });
      await tx.merchantVerification.updateMany({ where: { merchantId: id, status: 'PENDING' }, data: { status: 'REJECTED', rejectReason: dto.reason, reviewedAt: new Date() } });
      await tx.auditLog.create({ data: { adminId, action: 'MERCHANT_REJECT', targetType: 'Merchant', targetId: id, changes: { reason: dto.reason }, ip } });
      return merchant;
    });
  }

  async status(adminId: string, id: string, status: MerchantStatus, ip?: string) {
    const merchant = await this.prisma.merchant.update({ where: { id }, data: { status } });
    await this.prisma.auditLog.create({ data: { adminId, action: 'MERCHANT_STATUS', targetType: 'Merchant', targetId: id, changes: { status }, ip } });
    return merchant;
  }

  categories() { return this.prisma.category.findMany({ include: { parent: true }, orderBy: { sort: 'asc' } }); }
  createCategory(dto: CategoryDto) { return this.prisma.category.create({ data: dto }); }
  updateCategory(id: string, dto: CategoryDto) { return this.prisma.category.update({ where: { id }, data: dto }); }
  async deleteCategory(id: string) { const used = await this.prisma.merchantCategory.count({ where: { categoryId: id } }); if (used) throw new NotFoundException('利用中のカテゴリーは削除できません'); return this.prisma.category.delete({ where: { id } }); }
  banners() { return this.prisma.banner.findMany({ orderBy: { sort: 'asc' } }); }
  services() { return this.prisma.service.findMany({ include: { merchant: { select: { id: true, nameJa: true } }, category: true }, orderBy: { updatedAt: 'desc' } }); }
  products() { return this.prisma.product.findMany({ include: { merchant: { select: { id: true, nameJa: true } }, category: true }, orderBy: { updatedAt: 'desc' } }); }
  media() { return this.prisma.mediaFile.findMany({ include: { merchant: { select: { id: true, nameJa: true } } }, orderBy: { createdAt: 'desc' } }); }
  createBanner(dto: BannerDto) { return this.prisma.banner.create({ data: dto }); }
  updateBanner(id: string, dto: BannerDto) { return this.prisma.banner.update({ where: { id }, data: dto }); }
  deleteBanner(id: string) { return this.prisma.banner.delete({ where: { id } }); }
}
