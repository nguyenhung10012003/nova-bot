import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  async ping() {
    return 'pong!';
  }

  @Get('upsert')
  async upsertChatflow() {
    // return this.appService.upsertChatflow();
  }
}
