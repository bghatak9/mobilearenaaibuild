import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { canImport, type ImportKind } from '../auth/content-permissions';
import { canImportKind } from './import-file-policy';
import type { BulkImportKind, EvUploadSubkind } from './import.types';
import { ImportService } from './import.service';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: UserRole };
}

@Controller('import')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  /** Paid ads — explicit routes (avoid :kind param + assertKindAccess issues). */
  @Post('advertisements/validate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  validateAdvertisements(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    return this.importService.validate('advertisements', file, req.user.role);
  }

  @Post('advertisements/run')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  runAdvertisements(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
    @Query('atomic') atomic?: string,
    @Query('background') background?: string,
  ) {
    return this.importService.run('advertisements', file, req.user, {
      atomic: atomic !== 'false',
      background: background !== 'false',
    });
  }

  @Post('advertisements/bulk-delete')
  @Roles(UserRole.SUPER_ADMIN)
  bulkDeleteAdvertisements(
    @Body() body: { ids: number[] },
    @Req() req: AuthRequest,
  ) {
    return this.importService.softDeleteAdvertisements(body.ids ?? [], req.user);
  }

  @Post('advertisements/bulk-restore')
  @Roles(UserRole.SUPER_ADMIN)
  bulkRestoreAdvertisements(
    @Body() body: { ids: number[] },
    @Req() req: AuthRequest,
  ) {
    return this.importService.restoreAdvertisements(body.ids ?? [], req.user);
  }

  @Post(':kind/validate')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.AUTHOR,
    UserRole.MODERATOR,
  )
  @UseInterceptors(FileInterceptor('file'))
  validate(
    @Param('kind') kind: BulkImportKind,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
    @Query('slug') slug?: string,
    @Query('subkind') subkind?: string,
  ) {
    this.assertKindAccess(kind, req.user.role);
    return this.importService.validate(kind, file, req.user.role, {
      slug,
      subkind: this.parseEvSubkind(subkind),
    });
  }

  @Post(':kind/run')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.AUTHOR,
    UserRole.MODERATOR,
  )
  @UseInterceptors(FileInterceptor('file'))
  run(
    @Param('kind') kind: BulkImportKind,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
    @Query('atomic') atomic?: string,
    @Query('background') background?: string,
    @Query('slug') slug?: string,
    @Query('subkind') subkind?: string,
  ) {
    this.assertKindAccess(kind, req.user.role);
    return this.importService.run(kind, file, req.user, {
      atomic: atomic !== 'false',
      background: background !== 'false',
      slug,
      subkind: this.parseEvSubkind(subkind),
    });
  }

  @Get('jobs/:jobId')
  getJob(@Param('jobId') jobId: string) {
    return this.importService.getJob(jobId);
  }

  @Get('jobs/:jobId/error-report')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="upload-errors.csv"')
  errorReport(@Param('jobId') jobId: string, @Res() res: Response) {
    const csv = this.importService.getErrorReportCsv(jobId);
    res.send(csv);
  }

  @Post('phones/bulk-delete')
  @Roles(UserRole.SUPER_ADMIN)
  bulkDeletePhones(
    @Body() body: { ids: number[] },
    @Req() req: AuthRequest,
  ) {
    return this.importService.softDeletePhones(body.ids ?? [], req.user);
  }

  @Post('brands/bulk-delete')
  @Roles(UserRole.SUPER_ADMIN)
  bulkDeleteBrands(
    @Body() body: { ids: number[] },
    @Req() req: AuthRequest,
  ) {
    return this.importService.softDeleteBrands(body.ids ?? [], req.user);
  }

  /* Legacy routes */
  @Post('phones')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  importPhones(@UploadedFile() file: Express.Multer.File, @Req() req: AuthRequest) {
    return this.importService.run('phones', file, req.user, { background: false });
  }

  @Post('devices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  importDevices(@UploadedFile() file: Express.Multer.File, @Req() req: AuthRequest) {
    return this.importService.run('phones', file, req.user, { background: false });
  }

  @Post('brands')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  importBrands(@UploadedFile() file: Express.Multer.File, @Req() req: AuthRequest) {
    return this.importService.run('brands', file, req.user, { background: false });
  }

  @Post('prices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  importPrices(@UploadedFile() file: Express.Multer.File, @Req() req: AuthRequest) {
    return this.importService.run('prices', file, req.user, { background: false });
  }

  @Post('news')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  importNews(@UploadedFile() file: Express.Multer.File, @Req() req: AuthRequest) {
    return this.importService.run('news', file, req.user, { background: false });
  }

  @Post('users')
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  importUsers(@UploadedFile() file: Express.Multer.File, @Req() req: AuthRequest) {
    return this.importService.run('users', file, req.user, { background: false });
  }

  @Post('images')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  importImages(@UploadedFile() file: Express.Multer.File, @Req() req: AuthRequest) {
    return this.importService.run('images', file, req.user, { background: false });
  }

  @Post('reviews')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  importReviews(@UploadedFile() file: Express.Multer.File, @Req() req: AuthRequest) {
    return this.importService.run('reviews', file, req.user, { background: false });
  }

  @Post('documentation')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  importDocumentation(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    return this.importService.run('documentation', file, req.user, {
      background: false,
    });
  }

  @Post('advertisements')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  importAdvertisements(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    return this.importService.run('advertisements', file, req.user, {
      background: false,
    });
  }

  private parseEvSubkind(raw?: string): EvUploadSubkind | undefined {
    const value = raw?.trim().toLowerCase();
    if (
      value === 'vehicles' ||
      value === 'upcoming' ||
      value === 'news' ||
      value === 'reviews'
    ) {
      return value;
    }
    return undefined;
  }

  private assertKindAccess(kind: BulkImportKind, role: UserRole | undefined) {
    if (!role) {
      throw new ForbiddenException('Authentication required');
    }
    const normalizedKind = String(kind).trim().toLowerCase() as BulkImportKind;
    const normalizedRole = String(role).trim() as UserRole;

    if (
      normalizedKind === 'advertisements' &&
      (normalizedRole === UserRole.SUPER_ADMIN ||
        normalizedRole === UserRole.ADMIN)
    ) {
      return;
    }
    if (normalizedRole === UserRole.SUPER_ADMIN) {
      return;
    }

    const allowed =
      canImportKind(normalizedRole, normalizedKind) ||
      canImport(normalizedRole, normalizedKind as ImportKind);
    if (!allowed) {
      throw new ForbiddenException(`Your role cannot upload ${kind}`);
    }
  }
}
