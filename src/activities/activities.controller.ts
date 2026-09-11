import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { FindActivitiesQueryDto } from './dto/find-activities-query.dto';
import { PublicationStatus } from '../common/enums/status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Crear una nueva actividad' })
  @ApiResponse({ status: 201, description: 'La actividad ha sido creada exitosamente.' })
  create(@Body() createActivityDto: CreateActivityDto, @GetUser() user: User) {
    return this.activitiesService.create(createActivityDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de actividades' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'learningUnitId', required: false, type: Number })
  findAll(
    @Query() paginationQuery: FindActivitiesQueryDto,
    @GetUser() user: User,
  ) {
    return this.activitiesService.findAll(paginationQuery, user, paginationQuery.learningUnitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una actividad por ID' })
  @ApiResponse({ status: 200, description: 'Retorna la actividad solicitada.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.activitiesService.findOneForRequester(id, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Actualizar una actividad' })
  @ApiResponse({ status: 200, description: 'La actividad ha sido actualizada.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateActivityDto: UpdateActivityDto, @GetUser() user: User) {
    return this.activitiesService.update(id, updateActivityDto, user);
  }

  @Patch(':id/publish')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar una actividad' })
  publish(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.activitiesService.changeStatus(id, PublicationStatus.PUBLISHED, user);
  }

  @Patch(':id/archive')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archivar una actividad' })
  archive(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.activitiesService.changeStatus(id, PublicationStatus.ARCHIVED, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Eliminar (soft delete) una actividad' })
  @ApiResponse({ status: 200, description: 'La actividad ha sido eliminada.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.activitiesService.remove(id, user);
  }
}
