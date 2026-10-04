import { Controller, Get, Param, ParseIntPipe, Post, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student/:studentId')
  getStudentDashboard(@Param('studentId') studentId: string, @Req() req: any) {
    return this.analyticsService.getStudentDashboard(+studentId, req.user);
  }

  /** Mapa de calor del docente: estudiantes × unidades y las listas de a quién ayudar (paso 6). */
  // Logros y medallas (logros.ts): los del propio estudiante, o los de un estudiante de su clase para el docente.
  @Get('student/:studentId/logros')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  getLogros(@Param('studentId', ParseIntPipe) studentId: number, @Req() req: { user: User }) {
    return this.analyticsService.getLogros(studentId, req.user);
  }

  @Post('logros/vistos')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  marcarLogrosVistos(@Req() req: { user: { id: number } }) {
    return this.analyticsService.marcarLogrosVistos(req.user.id);
  }

  @Get('class/:classId/heatmap')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getClassHeatmap(@Param('classId', ParseIntPipe) classId: number, @Req() req: any) {
    return this.analyticsService.getClassHeatmap(classId, req.user);
  }

  /** Resumen de la semana para «Hoy»: esta semana frente a la anterior y quién no ha practicado. */
  @Get('class/:classId/semana')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getResumenSemanal(@Param('classId', ParseIntPipe) classId: number, @Req() req: any) {
    return this.analyticsService.getResumenSemanal(classId, req.user);
  }

  @Get('class/:classId')
  getClassMetrics(@Param('classId') classId: string, @Req() req: any) {
    return this.analyticsService.getClassMetrics(+classId, req.user);
  }
}
