import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/** «Reportar» un problema, algo confuso o una idea desde cualquier pantalla (docs/calidad/PRUEBA_DOS_SEMANAS.md). */
@ApiTags('Reportes')
@Controller('reportes')
@UseGuards(RolesGuard)
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Post()
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Reportar: { tipo: problema|confuso|idea, gravedad?: 1-3, texto, ruta, dispositivo }' })
  crear(@Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.reportes.crear(user, datos ?? {});
  }

  @Get('mios')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Mis reportes y en qué van' })
  mios(@GetUser() user: User) {
    return this.reportes.mios(user);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Bandeja de reportes (admin): ?estado=nuevo|visto|resuelto|descartado' })
  todos(@Query('estado') estado?: string) {
    return this.reportes.todos(estado);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Revisar un reporte: { estado, nota? }' })
  revisar(@Param('id', ParseIntPipe) id: number, @Body() datos: Record<string, unknown>) {
    return this.reportes.revisar(id, datos ?? {});
  }
}
