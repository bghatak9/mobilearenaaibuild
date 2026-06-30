import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ImportModule } from '../import/import.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, ImportModule, AuthModule],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
