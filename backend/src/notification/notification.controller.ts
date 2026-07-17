import { Controller, Get, Put, Param, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('shop/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SHOP_ADMIN)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Request() req) {
    return this.notificationService.getNotifications(req.user.shopId);
  }

  @Put(':id')
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationService.markAsRead(req.user.shopId, id);
  }
}
