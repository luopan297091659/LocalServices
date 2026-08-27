import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthUser } from '../common/auth.types';
import { CreateConversationDto, MessageDto } from './dto/conversation.dto';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}
  @Post() create(@CurrentUser() user: AuthUser, @Body() dto: CreateConversationDto) { return this.conversations.create(user, dto); }
  @Get() list(@CurrentUser() user: AuthUser) { return this.conversations.list(user); }
  @Get(':id') get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.conversations.get(user, id); }
  @Get(':id/messages') messages(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.conversations.messages(user, id); }
  @Post(':id/messages') send(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: MessageDto) { return this.conversations.send(user, id, dto); }
  @Patch(':id/read') read(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.conversations.read(user, id); }
}
