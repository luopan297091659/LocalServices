import { IsEnum, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';
import { MessageType } from '@prisma/client';
export class CreateConversationDto { @IsString() merchantId!: string; @IsOptional() @IsString() @MaxLength(2000) message?: string; }
export class MessageDto {
  @IsEnum(MessageType) messageType: MessageType = MessageType.TEXT;
  @ValidateIf((value: MessageDto) => !value.mediaUrl) @IsString() @MaxLength(2000) content?: string;
  @ValidateIf((value: MessageDto) => !value.content) @IsUrl() mediaUrl?: string;
}
