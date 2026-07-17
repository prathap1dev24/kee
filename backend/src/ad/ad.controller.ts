import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AdService } from './ad.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdController {
  constructor(private readonly adService: AdService) {}

  // ==========================================
  // SUPER ADMIN CRUD ENDPOINTS
  // ==========================================

  @Get('super/advertisements')
  @Roles(Role.SUPER_ADMIN)
  async superGetAds() {
    return this.adService.getAllAds();
  }

  @Post('super/advertisements')
  @Roles(Role.SUPER_ADMIN)
  async createAd(@Body() dto: CreateAdDto) {
    return this.adService.createAd(dto);
  }

  @Put('super/advertisements/:id')
  @Roles(Role.SUPER_ADMIN)
  async updateAd(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return this.adService.updateAd(id, dto);
  }

  @Delete('super/advertisements/:id')
  @Roles(Role.SUPER_ADMIN)
  async deleteAd(@Param('id') id: string) {
    return this.adService.deleteAd(id);
  }

  // ==========================================
  // SHOP ADMIN ENDPOINTS
  // ==========================================

  @Get('shop/advertisements')
  @Roles(Role.SHOP_ADMIN)
  async shopGetAds(@Request() req) {
    return this.adService.getTargetedAds(req.user.shopId);
  }
}
