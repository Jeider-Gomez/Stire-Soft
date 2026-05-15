import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
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
   */
  @Get('student/:studentId')
  @ApiOperation({ summary: 'Ver el Mastery de un estudiante por todas sus unidades' })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.progressRepo.find({
      where: { studentId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * GET /learning-progress/student/:studentId/unit/:unitId
   * Retorna el progreso específico de un estudiante en una unidad de aprendizaje.
   */
  @Get('student/:studentId/unit/:unitId')
  @ApiOperation({ summary: 'Ver Mastery de un estudiante en una unidad específica' })
  findByStudentAndUnit(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
  ) {
    return this.progressRepo.findOne({
      where: { studentId, learningUnitId: unitId },
    });
  }
}
