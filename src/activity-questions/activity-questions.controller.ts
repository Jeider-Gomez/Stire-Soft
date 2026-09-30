import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivityQuestionsService, CreateActivityQuestionDto, UpdateActivityQuestionDto } from './activity-questions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { StudentQuestionDto } from './dto/student-question.dto';

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
  create(@Body() dto: CreateActivityQuestionDto, @GetUser() user: User) {
    return this.questionsService.create(dto, user);
  }

  /**
   * PATCH /activity-questions/:id — paso 4b.
   * Edita enunciado, puntos o datos de la pregunta. 409 si la actividad ya tiene entregas enviadas o calificadas.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Editar una pregunta (solo si la actividad no tiene entregas)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateActivityQuestionDto, @GetUser() user: User) {
    return this.questionsService.update(id, dto, user);
  }

  /**
   * GET /activity-questions/activity/:activityId/editable — paso 4b.
   * { activityId, editable, submissions }: la pantalla lo consulta antes de abrir el editor.
   */
  @Get('activity/:activityId/editable')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: '¿Se pueden editar las preguntas de esta actividad?' })
  getEditability(@Param('activityId', ParseIntPipe) activityId: number, @GetUser() user: User) {
    return this.questionsService.getEditability(activityId, user);
  }

  /**
   * GET /activity-questions/activity/:activityId
   * Lista las preguntas de una actividad. Un estudiante NUNCA recibe la
   * entidad cruda (P0-03): la respuesta correcta se quita del `config`, y en
   * DRAG_DROP/MATCHING/ORDERING las listas se barajan porque el orden en que
   * se guardan ES la respuesta. Docente/admin sí reciben la entidad completa.
   */
  @Get('activity/:activityId')
  @ApiOperation({ summary: 'Listar preguntas de una actividad' })
  async findByActivity(
    @Param('activityId', ParseIntPipe) activityId: number,
    @GetUser() requester: User,
  ) {
    const questions = await this.questionsService.findByActivity(activityId, requester);

    if (requester.role === UserRole.DOCENTE || requester.role === UserRole.ADMIN) {
      return questions;
    }

    return questions.map((q) => StudentQuestionDto.fromEntity(q));
  }
}
