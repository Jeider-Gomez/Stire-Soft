import { Controller, InternalServerErrorException, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CleanupSummary, MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  // Operación administrativa con escrituras masivas; el rol admin no elimina
  // la necesidad de evitar invocaciones repetidas accidentales o abusivas.
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('cleanup')
  async triggerCleanup() {
    let summary: CleanupSummary;
    try {
      summary = await this.maintenanceService.runCleanup();
    } catch {
      // El detalle ya quedó en el registro del servidor; al cliente no se le filtran mensajes internos.
      throw new InternalServerErrorException(
        'La limpieza no se completó por un error interno. Revisa el registro de eventos del servidor.',
      );
    }
    return {
      message:
        `Limpieza ejecutada: ${summary.orphanedAnswersFixed} respuestas en limbo corregidas ` +
        `y ${summary.staleSubmissionsClosed} entregas atascadas cerradas con nota 0.`,
      ...summary,
    };
  }
}
