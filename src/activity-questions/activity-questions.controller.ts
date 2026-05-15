import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivityQuestionsService, CreateActivityQuestionDto } from './activity-questions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Activity Questions')
@Controller('activity-questions')
@UseGuards(JwtAuthGuard)
export class ActivityQuestionsController {
  constructor(private readonly questionsService: ActivityQuestionsService) {}

  /**
   * POST /activity-questions
   * El docente crea una pregunta y la asocia a una actividad.
   * El campo `config` contiene la "ground truth" de evaluación (respuesta correcta).
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Crear pregunta para una actividad (incluye respuesta correcta en config)' })
  create(@Body() dto: CreateActivityQuestionDto) {
    return this.questionsService.create(dto);
  }

  /**
   * GET /activity-questions/activity/:activityId
   * Lista todas las preguntas de una actividad.
   */
  @Get('activity/:activityId')
  @ApiOperation({ summary: 'Listar preguntas de una actividad' })
  findByActivity(@Param('activityId', ParseIntPipe) activityId: number) {
    return this.questionsService.findByActivity(activityId);
  }
}
