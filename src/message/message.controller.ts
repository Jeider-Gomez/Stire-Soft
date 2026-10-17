import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { MAX_BYTES_CAPTURA } from '../media/imagen-subida';
import { Throttle } from '@nestjs/throttler';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

  /**
   * Editar el texto de un mensaje propio (sugerencia n.º 13).
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  editar(@Param('id', ParseIntPipe) id: number, @Body() dto: EditMessageDto, @GetUser() user: User) {
    return this.messageService.editar(id, user, dto.content);
  }

  /**
   * Adjuntar una imagen (PNG, JPG, GIF o WebP, hasta 3 MB) a un mensaje propio.
   */
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Put(':id/imagen')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  @UseInterceptors(FileInterceptor('imagen', { limits: { fileSize: MAX_BYTES_CAPTURA + 1, files: 1 } }))
  adjuntarImagen(@Param('id', ParseIntPipe) id: number, @UploadedFile() archivo: { buffer: Buffer } | undefined, @GetUser() user: User) {
    return this.messageService.adjuntarImagen(id, user, archivo?.buffer);
  }

  /**
   * Ver la imagen de un mensaje (quien lo envió o lo recibió). Se sirve como imagen y nada más, como los pantallazos.
   */
  @Get(':id/imagen')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  async verImagen(@Param('id', ParseIntPipe) id: number, @GetUser() user: User, @Res() res: Response) {
    const { mimeType, data } = await this.messageService.imagen(id, user.id);
    res.set({
      'Content-Type': mimeType,
      'Content-Length': String(data.length),
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': 'private, no-store',
    });
    res.send(data);
  }
}
