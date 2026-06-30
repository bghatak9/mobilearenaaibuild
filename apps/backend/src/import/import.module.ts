import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportHistoryController } from './import-history.controller';
import { ImportExecutor } from './import.executor';
import { ImportJobService } from './import-job.service';
import { ImportLifecycleService } from './import-lifecycle.service';
import { ImportService } from './import.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [AuthModule, AuditModule, CacheModule],
  controllers: [ImportHistoryController, ImportController],
  providers: [
    ImportService,
    ImportExecutor,
    ImportJobService,
    ImportLifecycleService,
    PrismaService,
  ],
  exports: [ImportLifecycleService, ImportService],
})
export class ImportModule {}
