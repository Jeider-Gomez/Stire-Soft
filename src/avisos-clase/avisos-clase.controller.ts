import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { AvisosClaseService } from './avisos-clase.service';

/** Avisos del docente a toda su clase: citaciones, recordatorios e informes (aviso-reglas.ts). */
@ApiTags('Avisos de la clase')
@Controller('avisos-clase')
@UseGuards(RolesGuard)
export class AvisosClaseController {
  constructor(private readonly avisos: AvisosClaseService) {}

  @Get('mios')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Los avisos de todas mis clases, el más nuevo primero' })
  mios(@GetUser() user: User) {
    return this.avisos.mios(user);
  }

  @Get('clase/:classId')
  @Roles('docente', 'admin', 'estudiante')
  @ApiOperation({ summary: 'Los avisos de una clase (su docente o un estudiante matriculado)' })
  deClase(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.avisos.deClase(user, classId);
  }

  @Post('clase/:classId')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Publicar un aviso: { tipo: aviso|citacion|recordatorio, titulo, cuerpo, fechaEvento?, lugar? }; avisa a cada estudiante' })
  crear(@Param('classId', ParseIntPipe) classId: number, @Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.avisos.crear(user, classId, datos ?? {});
  }

  @Delete(':id')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Borrar un aviso de mi clase' })
  eliminar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.avisos.eliminar(user, id);
  }
}
