import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';

@Module({
  imports: [PrismaModule],
  controllers: [ManufacturerController],
  providers: [ManufacturerService],
})
export class ManufacturerModule {}
