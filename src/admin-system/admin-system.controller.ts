import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SystemStatusService } from './system-status.service';
import { LogEntry, LogLevel, logBuffer } from './log-buffer';
import { LogsQueryDto, LogLevelFilter } from './dto/logs-query.dto';

const LEVELS_BY_FILTER: Record<LogLevelFilter, LogLevel[] | undefined> = {
  todos: undefined,
  error: ['error', 'fatal'],
  warn: ['warn'],
  info: ['log'],
};

@Controller('admin/system')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminSystemController {
  constructor(private readonly statusService: SystemStatusService) {}

  // Consulta varias tablas y hace un ping a la base; el rol admin no evita que un panel abierto
  // en varias pestañas con actualización automática la sature.
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('status')
  async status() {
    return this.statusService.getStatus();
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('logs')
  logs(@Query() query: LogsQueryDto): { entries: LogEntry[]; capacity: number; note: string } {
    const entries = logBuffer.recent(query.limit ?? 100, LEVELS_BY_FILTER[query.level ?? 'todos']);
    return {
      entries,
      capacity: 500,
      note: 'Ventana de los últimos eventos de este proceso; se vacía al reiniciar el servidor.',
    };
  }
}
