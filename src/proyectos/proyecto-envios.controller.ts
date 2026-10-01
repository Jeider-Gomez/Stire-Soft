import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProyectoEnviosService } from './proyecto-envios.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/**
 * Enviar un proyecto al docente (docs/DISENO_PROYECTOS.md §3). Ruta aparte de /proyectos para que «/proyectos/:id» no
 * choque con estas. Que una clase reciba proyectos se activa con PATCH /class/:id { aceptaProyectos }.
 */
@ApiTags('Proyectos')
@Controller('proyecto-envios')
@UseGuards(RolesGuard)
export class ProyectoEnviosController {
  constructor(private readonly envios: ProyectoEnviosService) {}

  @Get('proyecto/:proyectoId')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Clases a las que puedo enviar este proyecto y lo que ya envié, con nota y comentario' })
  delProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number, @GetUser() user: User) {
    return this.envios.delProyecto(user, proyectoId);
  }

  @Post()
  @Roles('estudiante')
  @ApiOperation({ summary: 'Enviar una copia congelada: { proyectoId, classId }' })
  enviar(@Body() datos: { proyectoId?: unknown; classId?: unknown }, @GetUser() user: User) {
    return this.envios.enviar(user, datos ?? {});
  }

  @Get('clase/:classId')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Proyectos recibidos por una clase (sin los archivos)' })
  deLaClase(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.envios.deLaClase(user, classId);
  }

  @Get(':id')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Un envío con sus archivos (su autor o el docente de la clase)' })
  obtener(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.envios.obtener(user, id);
  }

  @Patch(':id/revision')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Nota (0,0 a 5,0), comentario o ambos: { nota?, comentario? }' })
  revisar(@Param('id', ParseIntPipe) id: number, @Body() datos: { nota?: unknown; comentario?: unknown }, @GetUser() user: User) {
    return this.envios.revisar(user, id, datos ?? {});
  }
}
