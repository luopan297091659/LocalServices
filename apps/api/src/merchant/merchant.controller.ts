import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthUser } from '../common/auth.types';
import { Roles } from '../common/roles.decorator';
import { MediaDto, ProductDto, ServiceDto, SetBusinessHoursDto, UpdateMerchantDto, VerificationDto } from './dto/merchant.dto';
import { MerchantService } from './merchant.service';

@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchant: MerchantService) {}
  @Post('register') create(@CurrentUser() user: AuthUser, @Body() dto: UpdateMerchantDto) { return this.merchant.create(user.sub, dto); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF)
  @Get('profile') profile(@CurrentUser() user: AuthUser) { return this.merchant.profile(user.sub); }
  @Roles(UserRole.MERCHANT_ADMIN) @Put('profile') update(@CurrentUser() user: AuthUser, @Body() dto: UpdateMerchantDto) { return this.merchant.update(user.sub, dto); }
  @Roles(UserRole.MERCHANT_ADMIN) @Post('submit') submit(@CurrentUser() user: AuthUser, @Body() dto: VerificationDto) { return this.merchant.submit(user.sub, dto); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Get('dashboard') dashboard(@CurrentUser() user: AuthUser) { return this.merchant.dashboard(user.sub); }
  @Roles(UserRole.MERCHANT_ADMIN) @Put('business-hours') hours(@CurrentUser() user: AuthUser, @Body() dto: SetBusinessHoursDto) { return this.merchant.setHours(user.sub, dto); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Get('services') services(@CurrentUser() user: AuthUser) { return this.merchant.listServices(user.sub); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Post('services') createService(@CurrentUser() user: AuthUser, @Body() dto: ServiceDto) { return this.merchant.createService(user.sub, dto); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Put('services/:id') updateService(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ServiceDto) { return this.merchant.updateService(user.sub, id, dto); }
  @Roles(UserRole.MERCHANT_ADMIN) @Delete('services/:id') deleteService(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.merchant.deleteService(user.sub, id); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Get('products') products(@CurrentUser() user: AuthUser) { return this.merchant.listProducts(user.sub); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Post('products') createProduct(@CurrentUser() user: AuthUser, @Body() dto: ProductDto) { return this.merchant.createProduct(user.sub, dto); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Put('products/:id') updateProduct(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ProductDto) { return this.merchant.updateProduct(user.sub, id, dto); }
  @Roles(UserRole.MERCHANT_ADMIN) @Delete('products/:id') deleteProduct(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.merchant.deleteProduct(user.sub, id); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Get('media') media(@CurrentUser() user: AuthUser) { return this.merchant.listMedia(user.sub); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Get('conversations') conversations(@CurrentUser() user: AuthUser) { return this.merchant.conversations(user.sub); }
  @Roles(UserRole.MERCHANT_ADMIN, UserRole.MERCHANT_STAFF) @Post('media') addMedia(@CurrentUser() user: AuthUser, @Body() dto: MediaDto) { return this.merchant.addMedia(user.sub, dto); }
  @Roles(UserRole.MERCHANT_ADMIN) @Delete('media/:id') deleteMedia(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.merchant.deleteMedia(user.sub, id); }
}
