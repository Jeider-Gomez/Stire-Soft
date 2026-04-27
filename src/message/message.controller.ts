import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Enviar un mensaje
   */
  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @GetUser() user: User) {
    return this.messageService.create(createMessageDto, user.id);
  }

  /**
   * Obtener bandeja de entrada
   */
  @Get('inbox')
  getInbox(@GetUser() user: User) {
    return this.messageService.getInbox(user.id);
  }

  /**
   * Obtener mensajes enviados
   */
  @Get('sent')
  getSent(@GetUser() user: User) {
    return this.messageService.getSent(user.id);
  }

  /**
   * Obtener cantidad de mensajes no leídos
   */
  @Get('unread-count')
  getUnreadCount(@GetUser() user: User) {
    return this.messageService.getUnreadCount(user.id);
  }

  /**
   * Obtener conversación con un usuario
   */
  @Get('conversation/:userId')
  getConversation(@GetUser() user: User, @Param('userId') otherUserId: string) {
    return this.messageService.getConversation(user.id, +otherUserId);
  }

  /**
   * Marcar un mensaje como leído
   */
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @GetUser() user: User) {
    return this.messageService.markAsRead(+id, user.id);
  }
}
