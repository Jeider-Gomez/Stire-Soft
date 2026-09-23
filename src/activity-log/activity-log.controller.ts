import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';

@ApiTags('Activity Log')
@Controller('activity-log')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(
    private readonly logService: ActivityLogService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  /**
   * GET /activity-log/student/:studentId
   * Historial de acciones del estudiante (Tutor IA / docente)
   */
  @Get('student/:studentId')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Ver historial de acciones pedagógicas de un estudiante' })
  async getStudentHistory(@Param('studentId', ParseIntPipe) studentId: number, @GetUser() user: User) {
    // Un docente solo ve el historial de estudiantes con los que comparte clase.
    await this.authorizationService.assertTeacherSharesClassWithStudent(user, studentId);
    return this.logService.getStudentHistory(studentId, 100);
  }
}
