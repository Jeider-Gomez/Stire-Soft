import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student/:studentId')
  getStudentDashboard(@Param('studentId') studentId: string) {
    return this.analyticsService.getStudentDashboard(+studentId);
  }

  @Get('class/:classId')
  getClassMetrics(@Param('classId') classId: string) {
    return this.analyticsService.getClassMetrics(+classId);
  }
}
