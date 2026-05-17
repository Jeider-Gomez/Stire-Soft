import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({ description: 'ID de la sección a la que pertenece el topic', example: 1 })
  @IsNumber({}, { message: 'El sectionId debe ser un número' })
  @IsNotEmpty({ message: 'El sectionId es obligatorio' })
  sectionId!: number;

  @ApiProperty({ description: 'Título del topic', example: 'Tipos de Datos Primitivos' })
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @ApiPropertyOptional({ description: 'Descripción del topic' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Orden dentro de la sección', default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
