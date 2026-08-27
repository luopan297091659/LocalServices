import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FavoriteType } from '@prisma/client';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthUser } from '../common/auth.types';
import { FavoriteDto } from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}
  @Get() list(@CurrentUser() user: AuthUser) { return this.favorites.list(user.sub); }
  @Post() add(@CurrentUser() user: AuthUser, @Body() dto: FavoriteDto) { return this.favorites.add(user.sub, dto); }
  @Delete(':type/:targetId') remove(@CurrentUser() user: AuthUser, @Param('type') type: FavoriteType, @Param('targetId') targetId: string) { return this.favorites.remove(user.sub, type, targetId); }
}
