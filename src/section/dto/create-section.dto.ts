import { IsString, IsNotEmpty, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ description: 'ID de la clase a la que pertenece la sección', example: 1 })
  @IsInt()
  @IsNotEmpty()
  classId: number;

  @ApiProperty({ description: 'Título de la sección / módulo', example: 'Módulo 1: Introducción' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Descripción de la sección' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Orden de la sección dentro de la clase', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Indica si la sección está publicada', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
