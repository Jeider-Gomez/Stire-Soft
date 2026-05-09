import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TutorService } from './tutor.service';

@ApiTags('AI Tutor')
@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Enviar un mensaje al Tutor IA adaptativo' })
  async chat(@Body('message') message: string) {
    const mockStudentId = 1; // Extraer del JWT en producción
    const response = await this.tutorService.sendMessage(mockStudentId, message);
    return {
      success: true,
      message: response
    };
  }
}
