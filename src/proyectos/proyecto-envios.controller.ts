import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProyectoEnviosService } from './proyecto-envios.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/**
 * Un envío (una versión entregada): verlo y revisarlo (docs/DISENO_INTERVENCION_DOCENTE.md §3.3). Se envía desde
 * /entregas/:id/enviar. Ruta aparte de /proyectos para que «/proyectos/:id» no choque con estas.
 */
@ApiTags('Proyectos')
@Controller('proyecto-envios')
@UseGuards(RolesGuard)
export class ProyectoEnviosController {
  constructor(private readonly envios: ProyectoEnviosService) {}

  @Get(':id')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Un envío con sus archivos, sus otras versiones y el historial (su autor o el docente de la clase)' })
  obtener(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.envios.obtener(user, id);
  }

  @Patch(':id/revision')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Comentario y, si la entrega lleva nota, nota de 0,0 a 5,0: { nota?, comentario? }' })
  revisar(@Param('id', ParseIntPipe) id: number, @Body() datos: { nota?: unknown; comentario?: unknown }, @GetUser() user: User) {
    return this.envios.revisar(user, id, datos ?? {});
  }
}
