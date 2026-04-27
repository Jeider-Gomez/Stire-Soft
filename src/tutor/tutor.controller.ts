import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TutorService } from './tutor.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('tutor')
@UseGuards(JwtAuthGuard)
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  /**
   * Enviar mensaje al tutor inteligente (solo estudiantes)
   */
  @Post('chat')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  async chat(@Body() chatDto: ChatDto, @GetUser() user: User) {
    return this.tutorService.chat(user.id, chatDto.message);
  }
}
