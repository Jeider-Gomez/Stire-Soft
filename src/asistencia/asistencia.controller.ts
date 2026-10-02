import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AsistenciaService } from './asistencia.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/** Asistencia con QR rotativo o a mano (docs/calidad/PRUEBA_DOS_SEMANAS.md). */
@ApiTags('Asistencia')
@Controller('asistencia')
@UseGuards(RolesGuard)
export class AsistenciaController {
  constructor(private readonly asistencia: AsistenciaService) {}

  // El QR cambia cada 20 s: unas 3 peticiones por minuto con la pantalla abierta.
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('mi-codigo')
  @Roles('estudiante')
  @ApiOperation({ summary: 'El QR de asistencia del estudiante en este momento: ?dispositivo=<id del navegador>' })
  miCodigo(@Query('dispositivo') dispositivo: string, @GetUser() user: User) {
    return this.asistencia.miCodigo(user, dispositivo);
  }

  @Get('mia')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Mi asistencia en cada una de mis clases' })
  mia(@GetUser() user: User) {
    return this.asistencia.mia(user);
  }

  @Get('clase/:classId/sesiones')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Sesiones de asistencia de la clase con sus conteos' })
  sesiones(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.asistencia.sesionesDeClase(user, classId);
  }

  @Post('clase/:classId/sesiones')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Empezar a tomar asistencia: { fecha?: AAAA-MM-DD (hoy), tema?, nueva?: true para otra sesión el mismo día }' })
  crearSesion(@Param('classId', ParseIntPipe) classId: number, @Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.asistencia.crearSesion(user, classId, datos ?? {});
  }

  @Get('clase/:classId/resumen')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Planilla de la clase: una fila por estudiante, una columna por sesión, y su porcentaje' })
  resumen(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.asistencia.resumen(user, classId);
  }

  @Get('sesiones/:id')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'La lista de una sesión: estado de cada estudiante y alertas de «mismo celular»' })
  detalle(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.asistencia.detalle(user, id);
  }

  @Patch('sesiones/:id')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Cerrar o reabrir la sesión, o cambiar su tema: { abierta?, tema? }' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.asistencia.actualizarSesion(user, id, datos ?? {});
  }

  @Delete('sesiones/:id')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Borrar una sesión creada por error (y sus marcas)' })
  eliminar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.asistencia.eliminarSesion(user, id);
  }

  @Post('sesiones/:id/escanear')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Marcar presente con el QR del celular del estudiante: { codigo }' })
  escanear(@Param('id', ParseIntPipe) id: number, @Body('codigo') codigo: unknown, @GetUser() user: User) {
    return this.asistencia.marcarConQr(user, id, codigo);
  }

  @Put('sesiones/:id/estudiantes/:userId')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Marcar o corregir a mano: { estado: presente|tarde|excusa|ausente|null }' })
  marcar(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body('estado') estado: unknown,
    @GetUser() user: User,
  ) {
    return this.asistencia.marcarManual(user, id, userId, estado);
  }
}
