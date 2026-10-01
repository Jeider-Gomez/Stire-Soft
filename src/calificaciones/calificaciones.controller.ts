import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalificacionesService } from './calificaciones.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/** Formas de calificar (docs/DISENO_INTERVENCION_DOCENTE.md §6). */
@ApiTags('Calificaciones')
@Controller('calificaciones')
@UseGuards(RolesGuard)
export class CalificacionesController {
  constructor(private readonly calificaciones: CalificacionesService) {}

  @Get('clase/:classId')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Libro de la clase: esquema (null si la clase no usa notas), módulos y entregas para armarlo, nota propuesta por estudiante con desglose y resumen' })
  libro(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.calificaciones.libro(user, classId);
  }

  @Put('clase/:classId/esquema')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Guardar el esquema: { componentes: [{ clave?, nombre, tipo, peso?, lecciones?, entregas? }], usarPesos, notaAprobatoria, visibleParaEstudiantes }' })
  guardarEsquema(@Param('classId', ParseIntPipe) classId: number, @Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.calificaciones.guardarEsquema(user, classId, datos ?? {});
  }

  @Delete('clase/:classId/esquema')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Dejar de usar notas en la clase (se conservan las notas puestas y su historial)' })
  quitarEsquema(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.calificaciones.quitarEsquema(user, classId);
  }

  @Put('clase/:classId/estudiante/:studentId/nota')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Poner, cambiar o quitar una nota manual o el ajuste de la final: { clave, nota (null = quitar), motivo }' })
  registrarNota(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() datos: Record<string, unknown>,
    @GetUser() user: User,
  ) {
    return this.calificaciones.registrarNota(user, classId, studentId, datos ?? {});
  }

  @Get('clase/:classId/estudiante/:studentId/historial')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Historial de las notas que el docente puso o ajustó a un estudiante' })
  historial(@Param('classId', ParseIntPipe) classId: number, @Param('studentId', ParseIntPipe) studentId: number, @GetUser() user: User) {
    return this.calificaciones.historial(user, classId, studentId);
  }

  @Get('mia/:classId')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Mi nota y su desglose, si el docente decidió mostrarla' })
  mia(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.calificaciones.mia(user, classId);
  }
}
