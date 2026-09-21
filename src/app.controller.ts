import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api/health')
  @Public()
  getHello(): { status: string; app: string } {
    return { status: 'ok', app: 'STIRE Platform API' };
  }
}
