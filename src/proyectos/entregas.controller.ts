import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EntregasService } from './entregas.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/** Entregas (docs/DISENO_INTERVENCION_DOCENTE.md §3 y §10): el docente crea el espacio; el estudiante entrega un proyecto. */
@ApiTags('Entregas')
@Controller('entregas')
@UseGuards(RolesGuard)
export class EntregasController {
  constructor(private readonly entregas: EntregasService) {}

  // Estudiante — las rutas fijas van antes de «:id».

  @Get('mias')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Mis entregas (de todas mis clases o de ?classId=), con su estado' })
  mias(@GetUser() user: User, @Query('classId') classId?: string) {
    return this.entregas.mias(user, classId ? Number(classId) : undefined);
  }

  @Get('abiertas/proyecto/:proyectoId')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Entregas abiertas a las que puedo enviar este proyecto' })
  abiertasPara(@Param('proyectoId', ParseIntPipe) proyectoId: number, @GetUser() user: User) {
    return this.entregas.abiertasPara(user, proyectoId);
  }

  @Get('clase/:classId')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Entregas de una clase, con cuántos entregaron y cuántas faltan por revisar' })
  deLaClase(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.entregas.deLaClase(user, classId);
  }

  @Post()
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Crear una entrega: { classId, titulo, consigna, learningUnitId?, tipoProyecto, maxVersiones, … }' })
  crear(@Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.entregas.crear(user, datos ?? {});
  }

  @Get(':id/detalle')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Una entrega con la fila de cada estudiante (estado, versiones, reaperturas)' })
  detalle(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.entregas.detalle(user, id);
  }

  @Patch(':id')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Editar una entrega (solo los campos que llegan)' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.entregas.actualizar(user, id, datos ?? {});
  }

  @Delete(':id')
  @Roles('docente', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrar una entrega sin envíos' })
  eliminar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.entregas.eliminar(user, id);
  }

  @Post(':id/reabrir')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Darle a un estudiante una versión más: { studentId }' })
  reabrir(@Param('id', ParseIntPipe) id: number, @Body() datos: { studentId?: unknown }, @GetUser() user: User) {
    return this.entregas.reabrir(user, id, datos?.studentId);
  }

  @Get(':id')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Una entrega como la ve el estudiante: consigna, sus versiones y su historial' })
  ver(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.entregas.verComoEstudiante(user, id);
  }

  @Post(':id/enviar')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Entregar uno de mis proyectos: { proyectoId }' })
  enviar(@Param('id', ParseIntPipe) id: number, @Body() datos: { proyectoId?: unknown }, @GetUser() user: User) {
    return this.entregas.enviar(user, id, datos?.proyectoId);
  }

  @Post(':id/empezar')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Crear mi proyecto desde el código inicial de la entrega' })
  empezar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.entregas.empezar(user, id);
  }
}
