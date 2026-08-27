import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { MerchantStatus, UserRole } from '@prisma/client';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthUser } from '../common/auth.types';
import { Roles } from '../common/roles.decorator';
import { AdminService } from './admin.service';
import { BannerDto, CategoryDto, MerchantStatusDto, RejectMerchantDto, UserStatusDto } from './dto/admin.dto';

@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}
  @Get('dashboard') dashboard() { return this.admin.dashboard(); }
  @Get('users') users() { return this.admin.users(); }
  @Patch('users/:id/status') userStatus(@Param('id') id: string, @Body() dto: UserStatusDto) { return this.admin.updateUser(id, dto.status); }
  @Get('merchants') merchants(@Query('status') status?: MerchantStatus) { return this.admin.merchants(status); }
  @Get('merchants/:id') merchant(@Param('id') id: string) { return this.admin.merchant(id); }
  @Post('merchants/:id/approve') approve(@CurrentUser() user: AuthUser, @Param('id') id: string, @Ip() ip: string) { return this.admin.approve(user.sub, id, ip); }
  @Post('merchants/:id/reject') reject(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: RejectMerchantDto, @Ip() ip: string) { return this.admin.reject(user.sub, id, dto, ip); }
  @Patch('merchants/:id/status') status(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: MerchantStatusDto, @Ip() ip: string) { return this.admin.status(user.sub, id, dto.status, ip); }
  @Get('categories') categories() { return this.admin.categories(); }
  @Post('categories') createCategory(@Body() dto: CategoryDto) { return this.admin.createCategory(dto); }
  @Put('categories/:id') updateCategory(@Param('id') id: string, @Body() dto: CategoryDto) { return this.admin.updateCategory(id, dto); }
  @Delete('categories/:id') deleteCategory(@Param('id') id: string) { return this.admin.deleteCategory(id); }
  @Get('banners') banners() { return this.admin.banners(); }
  @Get('services') services() { return this.admin.services(); }
  @Get('products') products() { return this.admin.products(); }
  @Get('media') media() { return this.admin.media(); }
  @Post('banners') createBanner(@Body() dto: BannerDto) { return this.admin.createBanner(dto); }
  @Put('banners/:id') updateBanner(@Param('id') id: string, @Body() dto: BannerDto) { return this.admin.updateBanner(id, dto); }
  @Delete('banners/:id') deleteBanner(@Param('id') id: string) { return this.admin.deleteBanner(id); }
}
