import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../user/entities/user.entity';
import { TutorService } from './tutor.service';
import { ChatDto } from './dto/chat.dto';

@ApiTags('AI Tutor')
@ApiBearerAuth()
@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('chat')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Enviar un mensaje al Tutor IA adaptativo' })
  async chat(@Body() body: ChatDto | any, @GetUser() user: User) {
    const rawMessage =
      typeof body === 'string'
        ? body
        : body?.message || body?.prompt || body?.content;

    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }

    const studentId = user.id;
    const response = await this.tutorService.sendMessage(studentId, rawMessage.trim());

    return {
      success: true,
      message: response,
      response: response,
    };
  }
}
