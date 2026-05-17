import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Activity Log')
@Controller('activity-log')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly logService: ActivityLogService) {}

  /**
   * GET /activity-log/student/:studentId
   * Historial de acciones del estudiante (Tutor IA / docente)
   */
  @Get('student/:studentId')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Ver historial de acciones pedagógicas de un estudiante' })
  getStudentHistory(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.logService.getStudentHistory(studentId, 100);
  }
}
