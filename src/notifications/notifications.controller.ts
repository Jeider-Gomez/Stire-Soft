import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Retorna todas las notificaciones no leídas para el estudiante autenticado.
   */
  @Get()
  @ApiOperation({ summary: 'Obtener notificaciones no leídas de la sesión del usuario' })
  findMyNotifications(@GetUser() user: User) {
    return this.notificationsService.findForUser(user.id, true);
  }

  /**
   * GET /notifications/all
   * Retorna todas las notificaciones (leídas y no leídas) para el estudiante autenticado.
   */
  @Get('all')
  @ApiOperation({ summary: 'Obtener todas las notificaciones (leídas y no leídas) del usuario' })
  findAllMyNotifications(@GetUser() user: User) {
    return this.notificationsService.findForUser(user.id, false);
  }

  /**
   * PATCH /notifications/:id/read
   * Marca una notificación específica como leída.
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  markRead(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
