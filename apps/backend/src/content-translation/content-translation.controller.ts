import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentEntityType, UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ContentTranslationService } from './content-translation.service';
import { UpsertContentTranslationDto } from './dto/upsert-content-translation.dto';

@Controller('content-translations')
export class ContentTranslationController {
  constructor(private readonly translations: ContentTranslationService) {}

  @Get('workspace/coverage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  coverage(@Query('locales') locales?: string) {
    const list = (locales ?? 'en,hi,bn,es,fr,de,ja,zh-CN,zh-TW,ar,fa,he,pt-BR,pt-PT,ru,ko,it')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return this.translations.coverageReport(list);
  }

  @Get(':entityType/:entityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  list(
    @Param('entityType') entityType: ContentEntityType,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    return this.translations.listForEntity(entityType, entityId);
  }

  @Put(':entityType/:entityId/:locale')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  upsert(
    @Param('entityType') entityType: ContentEntityType,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('locale') locale: string,
    @Body() dto: UpsertContentTranslationDto,
  ) {
    return this.translations.upsert(entityType, entityId, locale, dto);
  }

  @Delete(':entityType/:entityId/:locale')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  remove(
    @Param('entityType') entityType: ContentEntityType,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('locale') locale: string,
  ) {
    return this.translations.remove(entityType, entityId, locale);
  }
}
