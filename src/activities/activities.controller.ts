import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PublicationStatus } from '../common/enums/status.enum';

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva actividad' })
  @ApiResponse({ status: 201, description: 'La actividad ha sido creada exitosamente.' })
  create(@Body() createActivityDto: CreateActivityDto) {
    // TODO: Obtener el userId del request context via @CurrentUser() guard
    const mockUserId = 1; 
    return this.activitiesService.create(createActivityDto, mockUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de actividades' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'learningUnitId', required: false, type: Number })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('learningUnitId') learningUnitId?: number,
  ) {
    return this.activitiesService.findAll(paginationQuery, learningUnitId ? +learningUnitId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una actividad por ID' })
  @ApiResponse({ status: 200, description: 'Retorna la actividad solicitada.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una actividad' })
  @ApiResponse({ status: 200, description: 'La actividad ha sido actualizada.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar una actividad' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.changeStatus(id, PublicationStatus.PUBLISHED);
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archivar una actividad' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.changeStatus(id, PublicationStatus.ARCHIVED);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft delete) una actividad' })
  @ApiResponse({ status: 200, description: 'La actividad ha sido eliminada.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.remove(id);
  }
}
