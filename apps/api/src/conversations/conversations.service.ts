import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageSenderType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/auth.types';
import type { CreateConversationDto, MessageDto } from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateConversationDto) {
    const merchant = await this.prisma.merchant.findFirst({ where: { id: dto.merchantId, status: 'ACTIVE' } });
    if (!merchant) throw new NotFoundException('店舗が見つかりません');
    const conversation = await this.prisma.conversation.upsert({
      where: { customerId_merchantId: { customerId: user.sub, merchantId: dto.merchantId } },
      create: { customerId: user.sub, merchantId: dto.merchantId }, update: { status: 'ACTIVE' },
    });
    if (dto.message) await this.send(user, conversation.id, { messageType: 'TEXT', content: dto.message });
    return this.get(user, conversation.id);
  }

  async list(user: AuthUser) {
    const merchantId = await this.merchantId(user);
    return this.prisma.conversation.findMany({
      where: merchantId ? { merchantId } : { customerId: user.sub },
      include: { customer: { select: { id: true, nickname: true, avatarUrl: true } }, merchant: { select: { id: true, nameJa: true, logoUrl: true } } },
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async get(user: AuthUser, id: string) {
    await this.assertAccess(user, id);
    return this.prisma.conversation.findUniqueOrThrow({ where: { id }, include: { customer: { select: { id: true, nickname: true, avatarUrl: true } }, merchant: { select: { id: true, nameJa: true, logoUrl: true } }, messages: { orderBy: { createdAt: 'asc' } } } });
  }

  async messages(user: AuthUser, id: string) { await this.assertAccess(user, id); return this.prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'asc' } }); }

  async send(user: AuthUser, id: string, dto: MessageDto) {
    const conversation = await this.assertAccess(user, id);
    const senderType = conversation.customerId === user.sub ? MessageSenderType.CUSTOMER : MessageSenderType.MERCHANT;
    const preview = dto.content ?? (dto.messageType === 'IMAGE' ? '画像' : dto.messageType === 'SERVICE' ? 'サービス' : '商品');
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({ data: { conversationId: id, senderId: user.sub, senderType, messageType: dto.messageType, content: dto.content, mediaUrl: dto.mediaUrl } });
      await tx.conversation.update({ where: { id }, data: { lastMessage: preview.slice(0, 200), lastMessageAt: new Date() } });
      if (senderType === MessageSenderType.CUSTOMER) await tx.merchant.update({ where: { id: conversation.merchantId }, data: { consultCount: { increment: 1 } } });
      return message;
    });
  }

  async read(user: AuthUser, id: string) {
    const conversation = await this.assertAccess(user, id);
    const ownType = conversation.customerId === user.sub ? MessageSenderType.CUSTOMER : MessageSenderType.MERCHANT;
    await this.prisma.message.updateMany({ where: { conversationId: id, senderType: { not: ownType }, isRead: false }, data: { isRead: true } });
    return { read: true };
  }

  private async assertAccess(user: AuthUser, id: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conversation) throw new NotFoundException('問い合わせが見つかりません');
    const merchantId = await this.merchantId(user);
    if (conversation.customerId !== user.sub && conversation.merchantId !== merchantId) throw new ForbiddenException('この問い合わせにアクセスできません');
    return conversation;
  }

  private async merchantId(user: AuthUser): Promise<string | undefined> {
    if (user.role !== UserRole.MERCHANT_ADMIN && user.role !== UserRole.MERCHANT_STAFF) return undefined;
    return (await this.prisma.merchantMember.findFirst({ where: { userId: user.sub }, select: { merchantId: true } }))?.merchantId;
  }
}
