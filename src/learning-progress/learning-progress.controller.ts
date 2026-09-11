import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LearningProgressRepository } from './learning-progress.repository';
import { LearningProgressService } from './learning-progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Learning Progress')
@Controller('learning-progress')
@UseGuards(JwtAuthGuard)
export class LearningProgressController {
  constructor(
    private readonly progressRepo: LearningProgressRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly learningProgressService: LearningProgressService,
  ) {}

  /**
   * GET /learning-progress/student/:studentId
   * Retorna todos los registros de progreso (mastery) de un estudiante.
   *
   * Seguridad BOLA: un estudiante sólo puede ver su propio progreso.
   * Un docente solo puede ver el de un estudiante con quien comparte al
   * menos una clase (OLA 3 - PUNTO 2/3, P1-R5 — antes veía el de cualquier
   * estudiante de la institución). Admin pasa siempre.
   */
  @Get('student/:studentId')
  @ApiOperation({ summary: 'Ver el Mastery de un estudiante por todas sus unidades' })
  async findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(user, studentId);

    return this.progressRepo.find({
      where: { studentId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * GET /learning-progress/student/:studentId/unit/:unitId
   * Retorna el progreso específico de un estudiante en una unidad de aprendizaje.
   *
   * Seguridad BOLA: mismo control de acceso que la ruta raíz.
   */
  @Get('student/:studentId/unit/:unitId')
  @ApiOperation({ summary: 'Ver Mastery de un estudiante en una unidad específica' })
  async findByStudentAndUnit(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(user, studentId);

    return this.progressRepo.findOne({
      where: { studentId, learningUnitId: unitId },
    });
  }

  @Get('student/:studentId/unit/:unitId/next-activity')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Recomendar la siguiente actividad de una unidad' })
  async getNextActivity(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(user, studentId);
    return this.learningProgressService.getNextActivity(studentId, unitId);
  }
}
