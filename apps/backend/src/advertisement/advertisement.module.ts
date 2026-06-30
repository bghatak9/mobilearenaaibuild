import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AdvertisementAdminController } from './advertisement-admin.controller';
import { AdvertisementController } from './advertisement.controller';
import { AdvertisementService } from './advertisement.service';

@Module({
  imports: [AuthModule],
  controllers: [AdvertisementAdminController, AdvertisementController],
  providers: [AdvertisementService],
})
export class AdvertisementModule {}
