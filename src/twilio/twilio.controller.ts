import { Controller, Post } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  async sendMessage() {
    return await this.twilioService.sendMessage();
  }
}
