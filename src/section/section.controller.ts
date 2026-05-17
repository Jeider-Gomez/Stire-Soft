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
  @Get('class/:classId')
  @ApiOperation({ summary: 'Listar secciones de una clase con su contenido' })
  findByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.sectionService.findByClass(classId);
  }

  /**
   * GET /sections/:id
   * Obtener el detalle de una sección.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sección por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.findOne(id);
  }

  /**
   * PATCH /sections/:id
   * Actualizar título, descripción u orden de una sección.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Actualizar una sección' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
    return this.sectionService.update(id, dto);
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
  togglePublish(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.togglePublish(id);
  }

  /**
   * DELETE /sections/:id
   * Elimina la sección. La cascada eliminará sus topics automáticamente.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Eliminar una sección (y sus topics en cascada)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.remove(id);
  }
}
