import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { PublicShopController } from './public-shop.controller';
import { AuthModule } from '../auth/auth.module';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [AuthModule, CustomerModule],
  controllers: [ShopController, PublicShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
