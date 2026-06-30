import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ImportService } from './import.service';

interface AuthRequest {
  user: { userId: number; email: string; role: UserRole };
}

/** Batch history routes — separate controller avoids :kind route conflicts. */
@Controller('import/batches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class ImportHistoryController {
  constructor(private readonly importService: ImportService) {}

  @Post('clear-deleted')
  clearDeleted(@Req() req: AuthRequest) {
    return this.importService.clearDeletedImportHistory(req.user);
  }

  @Get()
  list(
    @Query('kind') kind?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.importService.listBatches({
      kind,
      includeDeleted: includeDeleted === 'true',
    });
  }

  @Post('advertisements/restore')
  restoreAdvertisements(
    @Body() body: { ids: number[] },
    @Req() req: AuthRequest,
  ) {
    return this.importService.restoreAdvertisements(body.ids ?? [], req.user);
  }

  @Post('brands/restore')
  restoreBrands(@Body() body: { ids: number[] }, @Req() req: AuthRequest) {
    return this.importService.restoreBrands(body.ids ?? [], req.user);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.importService.getBatch(+id);
  }

  @Post(':id/delete')
  deleteBatch(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.importService.softDeleteBatch(+id, req.user);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.importService.restoreBatch(+id, req.user);
  }

  @Post(':id/purge')
  purge(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.importService.purgeBatch(+id, req.user);
  }
}
