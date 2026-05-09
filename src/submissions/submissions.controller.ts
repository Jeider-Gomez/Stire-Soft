import { Controller, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { StartSubmissionDto } from './dto/start-submission.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar un intento de actividad' })
  startSubmission(@Body() dto: StartSubmissionDto) {
    const mockStudentId = 1; // Obtener de JWT
    return this.submissionsService.startSubmission(dto, mockStudentId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Enviar y calificar respuestas' })
  submitAnswers(@Param('id') id: string, @Body() dto: SubmitAnswersDto) {
    const mockStudentId = 1; // Obtener de JWT
    return this.submissionsService.submitAnswers(id, dto, mockStudentId);
  }

  @Put(':id/autosave')
  @ApiOperation({ summary: 'Autoguardado del progreso' })
  autosave(@Param('id') id: string, @Body() dto: SubmitAnswersDto) {
    const mockStudentId = 1; // Obtener de JWT
    return this.submissionsService.autosave(id, dto, mockStudentId);
  }
}
