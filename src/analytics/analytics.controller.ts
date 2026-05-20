import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  @Get('class/:classId')
  getClassMetrics(@Param('classId') classId: string, @Req() req: any) {
    return this.analyticsService.getClassMetrics(+classId, req.user);
  }
}
