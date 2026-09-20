import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminSystemController } from './admin-system.controller';
import { SystemStatusService } from './system-status.service';
import { RequestMetricsService } from './request-metrics.service';
import { RequestMetricsInterceptor } from './request-metrics.interceptor';

// Panel de administración del sistema (ADM-V01 y ADM-V03): estado real, métricas de peticiones
// y ventana de eventos recientes. La limpieza de mantenimiento vive en MaintenanceModule.
@Module({
  controllers: [AdminSystemController],
  providers: [
    SystemStatusService,
    RequestMetricsService,
    { provide: APP_INTERCEPTOR, useClass: RequestMetricsInterceptor },
  ],
})
export class AdminSystemModule {}
