import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityTypeDto {
  @ApiProperty({ description: 'Nombre descriptivo del tipo de actividad', example: 'Coding Challenge' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Código único para identificación interna', example: 'coding' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Indica si puede ser autoevaluada por el sistema', default: true })
  @IsOptional()
  @IsBoolean()
  autoGradable?: boolean;

  @ApiPropertyOptional({ description: 'Peso base para el cálculo de Mastery', default: 1.0 })
  @IsOptional()
  @IsNumber()
  baseWeight?: number;

  @ApiPropertyOptional({ description: 'JSON Schema para validar la configuración de las preguntas de este tipo' })
  @IsOptional()
  @IsObject()
  configSchema?: Record<string, any>;
}
