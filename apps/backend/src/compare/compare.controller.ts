import { Controller, Get, Param } from '@nestjs/common';

import { CompareService } from './compare.service';

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  // e.g. GET /compare/iphone-15-vs-galaxy-s24
  @Get(':slug')
  compare(@Param('slug') slug: string) {
    return this.compareService.compare(slug);
  }
}
