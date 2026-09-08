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
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ConversationsService = class ConversationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(user, dto) {
        const merchant = await this.prisma.merchant.findFirst({ where: { id: dto.merchantId, status: 'ACTIVE' } });
        if (!merchant)
            throw new common_1.NotFoundException('店舗が見つかりません');
        const conversation = await this.prisma.conversation.upsert({
            where: { customerId_merchantId: { customerId: user.sub, merchantId: dto.merchantId } },
            create: { customerId: user.sub, merchantId: dto.merchantId }, update: { status: 'ACTIVE' },
        });
        if (dto.message)
            await this.send(user, conversation.id, { messageType: 'TEXT', content: dto.message });
        return this.get(user, conversation.id);
    }
    async list(user) {
        const merchantId = await this.merchantId(user);
        return this.prisma.conversation.findMany({
            where: merchantId ? { merchantId } : { customerId: user.sub },
            include: { customer: { select: { id: true, nickname: true, avatarUrl: true } }, merchant: { select: { id: true, nameJa: true, logoUrl: true } } },
            orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async get(user, id) {
        await this.assertAccess(user, id);
        return this.prisma.conversation.findUniqueOrThrow({ where: { id }, include: { customer: { select: { id: true, nickname: true, avatarUrl: true } }, merchant: { select: { id: true, nameJa: true, logoUrl: true } }, messages: { orderBy: { createdAt: 'asc' } } } });
    }
    async messages(user, id) { await this.assertAccess(user, id); return this.prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'asc' } }); }
    async send(user, id, dto) {
        const conversation = await this.assertAccess(user, id);
        const senderType = conversation.customerId === user.sub ? client_1.MessageSenderType.CUSTOMER : client_1.MessageSenderType.MERCHANT;
        const preview = dto.content ?? (dto.messageType === 'IMAGE' ? '画像' : dto.messageType === 'SERVICE' ? 'サービス' : '商品');
        return this.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({ data: { conversationId: id, senderId: user.sub, senderType, messageType: dto.messageType, content: dto.content, mediaUrl: dto.mediaUrl } });
            await tx.conversation.update({ where: { id }, data: { lastMessage: preview.slice(0, 200), lastMessageAt: new Date() } });
            if (senderType === client_1.MessageSenderType.CUSTOMER)
                await tx.merchant.update({ where: { id: conversation.merchantId }, data: { consultCount: { increment: 1 } } });
            return message;
        });
    }
    async read(user, id) {
        const conversation = await this.assertAccess(user, id);
        const ownType = conversation.customerId === user.sub ? client_1.MessageSenderType.CUSTOMER : client_1.MessageSenderType.MERCHANT;
        await this.prisma.message.updateMany({ where: { conversationId: id, senderType: { not: ownType }, isRead: false }, data: { isRead: true } });
        return { read: true };
    }
    async assertAccess(user, id) {
        const conversation = await this.prisma.conversation.findUnique({ where: { id } });
        if (!conversation)
            throw new common_1.NotFoundException('問い合わせが見つかりません');
        const merchantId = await this.merchantId(user);
        if (conversation.customerId !== user.sub && conversation.merchantId !== merchantId)
            throw new common_1.ForbiddenException('この問い合わせにアクセスできません');
        return conversation;
    }
    async merchantId(user) {
        if (user.role !== client_1.UserRole.MERCHANT_ADMIN && user.role !== client_1.UserRole.MERCHANT_STAFF)
            return undefined;
        return (await this.prisma.merchantMember.findFirst({ where: { userId: user.sub }, select: { merchantId: true } }))?.merchantId;
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map