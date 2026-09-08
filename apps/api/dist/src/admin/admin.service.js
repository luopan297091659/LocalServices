"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dashboard() {
        const [users, merchants, activeMerchants, pendingMerchants, conversations, favorites, views] = await Promise.all([
            this.prisma.user.count(), this.prisma.merchant.count(), this.prisma.merchant.count({ where: { status: 'ACTIVE' } }),
            this.prisma.merchant.count({ where: { status: 'PENDING' } }), this.prisma.conversation.count(), this.prisma.favorite.count(),
            this.prisma.merchant.aggregate({ _sum: { viewCount: true } }),
        ]);
        return { users, merchants, activeMerchants, pendingMerchants, conversations, favorites, merchantViews: views._sum.viewCount ?? 0, consultConversionRate: views._sum.viewCount ? Number((conversations / views._sum.viewCount * 100).toFixed(2)) : 0 };
    }
    users() { return this.prisma.user.findMany({ select: { id: true, email: true, phone: true, nickname: true, role: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' } }); }
    updateUser(id, status) { return this.prisma.user.update({ where: { id }, data: { status } }); }
    merchants(status) { return this.prisma.merchant.findMany({ where: status ? { status } : {}, include: { address: true, categories: { include: { category: true } }, verifications: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { updatedAt: 'desc' } }); }
    merchant(id) { return this.prisma.merchant.findUniqueOrThrow({ where: { id }, include: { address: true, businessHours: true, categories: { include: { category: true } }, verifications: { orderBy: { createdAt: 'desc' } }, members: { include: { user: { select: { id: true, email: true, phone: true, nickname: true } } } } } }); }
    async approve(adminId, id, ip) {
        return this.prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.update({ where: { id }, data: { status: 'ACTIVE' } });
            await tx.merchantVerification.updateMany({ where: { merchantId: id, status: 'PENDING' }, data: { status: 'APPROVED', reviewedAt: new Date() } });
            await tx.auditLog.create({ data: { adminId, action: 'MERCHANT_APPROVE', targetType: 'Merchant', targetId: id, ip } });
            return merchant;
        });
    }
    async reject(adminId, id, dto, ip) {
        return this.prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.update({ where: { id }, data: { status: 'REJECTED' } });
            await tx.merchantVerification.updateMany({ where: { merchantId: id, status: 'PENDING' }, data: { status: 'REJECTED', rejectReason: dto.reason, reviewedAt: new Date() } });
            await tx.auditLog.create({ data: { adminId, action: 'MERCHANT_REJECT', targetType: 'Merchant', targetId: id, changes: { reason: dto.reason }, ip } });
            return merchant;
        });
    }
    async status(adminId, id, status, ip) {
        const merchant = await this.prisma.merchant.update({ where: { id }, data: { status } });
        await this.prisma.auditLog.create({ data: { adminId, action: 'MERCHANT_STATUS', targetType: 'Merchant', targetId: id, changes: { status }, ip } });
        return merchant;
    }
    categories() { return this.prisma.category.findMany({ include: { parent: true }, orderBy: { sort: 'asc' } }); }
    createCategory(dto) { return this.prisma.category.create({ data: dto }); }
    updateCategory(id, dto) { return this.prisma.category.update({ where: { id }, data: dto }); }
    async deleteCategory(id) { const used = await this.prisma.merchantCategory.count({ where: { categoryId: id } }); if (used)
        throw new common_1.NotFoundException('利用中のカテゴリーは削除できません'); return this.prisma.category.delete({ where: { id } }); }
    banners() { return this.prisma.banner.findMany({ orderBy: { sort: 'asc' } }); }
    services() { return this.prisma.service.findMany({ include: { merchant: { select: { id: true, nameJa: true } }, category: true }, orderBy: { updatedAt: 'desc' } }); }
    products() { return this.prisma.product.findMany({ include: { merchant: { select: { id: true, nameJa: true } }, category: true }, orderBy: { updatedAt: 'desc' } }); }
    media() { return this.prisma.mediaFile.findMany({ include: { merchant: { select: { id: true, nameJa: true } } }, orderBy: { createdAt: 'desc' } }); }
    createBanner(dto) { return this.prisma.banner.create({ data: dto }); }
    updateBanner(id, dto) { return this.prisma.banner.update({ where: { id }, data: dto }); }
    deleteBanner(id) { return this.prisma.banner.delete({ where: { id } }); }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map