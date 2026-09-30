import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProyectosService } from './proyectos.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/**
 * Proyectos (docs/DISENO_PROYECTOS.md): el espacio de programación propio de cada usuario. Todas las rutas trabajan
 * solo con los proyectos de quien las llama. La ejecución ocurre en el navegador: aquí solo se guarda texto.
 */
@ApiTags('Proyectos')
@Controller('proyectos')
@UseGuards(RolesGuard)
export class ProyectosController {
  constructor(private readonly proyectos: ProyectosService) {}

  @Get('estado')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: '¿Proyectos está disponible para mí? y sus límites' })
  estado(@GetUser() user: User) {
    return this.proyectos.estado(user);
  }

  @Get()
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Mis proyectos (sin el contenido de los archivos)' })
  listar(@GetUser() user: User) {
    return this.proyectos.listar(user);
  }

  @Post()
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Crear un proyecto: { titulo, tipo: "web" | "javascript" }' })
  crear(@Body() datos: { titulo?: unknown; tipo?: unknown }, @GetUser() user: User) {
    return this.proyectos.crear(user, datos ?? {});
  }

  @Get(':id')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Un proyecto propio, con sus archivos' })
  obtener(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.proyectos.obtener(user, id);
  }

  @Patch(':id')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Guardar: { titulo?, archivos? }' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: { titulo?: unknown; archivos?: unknown }, @GetUser() user: User) {
    return this.proyectos.actualizar(user, id, datos ?? {});
  }

  @Delete(':id')
  @Roles('estudiante', 'docente', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrar un proyecto propio' })
  eliminar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.proyectos.eliminar(user, id);
  }
}
