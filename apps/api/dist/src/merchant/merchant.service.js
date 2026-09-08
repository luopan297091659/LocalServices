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
exports.MerchantService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let MerchantService = class MerchantService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async profile(userId) {
        const member = await this.member(userId);
        return this.prisma.merchant.findUniqueOrThrow({ where: { id: member.merchantId }, include: { address: true, categories: { include: { category: true } }, businessHours: { orderBy: { dayOfWeek: 'asc' } }, verifications: { orderBy: { createdAt: 'desc' }, take: 1 } } });
    }
    async create(userId, dto) {
        const existing = await this.prisma.merchantMember.findFirst({ where: { userId } });
        if (existing)
            throw new common_1.ForbiddenException('すでに店舗に所属しています');
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
    async update(userId, dto) {
        const { merchantId } = await this.member(userId);
        return this.prisma.$transaction(async (tx) => {
            if (dto.categoryIds) {
                await tx.merchantCategory.deleteMany({ where: { merchantId } });
                await tx.merchantCategory.createMany({ data: dto.categoryIds.map((categoryId) => ({ merchantId, categoryId })) });
            }
            if (dto.address)
                await tx.merchantAddress.upsert({ where: { merchantId }, create: { merchantId, ...dto.address }, update: dto.address });
            const merchantData = {
                nameJa: dto.nameJa, nameKana: dto.nameKana, descriptionJa: dto.descriptionJa,
                shortDescriptionJa: dto.shortDescriptionJa, phone: dto.phone, email: dto.email,
                website: dto.website, lineUrl: dto.lineUrl, logoUrl: dto.logoUrl, coverUrl: dto.coverUrl,
            };
            return tx.merchant.update({ where: { id: merchantId }, data: merchantData });
        });
    }
    async submit(userId, dto) {
        const { merchantId } = await this.member(userId);
        return this.prisma.$transaction(async (tx) => {
            const verification = await tx.merchantVerification.create({ data: { merchantId, ...dto, documentUrls: dto.documentUrls ?? client_1.Prisma.JsonNull } });
            await tx.merchant.update({ where: { id: merchantId }, data: { status: client_1.MerchantStatus.PENDING } });
            return verification;
        });
    }
    async dashboard(userId) {
        const { merchantId } = await this.member(userId);
        const [merchant, serviceCount, productCount, conversationCount, recentConversations] = await Promise.all([
            this.prisma.merchant.findUniqueOrThrow({ where: { id: merchantId }, select: { viewCount: true, consultCount: true, favoriteCount: true, status: true } }),
            this.prisma.service.count({ where: { merchantId } }), this.prisma.product.count({ where: { merchantId } }),
            this.prisma.conversation.count({ where: { merchantId } }),
            this.prisma.conversation.findMany({ where: { merchantId }, include: { customer: { select: { id: true, nickname: true, avatarUrl: true } } }, orderBy: { lastMessageAt: 'desc' }, take: 5 }),
        ]);
        return { ...merchant, serviceCount, productCount, conversationCount, recentConversations };
    }
    async setHours(userId, dto) {
        const { merchantId } = await this.member(userId);
        return this.prisma.$transaction(dto.hours.map((hour) => this.prisma.merchantBusinessHour.upsert({ where: { merchantId_dayOfWeek: { merchantId, dayOfWeek: hour.dayOfWeek } }, create: { merchantId, ...hour }, update: hour })));
    }
    async listServices(userId) { const { merchantId } = await this.member(userId); return this.prisma.service.findMany({ where: { merchantId }, orderBy: { updatedAt: 'desc' } }); }
    async createService(userId, dto) { const { merchantId } = await this.member(userId); return this.prisma.service.create({ data: { merchantId, ...dto } }); }
    async updateService(userId, id, dto) { await this.owns('service', userId, id); return this.prisma.service.update({ where: { id }, data: dto }); }
    async deleteService(userId, id) { await this.owns('service', userId, id); return this.prisma.service.delete({ where: { id } }); }
    async listProducts(userId) { const { merchantId } = await this.member(userId); return this.prisma.product.findMany({ where: { merchantId }, orderBy: { updatedAt: 'desc' } }); }
    async createProduct(userId, dto) { const { merchantId } = await this.member(userId); return this.prisma.product.create({ data: { merchantId, ...dto } }); }
    async updateProduct(userId, id, dto) { await this.owns('product', userId, id); return this.prisma.product.update({ where: { id }, data: dto }); }
    async deleteProduct(userId, id) { await this.owns('product', userId, id); return this.prisma.product.delete({ where: { id } }); }
    async listMedia(userId) { const { merchantId } = await this.member(userId); return this.prisma.mediaFile.findMany({ where: { merchantId }, orderBy: { sort: 'asc' } }); }
    async conversations(userId) { const { merchantId } = await this.member(userId); return this.prisma.conversation.findMany({ where: { merchantId }, include: { customer: { select: { id: true, nickname: true, avatarUrl: true } } }, orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }] }); }
    async addMedia(userId, dto) { const { merchantId } = await this.member(userId); return this.prisma.mediaFile.create({ data: { merchantId, ...dto } }); }
    async deleteMedia(userId, id) { const { merchantId } = await this.member(userId); const result = await this.prisma.mediaFile.deleteMany({ where: { id, merchantId } }); if (!result.count)
        throw new common_1.NotFoundException('メディアが見つかりません'); return { deleted: true }; }
    async member(userId) {
        const member = await this.prisma.merchantMember.findFirst({ where: { userId } });
        if (!member)
            throw new common_1.ForbiddenException('店舗へのアクセス権がありません');
        return member;
    }
    async owns(type, userId, id) {
        const { merchantId } = await this.member(userId);
        const count = type === 'service' ? await this.prisma.service.count({ where: { id, merchantId } }) : await this.prisma.product.count({ where: { id, merchantId } });
        if (!count)
            throw new common_1.NotFoundException('コンテンツが見つかりません');
    }
};
exports.MerchantService = MerchantService;
exports.MerchantService = MerchantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MerchantService);
//# sourceMappingURL=merchant.service.js.map