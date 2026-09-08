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
exports.MerchantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MerchantsService = class MerchantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(query) {
        const useDistance = query.lat !== undefined && query.lng !== undefined;
        const addressWhere = {
            ...(query.prefectureCode ? { prefectureCode: query.prefectureCode } : {}),
            ...(query.municipalityCode ? { municipalityCode: query.municipalityCode } : {}),
            ...(useDistance && query.radius ? this.distanceBounds(query.lat, query.lng, query.radius) : {}),
        };
        const where = {
            status: 'ACTIVE',
            ...(Object.keys(addressWhere).length ? { address: { is: addressWhere } } : {}),
            ...(query.categoryId ? { categories: { some: { categoryId: query.categoryId } } } : {}),
            ...(query.keyword ? { OR: [
                    { nameJa: { contains: query.keyword } },
                    { nameKana: { contains: query.keyword } },
                    { descriptionJa: { contains: query.keyword } },
                    { categories: { some: { category: { nameJa: { contains: query.keyword } } } } },
                    { services: { some: { status: 'PUBLISHED', OR: [{ nameJa: { contains: query.keyword } }, { nameKana: { contains: query.keyword } }] } } },
                    { products: { some: { status: 'PUBLISHED', nameJa: { contains: query.keyword } } } },
                ] } : {}),
            ...(query.openNow ? this.openNowWhere() : {}),
        };
        const orderBy = query.sort === 'rating' ? { rating: 'desc' }
            : query.sort === 'popular' ? { viewCount: 'desc' }
                : query.sort === 'newest' ? { createdAt: 'desc' }
                    : { favoriteCount: 'desc' };
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
        let items = raw.map((merchant) => {
            const address = merchant.address;
            return {
                ...merchant,
                ...(useDistance && address && address.latitude !== null && address.longitude !== null
                    ? { distance: this.distanceMeters(query.lat, query.lng, Number(address.latitude), Number(address.longitude)) }
                    : {}),
            };
        });
        if (query.radius && useDistance)
            items = items.filter((item) => typeof item.distance === 'number' && item.distance <= query.radius);
        if (query.sort === 'distance')
            items.sort((a, b) => (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE));
        const total = useDistance ? items.length : await this.prisma.merchant.count({ where });
        if (useDistance)
            items = items.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
        return { items, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
    }
    async getOne(idOrSlug) {
        const merchant = await this.prisma.merchant.findFirst({
            where: { status: 'ACTIVE', OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
            include: {
                address: true, businessHours: { orderBy: { dayOfWeek: 'asc' } }, specialHours: true,
                categories: { include: { category: true } }, services: { where: { status: 'PUBLISHED' }, orderBy: { sort: 'asc' } },
                products: { where: { status: 'PUBLISHED' } }, media: { orderBy: { sort: 'asc' } },
            },
        });
        if (!merchant)
            throw new common_1.NotFoundException('店舗が見つかりません');
        await this.prisma.merchant.update({ where: { id: merchant.id }, data: { viewCount: { increment: 1 } } });
        return merchant;
    }
    services(merchantId) { return this.prisma.service.findMany({ where: { merchantId, status: 'PUBLISHED' }, include: { category: true }, orderBy: { sort: 'asc' } }); }
    products(merchantId) { return this.prisma.product.findMany({ where: { merchantId, status: 'PUBLISHED' }, include: { category: true } }); }
    media(merchantId) { return this.prisma.mediaFile.findMany({ where: { merchantId }, orderBy: { sort: 'asc' } }); }
    hours(merchantId) { return this.prisma.merchantBusinessHour.findMany({ where: { merchantId }, orderBy: { dayOfWeek: 'asc' } }); }
    openNowWhere() {
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
    distanceBounds(latitude, longitude, radiusMeters) {
        const latitudeDelta = radiusMeters / 111_320;
        const cosine = Math.abs(Math.cos(latitude * Math.PI / 180));
        const longitudeDelta = cosine < 0.01 ? undefined : radiusMeters / (111_320 * cosine);
        return {
            latitude: { gte: latitude - latitudeDelta, lte: latitude + latitudeDelta },
            ...(longitudeDelta === undefined ? {} : { longitude: { gte: longitude - longitudeDelta, lte: longitude + longitudeDelta } }),
        };
    }
    distanceMeters(lat1, lng1, lat2, lng2) {
        const toRad = (degrees) => degrees * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return Math.round(6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
};
exports.MerchantsService = MerchantsService;
exports.MerchantsService = MerchantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MerchantsService);
//# sourceMappingURL=merchants.service.js.map