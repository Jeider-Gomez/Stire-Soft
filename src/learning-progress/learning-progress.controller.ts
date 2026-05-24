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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Learning Progress')
@Controller('learning-progress')
@UseGuards(JwtAuthGuard)
export class LearningProgressController {
  constructor(private readonly progressRepo: LearningProgressRepository) {}

  /**
   * GET /learning-progress/student/:studentId
   * Retorna todos los registros de progreso (mastery) de un estudiante.
   *
   * Seguridad BOLA: un estudiante sólo puede ver su propio progreso.
   * Admins y docentes pueden consultar el de cualquier estudiante.
   */
  @Get('student/:studentId')
  @ApiOperation({ summary: 'Ver el Mastery de un estudiante por todas sus unidades' })
  findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }

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
  findByStudentAndUnit(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }

    return this.progressRepo.findOne({
      where: { studentId, learningUnitId: unitId },
    });
  }
}
