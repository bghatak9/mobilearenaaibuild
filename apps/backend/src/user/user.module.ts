import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { AdminConfigController } from '../admin/admin-config.controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [UserController, AdminConfigController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
