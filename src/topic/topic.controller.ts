import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Topics')
@Controller('topic')
@UseGuards(JwtAuthGuard)
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  /**
   * POST /topic
   * Crear un topic dentro de una sección (solo docentes).
   * Body: { sectionId, title, description?, order? }
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Crear un topic dentro de una sección' })
  create(@Body() createDto: CreateTopicDto, @GetUser() user: User) {
    return this.topicService.create(createDto, user);
  }

  /**
   * GET /topic/section/:sectionId
   * Obtener todos los topics activos de una sección.
   */
  // OLA 3 - PUNTO 2: catálogo de estructura, sin dato sensible propio —
  // abierto a cualquier rol autenticado de forma deliberada.
  @Get('section/:sectionId')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Listar topics de una sección' })
  findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.topicService.findBySection(sectionId);
  }

  /**
   * GET /topic/:id
   * Obtener un topic con sus unidades de aprendizaje.
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Obtener un topic por ID (con sus learning units)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.topicService.findOne(id);
  }

  /**
   * PATCH /topic/:id
   * Actualizar un topic (docente/admin).
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Actualizar un topic' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTopicDto,
    @GetUser() user: User,
  ) {
    return this.topicService.update(id, updateDto, user);
  }

  /** GET /topic/:id/impacto — qué se pierde si se elimina el tema. */
  @Get(':id/impacto')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Qué se pierde si se elimina el tema' })
  impacto(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.topicService.impacto(id, user);
  }

  /** PATCH /topic/:id/archivar — lo mismo que DELETE sin ?permanent: se oculta y se conserva. */
  @Patch(':id/archivar')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Archivar un tema' })
  archivar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.topicService.remove(id, user);
  }

  @Patch(':id/restaurar')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Restaurar un tema archivado' })
  restaurar(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.topicService.restaurar(id, user);
  }

  /**
   * DELETE /topic/:id
   * Archivar un topic (soft delete lógico) o eliminarlo definitivamente con ?permanent=true (409 si hay avance de estudiantes).
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Desactivar o eliminar definitivamente un topic' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Query('permanent') permanent?: string,
  ) {
    if (permanent === 'true') {
      return this.topicService.deletePermanent(id, user);
    }
    return this.topicService.remove(id, user);
  }
}
