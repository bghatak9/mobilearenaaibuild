import {
  Controller,
  Get,
  Module,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentEntityType, UserRole } from '@prisma/client';

import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ContentTranslationModule } from '../content-translation/content-translation.module';
import { ContentTranslationService } from '../content-translation/content-translation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchIndexService } from './search-index.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly index: SearchIndexService,
    private readonly translations: ContentTranslationService,
  ) {}

  /**
   * Multilingual catalog search.
   * Prefer Meilisearch when configured; fall back to ContentTranslation ids.
   */
  @Get()
  async search(
    @Query('q') q?: string,
    @Query('locale') locale?: string,
    @Query('lang') lang?: string,
  ) {
    const query = (q ?? '').trim();
    const loc = locale || lang || 'en';
    if (!query) return { source: 'none', devices: [], brands: [] };

    if (this.index.isEnabled()) {
      const devices = (await this.index.searchDevices(query, loc)) ?? [];
      return { source: 'meilisearch', devices, brands: [] };
    }

    const [deviceIds, brandIds] = await Promise.all([
      this.translations.searchEntityIds(ContentEntityType.DEVICE, query, loc),
      this.translations.searchEntityIds(ContentEntityType.BRAND, query, loc),
    ]);

    return {
      source: 'prisma',
      deviceIds,
      brandIds,
    };
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  reindex() {
    return this.index.reindexCatalog();
  }
}

@Module({
  imports: [PrismaModule, ContentTranslationModule, AuthModule],
  controllers: [SearchController],
  providers: [SearchIndexService],
  exports: [SearchIndexService],
})
export class SearchModule {}
