import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Sections')
@Controller('sections')
@UseGuards(JwtAuthGuard)
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  /**
   * POST /sections
   * Docente crea una sección/módulo dentro de su clase.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Crear una sección/módulo dentro de una clase' })
  @ApiResponse({ status: 201, description: 'Sección creada exitosamente.' })
  create(@Body() dto: CreateSectionDto, @GetUser() user: User) {
    return this.sectionService.create(dto, user.id);
  }

  /**
   * GET /sections/class/:classId
   * Lista todas las secciones de una clase (con sus topics y unidades).
   */
  // La estructura se acota por quien pregunta (SectionService.filterForRequester):
  // estudiante matriculado → solo lo publicado; docente → solo sus clases.
  @Get('class/:classId')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Listar secciones de una clase con su contenido' })
  findByClass(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.sectionService.findByClassFor(classId, user);
  }

  /**
   * GET /sections/:id
   * Obtener el detalle de una sección.
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Obtener una sección por ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.sectionService.findOneFor(id, user);
  }

  /**
   * PATCH /sections/:id
   * Actualizar título, descripción u orden de una sección.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Actualizar una sección' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto, @GetUser() user: User) {
    return this.sectionService.update(id, dto, user);
  }

  /**
   * PATCH /sections/:id/publish
   * Alterna el estado isPublished de la sección.
   */
  @Patch(':id/publish')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Publicar / despublicar una sección' })
  togglePublish(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.sectionService.togglePublish(id, user);
  }

  /**
   * GET /sections/:id/impacto
   * Qué se pierde si se elimina el módulo; si hay trabajo de estudiantes, no se puede (se archiva).
   */
  @Get(':id/impacto')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Qué se pierde si se elimina el módulo' })
  impacto(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.sectionService.impacto(id, user);
  }

  @Patch(':id/archivar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Archivar un módulo (no se ve para el estudiante; se conserva todo)' })
  archivar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.sectionService.archivar(id, user);
  }

  @Patch(':id/restaurar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Restaurar un módulo archivado (vuelve como borrador)' })
  restaurar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.sectionService.restaurar(id, user);
  }

  /**
   * DELETE /sections/:id
   * Elimina el módulo con sus temas y lecciones, solo si ningún estudiante tiene avance en él (si no, 409).
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Eliminar un módulo sin trabajo de estudiantes' })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.sectionService.remove(id, user);
  }
}
