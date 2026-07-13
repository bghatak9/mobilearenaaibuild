import { Controller, Get, Param, Query } from '@nestjs/common';

import { CompareService } from './compare.service';

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  // e.g. GET /compare/iphone-15-vs-galaxy-s24?locale=hi
  @Get(':slug')
  compare(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.compareService.compare(slug, locale);
  }
}
