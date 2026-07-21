import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { KeyService } from './key.service';
import { CreateKeyDto, UpdateKeyDto } from './dto/key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  // ==========================================
  // SUPER ADMIN CRUD ENDPOINTS
  // ==========================================

  @Get('super/keys')
  @Roles(Role.SUPER_ADMIN)
  async superGetKeys(@Query('search') search?: string) {
    return this.keyService.getKeys(search);
  }

  @Post('super/keys')
  @Roles(Role.SUPER_ADMIN)
  async createKey(@Body() dto: CreateKeyDto) {
    return this.keyService.createKey(dto);
  }

  @Put('super/keys/:id')
  @Roles(Role.SUPER_ADMIN)
  async updateKey(@Param('id') id: string, @Body() dto: UpdateKeyDto) {
    return this.keyService.updateKey(id, dto);
  }

  @Delete('super/keys/:id')
  @Roles(Role.SUPER_ADMIN)
  async deleteKey(@Param('id') id: string) {
    return this.keyService.deleteKey(id);
  }

  // ==========================================
  // SHOP ADMIN ENDPOINTS (own shop's keys only)
  // ==========================================

  @Get('shop/keys/search')
  @Roles(Role.SHOP_ADMIN)
  async shopSearchKeys(@Request() req, @Query('query') query?: string) {
    return this.keyService.getShopKeys(req.user.shopId, query);
  }
}
