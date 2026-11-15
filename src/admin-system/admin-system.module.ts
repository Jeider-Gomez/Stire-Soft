import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminSystemController } from './admin-system.controller';
import { SystemStatusService } from './system-status.service';
import { RequestMetricsService } from './request-metrics.service';
import { RequestMetricsInterceptor } from './request-metrics.interceptor';
import { AccionAdmin } from './entities/accion-admin.entity';
import { AccionesAdminService } from './acciones-admin.service';

// Panel de administración del sistema (ADM-V01 y ADM-V03): estado real, métricas de peticiones
// y ventana de eventos recientes. La limpieza de mantenimiento vive en MaintenanceModule.
@Module({
  imports: [TypeOrmModule.forFeature([AccionAdmin])],
  controllers: [AdminSystemController],
  providers: [
    SystemStatusService,
    RequestMetricsService,
    AccionesAdminService,
    { provide: APP_INTERCEPTOR, useClass: RequestMetricsInterceptor },
  ],
  exports: [AccionesAdminService],
})
export class AdminSystemModule {}
