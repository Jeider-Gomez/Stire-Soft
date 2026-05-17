import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityLogAction } from '../activity-log/entities/activity-log.entity';

@ApiTags('Content')
@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  /** POST /content — El docente crea un bloque de contenido */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Crear un bloque de contenido en una Learning Unit' })
  create(@Body() dto: CreateContentDto) {
    return this.contentService.create(dto);
  }

  /**
   * GET /content/unit/:unitId
   * El estudiante ve los bloques visibles de la unidad.
   * 🔑 REGISTRA automáticamente un log de "content_read" por cada acceso.
   */
  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Listar contenido visible de una unidad (registra log de lectura)' })
  async findByUnit(
    @Param('unitId', ParseIntPipe) unitId: number,
    @GetUser() user: User,
  ) {
    const contents = await this.contentService.findByUnit(unitId);

    // Fire-and-forget: registrar que el estudiante accedió a esta unidad
    this.activityLogService.log({
      studentId: user.id,
      action: ActivityLogAction.CONTENT_READ,
      referenceId: String(unitId),
      referenceType: 'learning_unit',
      metadata: {
        contentCount: contents.length,
        unitId,
      },
    });

    return contents;
  }

  /** GET /content/unit/:unitId/all — El docente ve TODOS los bloques, incluyendo ocultos */
  @Get('unit/:unitId/all')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Listar todo el contenido de una unidad (incluyendo ocultos)' })
  findByUnitAll(@Param('unitId', ParseIntPipe) unitId: number) {
    return this.contentService.findByUnitAll(unitId);
  }

  /**
   * GET /content/:id
   * Ver un bloque de contenido específico.
   * 🔑 REGISTRA un log de "content_read" por bloque individual.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un bloque de contenido por ID (registra log)' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    const content = await this.contentService.findOne(id);

    // Fire-and-forget log
    this.activityLogService.log({
      studentId: user.id,
      action: ActivityLogAction.CONTENT_READ,
      referenceId: String(id),
      referenceType: 'content',
      metadata: {
        contentType: content.type,
        learningUnitId: content.learningUnitId,
      },
    });

    return content;
  }

  /** PATCH /content/:id — Actualizar un bloque de contenido */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Actualizar un bloque de contenido' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContentDto) {
    return this.contentService.update(id, dto);
  }

  /** PATCH /content/:id/visibility — Toggle de visibilidad */
  @Patch(':id/visibility')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Alternar visibilidad de un bloque de contenido' })
  toggleVisibility(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.toggleVisibility(id);
  }

  /** POST /content/reorder — Reordenar bloques */
  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Reordenar bloques de contenido enviando [{ id, order }]' })
  reorder(@Body() items: { id: number; order: number }[]) {
    return this.contentService.reorder(items);
  }

  /** DELETE /content/:id — Eliminar un bloque de contenido */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Eliminar un bloque de contenido' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.remove(id);
  }
}
