import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SuperNotificationController } from './super-notification.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationController, SuperNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
