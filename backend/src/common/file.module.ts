import { Module } from '@nestjs/common';
import { FileService } from '../customer/file.service';

// Standalone module for the local-disk FileService so it can be imported by
// AuthModule without creating a circular dependency (CustomerModule already
// imports AuthModule to reuse its guards/JwtModule, so AuthModule cannot
// import CustomerModule back). ShopModule and CustomerModule may keep
// obtaining FileService the way they already do; AuthModule uses this module.
@Module({
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
