import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

// Comprobación de vida para el proxy, Docker y monitores externos (p. ej. UptimeRobot,
// que además evita que un host gratuito se duerma). No expone datos: solo ok / no ok.
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @SkipThrottle()
  @Get()
  async check() {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException({ status: 'error' });
    }
    return { status: 'ok' };
  }
}
