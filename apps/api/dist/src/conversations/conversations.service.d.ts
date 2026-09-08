import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/auth.types';
import type { CreateConversationDto, MessageDto } from './dto/conversation.dto';
export declare class ConversationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(user: AuthUser, dto: CreateConversationDto): Promise<{
        merchant: {
            id: string;
            nameJa: string;
            logoUrl: string | null;
        };
        messages: {
            id: string;
            createdAt: Date;
            messageType: import(".prisma/client").$Enums.MessageType;
            content: string | null;
            mediaUrl: string | null;
            senderType: import(".prisma/client").$Enums.MessageSenderType;
            isRead: boolean;
            conversationId: string;
            senderId: string;
        }[];
        customer: {
            nickname: string | null;
            avatarUrl: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ConversationStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        customerId: string;
        lastMessage: string | null;
        lastMessageAt: Date | null;
    }>;
    list(user: AuthUser): Promise<({
        merchant: {
            id: string;
            nameJa: string;
            logoUrl: string | null;
        };
        customer: {
            nickname: string | null;
            avatarUrl: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ConversationStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        customerId: string;
        lastMessage: string | null;
        lastMessageAt: Date | null;
    })[]>;
    get(user: AuthUser, id: string): Promise<{
        merchant: {
            id: string;
            nameJa: string;
            logoUrl: string | null;
        };
        messages: {
            id: string;
            createdAt: Date;
            messageType: import(".prisma/client").$Enums.MessageType;
            content: string | null;
            mediaUrl: string | null;
            senderType: import(".prisma/client").$Enums.MessageSenderType;
            isRead: boolean;
            conversationId: string;
            senderId: string;
        }[];
        customer: {
            nickname: string | null;
            avatarUrl: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ConversationStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        customerId: string;
        lastMessage: string | null;
        lastMessageAt: Date | null;
    }>;
    messages(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        messageType: import(".prisma/client").$Enums.MessageType;
        content: string | null;
        mediaUrl: string | null;
        senderType: import(".prisma/client").$Enums.MessageSenderType;
        isRead: boolean;
        conversationId: string;
        senderId: string;
    }[]>;
    send(user: AuthUser, id: string, dto: MessageDto): Promise<{
        id: string;
        createdAt: Date;
        messageType: import(".prisma/client").$Enums.MessageType;
        content: string | null;
        mediaUrl: string | null;
        senderType: import(".prisma/client").$Enums.MessageSenderType;
        isRead: boolean;
        conversationId: string;
        senderId: string;
    }>;
    read(user: AuthUser, id: string): Promise<{
        read: boolean;
    }>;
    private assertAccess;
    private merchantId;
}
