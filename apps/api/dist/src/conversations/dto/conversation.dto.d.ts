import { MessageType } from '@prisma/client';
export declare class CreateConversationDto {
    merchantId: string;
    message?: string;
}
export declare class MessageDto {
    messageType: MessageType;
    content?: string;
    mediaUrl?: string;
}
