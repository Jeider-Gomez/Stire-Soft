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
    return this.topicService.create(createDto, user.id);
  }

  /**
   * GET /topic/section/:sectionId
   * Obtener todos los topics activos de una sección.
   */
  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Listar topics de una sección' })
  findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.topicService.findBySection(sectionId);
  }

  /**
   * GET /topic/:id
   * Obtener un topic con sus unidades de aprendizaje.
   */
  @Get(':id')
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTopicDto) {
    return this.topicService.update(id, updateDto);
  }

  /**
   * DELETE /topic/:id
   * Desactivar un topic (soft delete lógico).
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Desactivar un topic' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.topicService.remove(id);
  }
}
