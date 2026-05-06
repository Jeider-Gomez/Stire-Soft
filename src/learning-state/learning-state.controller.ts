import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { LearningStateService } from './learning-state.service';
import { UpdateMasteryDto } from './dto/update-mastery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class LearningStateController {
  constructor(private readonly learningStateService: LearningStateService) {}

  /**
   * Dashboard completo del estudiante
   * Retorna: topics → unidades → mastery → recomendaciones top 3
   */
  @Get('my-dashboard')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  getMyDashboard(@GetUser() user: User) {
    return this.learningStateService.getMyDashboard(user.id);
  }

  /**
   * Obtener mi progreso completo (estudiante)
   */
  @Get('my-progress')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  getMyProgress(@GetUser() user: User) {
    return this.learningStateService.getFullStudentProgress(user.id);
  }

  /**
   * Obtener recomendaciones personalizadas (estudiante)
   */
  @Get('recommendations')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  getRecommendations(@GetUser() user: User) {
    return this.learningStateService.getRecommendations(user.id);
  }

  /**
   * Marcar una unidad como vista (estudiante)
   */
  @Post('view/:unitId')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  markAsViewed(@GetUser() user: User, @Param('unitId') unitId: string) {
    return this.learningStateService.markAsViewed(user.id, +unitId);
  }

  /**
   * Actualizar mastery de una unidad (estudiante o docente)
   */
  @Patch('update-mastery/:unitId')
  updateMastery(
    @GetUser() user: User,
    @Param('unitId') unitId: string,
    @Body() updateMasteryDto: UpdateMasteryDto,
  ) {
    return this.learningStateService.updateMastery(user.id, +unitId, updateMasteryDto.mastery);
  }

  /**
   * Actualizar mastery de un estudiante específico (docente)
   */
  @Patch('student/:studentId/unit/:unitId')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  updateStudentMastery(
    @Param('studentId') studentId: string,
    @Param('unitId') unitId: string,
    @Body() updateMasteryDto: UpdateMasteryDto,
  ) {
    return this.learningStateService.updateMastery(+studentId, +unitId, updateMasteryDto.mastery);
  }

  /**
   * Ver progreso de un estudiante específico (docente/admin)
   */
  @Get('student/:studentId')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getStudentProgress(@Param('studentId') studentId: string) {
    return this.learningStateService.getFullStudentProgress(+studentId);
  }

  /**
   * Resumen de progreso para el tutor (uso interno)
   */
  @Get('summary/:studentId')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getProgressSummary(@Param('studentId') studentId: string) {
    return this.learningStateService.getProgressSummaryForTutor(+studentId);
  }
}
