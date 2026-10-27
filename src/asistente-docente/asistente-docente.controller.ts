import { Body, Controller, Delete, Get, HttpCode, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';
import { SaveApiKeyDto } from '../tutor/dto/api-key.dto';
import { AsistenteDocenteService } from './asistente-docente.service';
import { TIPOS_BORRADOR, type TipoBorrador } from './asistente-prompts';

class ContextoAsistenteDto {
  @IsOptional() @IsString() @MaxLength(200) asignatura?: string;
  @IsOptional() @IsString() @MaxLength(200) clase?: string;
  @IsOptional() @IsString() @MaxLength(200) modulo?: string;
  @IsOptional() @IsString() @MaxLength(200) tema?: string;
  @IsOptional() @IsString() @MaxLength(200) leccion?: string;
  @IsOptional() @IsString() @MaxLength(8000) textoActual?: string;
  @IsOptional() @IsInt() @Min(1) @Max(8) cantidad?: number;
  @IsOptional() @IsString() @MaxLength(3000) resumenClase?: string;
}

export class GenerarBorradorDto {
  @IsIn(TIPOS_BORRADOR as unknown as string[], { message: 'Tipo de borrador desconocido' })
  tipo!: TipoBorrador;

  @IsObject() @ValidateNested() @Type(() => ContextoAsistenteDto)
  contexto!: ContextoAsistenteDto;

  @IsOptional() @IsString() @MaxLength(600, { message: 'El pedido puede tener hasta 600 caracteres' })
  pedido?: string;
}

/** Asistente del docente: su clave de Google AI Studio y los borradores (docs/PLAN_ASISTENTE_DOCENTE.md). Solo docentes. */
@ApiTags('Asistente del docente')
@ApiBearerAuth()
@Controller('asistente')
@UseGuards(RolesGuard)
@Roles('docente')
export class AsistenteDocenteController {
  constructor(private readonly asistente: AsistenteDocenteService) {}

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('api-key')
  @ApiOperation({ summary: 'Si el docente ya configuró su clave de Google AI Studio (nunca la devuelve)' })
  async estado(@GetUser() user: User) {
    return { success: true, ...(await this.asistente.estadoClave(user.id)) };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Put('api-key')
  @ApiOperation({ summary: 'Guarda cifrada la clave del docente, tras verificarla con Google' })
  async guardar(@Body() body: SaveApiKeyDto, @GetUser() user: User) {
    return { success: true, ...(await this.asistente.guardarClave(user.id, body.apiKey)) };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Delete('api-key')
  async borrar(@GetUser() user: User) {
    await this.asistente.borrarClave(user.id);
    return { success: true, hasKey: false, last4: null };
  }

  /** Límite por docente para cuidar la cuota gratuita de su clave. */
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post('borrador')
  @HttpCode(200)
  @ApiOperation({ summary: 'Propone un borrador (estructura, lección o ejercicios); no guarda nada' })
  async borrador(@Body() body: GenerarBorradorDto, @GetUser() user: User) {
    return { success: true, borrador: await this.asistente.generar(user.id, body.tipo, body.contexto, body.pedido ?? '') };
  }
}
