import { Controller, Get, Put, Param, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('super/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class SuperNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications() {
    return this.notificationService.getSuperNotifications();
  }

  @Put(':id')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markSuperAsRead(id);
  }
}
