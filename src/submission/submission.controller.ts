import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('submission')
@UseGuards(JwtAuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * Enviar un intento — TRIGGER PRINCIPAL
   * Guarda submission → recalcula mastery → actualiza progress
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  submit(@Body() createDto: CreateSubmissionDto, @GetUser() user: User) {
    return this.submissionService.submit(user.id, createDto);
  }

  /**
   * Mis intentos en una evaluación
   */
  @Get('evaluation/:evaluationId')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  getMySubmissions(
    @Param('evaluationId') evaluationId: string,
    @GetUser() user: User,
  ) {
    return this.submissionService.getMySubmissions(user.id, +evaluationId);
  }

  /**
   * Resumen por unidad (mejores scores)
   */
  @Get('unit/:unitId')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  getBestByUnit(
    @Param('unitId') unitId: string,
    @GetUser() user: User,
  ) {
    return this.submissionService.getBestScoresByUnit(user.id, +unitId);
  }
}
