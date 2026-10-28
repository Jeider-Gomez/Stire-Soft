import { Controller, Post, Get, Put, Delete, Body, Query, BadRequestException, HttpException, UseGuards, UseInterceptors, UploadedFile, HttpCode, Res } from '@nestjs/common';
import type { Response } from 'express';
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
    const { mensaje, context } = mensajeDelCuerpo(body);
    const { message, suggestedActivity, guidanceLevel } = await this.tutorService.sendMessage(user, mensaje, context);

    return {
      success: true,
      message,
      response: message,
      suggestedActivity,
      guidanceLevel,
    };
  }

  /**
   * El mismo chat, con la respuesta por partes (SSE; ítem 2 de la evaluación heurística): el estudiante la ve a medida que
   * llega en vez de esperar varios segundos en blanco. Cada evento es `data: {json}`: `trozo` (texto ya pasado por la
   * barrera contra dar la solución), `fin` (el mensaje definitivo, el que se guarda, con la sugerencia y el nivel de
   * ayuda) o `error`. Si algo falla ANTES del primer trozo, responde con el código HTTP de siempre, así el navegador lo
   * trata igual que en /tutor/chat.
   */
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('chat/stream')
  @UseGuards(RolesGuard, MayorDeEdadGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Enviar un mensaje al Tutor IA y recibir la respuesta por partes (SSE)' })
  async chatEnVivo(@Body() body: ChatDto | any, @GetUser() user: User, @Res() res: Response) {
    const { mensaje, context } = mensajeDelCuerpo(body);
    let abierto = false;
    const enviar = (dato: object) => {
      if (!abierto) {
        res.status(200);
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        abierto = true;
      }
      res.write(`data: ${JSON.stringify(dato)}

`);
    };
    try {
      const r = await this.tutorService.sendMessageEnVivo(user, mensaje, context, (texto) => enviar({ tipo: 'trozo', texto }));
      enviar({ tipo: 'fin', message: r.message, suggestedActivity: r.suggestedActivity, guidanceLevel: r.guidanceLevel });
      res.end();
    } catch (err) {
      if (!abierto) throw err;
      const estado = err instanceof HttpException ? err.getStatus() : 500;
      const texto = err instanceof HttpException ? String((err.getResponse() as { message?: unknown })?.message ?? err.message) : 'El Tutor se interrumpió. Inténtalo de nuevo.';
      enviar({ tipo: 'error', estado, mensaje: texto });
      res.end();
    }
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

/** El mensaje y el contexto que manda el chat (texto suelto o `{ message | prompt | content, context }`). */
function mensajeDelCuerpo(body: unknown): { mensaje: string; context: unknown } {
  const b = body as { message?: unknown; prompt?: unknown; content?: unknown; context?: unknown } | string | null;
  const crudo = typeof b === 'string' ? b : b?.message || b?.prompt || b?.content;
  if (!crudo || typeof crudo !== 'string' || !crudo.trim()) {
    throw new BadRequestException('El mensaje no puede estar vacío');
  }
  return { mensaje: crudo.trim(), context: typeof b === 'object' && b ? b.context : undefined };
}
