import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SubmissionsService } from './submissions.service';
import { StartSubmissionDto } from './dto/start-submission.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { RunCodeDto } from './dto/run-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Submissions')
@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Iniciar un intento de actividad' })
  startSubmission(@Body() dto: StartSubmissionDto, @GetUser() user: User) {
    return this.submissionsService.startSubmission(dto, user.id);
  }

  // P1-03: sin límite específico, un cliente podía reintentar envíos de
  // examen sin fricción más allá del límite global (inactivo hasta este bloque).
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post(':id/submit')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Enviar y calificar respuestas' })
  submitAnswers(@Param('id') id: string, @Body() dto: SubmitAnswersDto, @GetUser() user: User) {
    return this.submissionsService.submitAnswers(id, dto, user.id);
  }

  @Post(':id/run')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Ensayar código contra los casos públicos, sin consumir intento' })
  runPublicCases(@Param('id') id: string, @Body() dto: RunCodeDto, @GetUser() user: User) {
    return this.submissionsService.runPublicCases(id, dto, user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Consultar el estado y resultado de un intento (para sondear calificación asíncrona)' })
  getSubmissionStatus(@Param('id') id: string, @GetUser() user: User) {
    return this.submissionsService.getSubmissionStatus(id, user.id);
  }

  @Put(':id/autosave')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Autoguardado del progreso' })
  autosave(@Param('id') id: string, @Body() dto: SubmitAnswersDto, @GetUser() user: User) {
    return this.submissionsService.autosave(id, dto, user.id);
  }
}
