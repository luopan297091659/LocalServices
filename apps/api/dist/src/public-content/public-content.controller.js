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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicContentController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/public.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicContentController = class PublicContentController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async service(id) {
        const service = await this.prisma.service.findFirst({ where: { id, status: 'PUBLISHED', merchant: { status: 'ACTIVE' } }, include: { merchant: { select: { id: true, nameJa: true, slug: true, logoUrl: true } }, category: true } });
        if (!service)
            throw new common_1.NotFoundException('サービスが見つかりません');
        await this.prisma.service.update({ where: { id }, data: { viewCount: { increment: 1 } } });
        return service;
    }
    async product(id) {
        const product = await this.prisma.product.findFirst({ where: { id, status: 'PUBLISHED', merchant: { status: 'ACTIVE' } }, include: { merchant: { select: { id: true, nameJa: true, slug: true, logoUrl: true } }, category: true } });
        if (!product)
            throw new common_1.NotFoundException('商品が見つかりません');
        await this.prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });
        return product;
    }
    prefectures() { return this.prisma.prefecture.findMany({ orderBy: { sort: 'asc' } }); }
    municipalities(prefectureCode) {
        return this.prisma.municipality.findMany({ where: prefectureCode ? { prefecture: { code: prefectureCode } } : {}, orderBy: { code: 'asc' } });
    }
    banners() {
        const now = new Date();
        return this.prisma.banner.findMany({ where: { enabled: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] }, orderBy: { sort: 'asc' } });
    }
};
exports.PublicContentController = PublicContentController;
__decorate([
    (0, common_1.Get)('services/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicContentController.prototype, "service", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicContentController.prototype, "product", null);
__decorate([
    (0, common_1.Get)('prefectures'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicContentController.prototype, "prefectures", null);
__decorate([
    (0, common_1.Get)('municipalities'),
    __param(0, (0, common_1.Query)('prefectureCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicContentController.prototype, "municipalities", null);
__decorate([
    (0, common_1.Get)('banners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicContentController.prototype, "banners", null);
exports.PublicContentController = PublicContentController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicContentController);
//# sourceMappingURL=public-content.controller.js.map