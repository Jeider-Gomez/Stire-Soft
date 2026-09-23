import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
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
  // La mensajería es una escritura directa entre usuarios; limita spam sin
  // interferir con una conversación normal.
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @GetUser() user: User) {
    return this.messageService.create(createMessageDto, user);
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
  async getUnreadCount(@GetUser() user: User) {
    // Objeto y no número suelto: es el contrato que leen las bandejas
    // (`res.count`); con un número, el contador «N no leídos» siempre valía 0.
    return { count: await this.messageService.getUnreadCount(user.id) };
  }

  /**
   * Obtener conversación con un usuario
   */
  @Get('conversation/:userId')
  getConversation(@GetUser() user: User, @Param('userId', ParseIntPipe) otherUserId: number) {
    return this.messageService.getConversation(user.id, otherUserId);
  }

  /**
   * Marcar un mensaje como leído
   */
  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.messageService.markAsRead(id, user.id);
  }
}
