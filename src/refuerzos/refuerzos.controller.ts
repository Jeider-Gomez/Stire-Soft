import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefuerzosService } from './refuerzos.service';
import { TIPOS_REFUERZO, type TipoRefuerzo } from './refuerzo-reglas';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

const ids = (v?: string): number[] => (v ? v.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0) : []);

/** Refuerzos y retos (docs/DISENO_INTERVENCION_DOCENTE.md §4 y §10.4). */
@ApiTags('Refuerzos')
@Controller('refuerzos')
@UseGuards(RolesGuard)
export class RefuerzosController {
  constructor(private readonly refuerzos: RefuerzosService) {}

  @Get('mios')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Mis refuerzos y retos, con cuántos pasos llevo' })
  mios(@GetUser() user: User) {
    return this.refuerzos.mios(user);
  }

  @Get('clase/:classId')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Refuerzos de la clase con «¿funcionó?»: pasos hechos y dominio antes → ahora' })
  deLaClase(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.refuerzos.deLaClase(user, classId);
  }

  @Get('clase/:classId/sugerencias')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Ejercicios sugeridos: ?lecciones=1,2&estudiantes=5,6&tipo=refuerzo|reto' })
  sugerencias(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('lecciones') lecciones: string | undefined,
    @Query('estudiantes') estudiantes: string | undefined,
    @Query('tipo') tipo: string | undefined,
    @GetUser() user: User,
  ) {
    const t = (tipo ?? 'refuerzo') as TipoRefuerzo;
    if (!(TIPOS_REFUERZO as readonly string[]).includes(t)) throw new BadRequestException('El tipo es refuerzo o reto.');
    return this.refuerzos.sugerencias(user, classId, ids(lecciones), ids(estudiantes), t);
  }

  @Post()
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Asignar un refuerzo o un reto: { classId, tipo, titulo, mensaje?, learningUnitIds, estudiantes, pasos, fechaLimite? }' })
  crear(@Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.refuerzos.crear(user, datos ?? {});
  }

  @Patch(':id/archivar')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Archivar un refuerzo (el estudiante deja de verlo; lo hecho se conserva)' })
  archivar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.refuerzos.archivar(user, id);
  }

  @Get(':id')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Un refuerzo como lo ve el estudiante, con sus pasos' })
  ver(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.refuerzos.verComoEstudiante(user, id);
  }

  @Post(':id/pasos/:paso/hecho')
  @Roles('estudiante')
  @ApiOperation({ summary: '«Ya lo vi» en un paso de explicación o de recurso' })
  marcar(@Param('id', ParseIntPipe) id: number, @Param('paso', ParseIntPipe) paso: number, @GetUser() user: User) {
    return this.refuerzos.marcar(user, id, paso);
  }
}
