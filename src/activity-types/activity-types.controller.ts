import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ActivityTypesService } from './activity-types.service';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Activity Types')
@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activityTypesService: ActivityTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de actividad' })
  @ApiResponse({ status: 201, description: 'El tipo de actividad ha sido creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El código del tipo de actividad ya existe.' })
  create(@Body() createActivityTypeDto: CreateActivityTypeDto) {
    return this.activityTypesService.create(createActivityTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de tipos de actividad' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.activityTypesService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de actividad por ID' })
  @ApiResponse({ status: 200, description: 'Retorna el tipo de actividad.' })
  @ApiResponse({ status: 404, description: 'Tipo de actividad no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activityTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de actividad' })
  @ApiResponse({ status: 200, description: 'El tipo de actividad ha sido actualizado.' })
  @ApiResponse({ status: 404, description: 'Tipo de actividad no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateActivityTypeDto: UpdateActivityTypeDto) {
    return this.activityTypesService.update(id, updateActivityTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft delete) un tipo de actividad' })
  @ApiResponse({ status: 200, description: 'El tipo de actividad ha sido eliminado.' })
  @ApiResponse({ status: 404, description: 'Tipo de actividad no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activityTypesService.remove(id);
  }
}
