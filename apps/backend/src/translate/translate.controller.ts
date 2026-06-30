import { Body, Controller, Get, Post } from '@nestjs/common';

import { TranslateVoiceDto } from './dto/translate-voice.dto';
import { TranslateService } from './translate.service';

@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Get('status')
  status() {
    return { configured: this.translateService.isConfigured() };
  }

  @Post('voice')
  translateVoice(@Body() dto: TranslateVoiceDto) {
    return this.translateService.translateVoice({
      text: dto.text,
      source: dto.source,
      target: dto.target,
    });
  }
}
