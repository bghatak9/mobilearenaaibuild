import { Body, Controller, Post } from '@nestjs/common';

import { ContactMessageDto } from './dto/contact-message.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() dto: ContactMessageDto) {
    return this.contactService.create(dto);
  }
}
