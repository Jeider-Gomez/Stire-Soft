import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewSchedulesService } from './review-schedules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Review Schedules')
@Controller('review-schedules')
@UseGuards(JwtAuthGuard)
export class ReviewSchedulesController {
  constructor(private readonly reviewSchedulesService: ReviewSchedulesService) {}

  @Get('due')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Repasos vencidos y del día del estudiante autenticado, con nivel de urgencia' })
  getDueReviews(@GetUser() user: User) {
    return this.reviewSchedulesService.getDueReviews(user.id);
  }
}
