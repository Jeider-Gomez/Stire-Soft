import { Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MaintenanceService } from './maintenance.service';
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
    await this.maintenanceService.handleDeadlockCleanup();
    return { message: 'Limpieza de base de datos ejecutada exitosamente.' };
  }
}
