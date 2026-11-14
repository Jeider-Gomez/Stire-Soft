import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LaboratorioService } from './laboratorio.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/** El Laboratorio (laboratorio-reglas.ts): proyectos que cada quien decide mostrar a su clase o a toda la universidad. */
@ApiTags('Laboratorio')
@Controller('laboratorio')
@UseGuards(RolesGuard)
export class LaboratorioController {
  constructor(private readonly laboratorio: LaboratorioService) {}

  @Get()
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Lo que hay en el Laboratorio: ?alcance=clase|universidad&classId=&tipo=' })
  listar(@GetUser() user: User, @Query('alcance') alcance?: string, @Query('classId') classId?: string, @Query('tipo') tipo?: string) {
    return this.laboratorio.listar(user, { alcance, classId, tipo });
  }

  @Get('mias')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Mis proyectos publicados en el Laboratorio' })
  mias(@GetUser() user: User) {
    return this.laboratorio.mias(user);
  }

  @Post()
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Mostrar un proyecto propio: { proyectoId, classId, alcance: "clase" | "universidad", descripcion? }' })
  publicar(@Body() datos: { proyectoId?: unknown; classId?: unknown; alcance?: unknown; descripcion?: unknown }, @GetUser() user: User) {
    return this.laboratorio.publicar(user, datos ?? {});
  }

  @Get(':id')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Una publicación con sus archivos y mensajes' })
  obtener(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.laboratorio.obtener(user, id);
  }

  @Delete(':id')
  @Roles('estudiante', 'docente', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quitar del Laboratorio una publicación propia' })
  quitar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.laboratorio.quitar(user, id);
  }

  @Post(':id/me-gusta')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Me gusta / ya no' })
  meGusta(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.laboratorio.alternarMeGusta(user, id);
  }

  @Post(':id/comentarios')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Un mensaje para el autor: { texto }' })
  comentar(@Param('id', ParseIntPipe) id: number, @Body() datos: { texto?: unknown }, @GetUser() user: User) {
    return this.laboratorio.comentar(user, id, datos ?? {});
  }

  @Delete(':id/comentarios/:comentarioId')
  @Roles('estudiante', 'docente', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrar un mensaje (quien lo escribió o el docente)' })
  borrarComentario(@Param('id', ParseIntPipe) id: number, @Param('comentarioId', ParseIntPipe) comentarioId: number, @GetUser() user: User) {
    return this.laboratorio.borrarComentario(user, id, comentarioId);
  }

  @Post(':id/copia')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: '«Hacer mi copia»: un proyecto propio con esos archivos' })
  copiar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.laboratorio.copiar(user, id);
  }

  @Post(':id/reportes')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: '«¿Algo no está bien?»: { motivo?, comentarioId? }' })
  reportar(@Param('id', ParseIntPipe) id: number, @Body() datos: { motivo?: unknown; comentarioId?: unknown }, @GetUser() user: User) {
    return this.laboratorio.reportar(user, id, datos ?? {});
  }

  @Patch(':id/oculta')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'El docente de la clase oculta o vuelve a mostrar: { oculta: boolean }' })
  ocultar(@Param('id', ParseIntPipe) id: number, @Body() datos: { oculta?: unknown }, @GetUser() user: User) {
    return this.laboratorio.ocultar(user, id, datos ?? {});
  }
}
