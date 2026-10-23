import { Controller, Post, Get, Put, Delete, Body, Query, BadRequestException, UseGuards, UseInterceptors, UploadedFile, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MayorDeEdadGuard } from '../auth/guards/mayor-de-edad.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../user/entities/user.entity';
import { TutorService } from './tutor.service';
import { ChatDto } from './dto/chat.dto';
import { SaveApiKeyDto } from './dto/api-key.dto';
import { TutorCredentialService } from './tutor-credential.service';
import { MAX_BYTES_AUDIO } from './tutor-voz';

@ApiTags('AI Tutor')
@ApiBearerAuth()
@Controller('tutor')
export class TutorController {
  constructor(
    private readonly tutorService: TutorService,
    private readonly credentialService: TutorCredentialService,
  ) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('chat')
  @UseGuards(RolesGuard, MayorDeEdadGuard)
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

    const context = typeof body === 'object' ? body?.context : undefined;
    const { message, suggestedActivity, guidanceLevel } = await this.tutorService.sendMessage(user, rawMessage.trim(), context);

    return {
      success: true,
      message,
      response: message,
      suggestedActivity,
      guidanceLevel,
    };
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  /**
   * Lo que el estudiante le dice al Tutor con la voz, en texto (tutor-voz.ts). El navegador manda el audio en WAV y el chat
   * lo envía como un mensaje más.
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('transcribir')
  @HttpCode(200)
  @UseGuards(RolesGuard, MayorDeEdadGuard)
  @Roles('estudiante')
  @UseInterceptors(FileInterceptor('audio', { limits: { fileSize: MAX_BYTES_AUDIO + 1, files: 1 } }))
  @ApiOperation({ summary: 'Convierte en texto una pregunta dicha con la voz (con la clave del estudiante)' })
  async transcribir(@UploadedFile() archivo: { buffer: Buffer } | undefined, @GetUser() user: User) {
    return { texto: await this.tutorService.transcribir(user, archivo?.buffer) };
  }

  @Get('greeting')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Saludo proactivo del Tutor IA basado en el seguimiento real del estudiante (repasos vencidos, mastery bajo)' })
  async greeting(@GetUser() user: User) {
    const { message, suggestedActivity, reemplazaAnterior } = await this.tutorService.getProactiveGreeting(user.id);

    return {
      success: true,
      message,
      suggestedActivity,
      reemplazaAnterior,
    };
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('guidance')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Nivel de ayuda actual del Tutor para una actividad (1 pista, 2 pregunta guía, 3 localizar la falla), según los intentos fallidos propios' })
  async guidance(@GetUser() user: User, @Query('activityId') activityId?: string) {
    const parsed = activityId === undefined ? undefined : Number(activityId);
    const guidance = await this.tutorService.getGuidance(user, Number.isFinite(parsed) ? parsed : undefined);
    return { success: true, ...guidance };
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('history')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Últimos mensajes de la conversación del propio estudiante con el Tutor IA' })
  async history(@GetUser() user: User, @Query('limit') limit?: string) {
    const parsed = limit === undefined ? undefined : Number(limit);
    const messages = await this.tutorService.getHistory(user.id, Number.isFinite(parsed) ? parsed : undefined);
    return { success: true, messages };
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('api-key')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Indica si el estudiante ya configuró su clave de Google AI Studio (nunca devuelve la clave)' })
  async apiKeyStatus(@GetUser() user: User) {
    return { success: true, ...(await this.credentialService.getStatus(user.id)) };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Put('api-key')
  @UseGuards(RolesGuard, MayorDeEdadGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Guarda (cifrada) la clave gratuita de Google AI Studio del estudiante, tras verificarla con Google' })
  async saveApiKey(@Body() body: SaveApiKeyDto, @GetUser() user: User) {
    return { success: true, ...(await this.credentialService.save(user.id, body.apiKey)) };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Delete('api-key')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Elimina la clave de Google AI Studio guardada del estudiante' })
  async deleteApiKey(@GetUser() user: User) {
    await this.credentialService.remove(user.id);
    return { success: true, hasKey: false, last4: null };
  }
}
