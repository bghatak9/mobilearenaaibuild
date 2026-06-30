import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';

interface AuthRequest {
  user: { userId: number; role: UserRole };
}

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Post('clear-import')
  clearImportHistory(@Req() req: AuthRequest) {
    return this.audit.clearImportHistory(req.user.userId);
  }

  @Get()
  findRecent(@Query('limit') limit?: string, @Query('scope') scope?: string) {
    if (scope === 'import') {
      return this.audit.findImportRelated(limit ? +limit : 100);
    }
    return this.audit.findRecent(limit ? +limit : 50);
  }
}
