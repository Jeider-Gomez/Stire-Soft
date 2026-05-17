import { IsString, IsNotEmpty, IsInt, IsEnum, IsOptional, IsBoolean, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '../../common/enums/content-type.enum';

export class CreateContentDto {
  @ApiProperty({ description: 'ID de la Learning Unit a la que pertenece', example: 1 })
  @IsInt()
  @IsNotEmpty()
  learningUnitId: number;

  @ApiProperty({ description: 'Título del bloque de contenido', example: 'Introducción a las Variables' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Tipo de contenido',
    enum: ContentType,
    example: ContentType.MARKDOWN,
  })
  @IsEnum(ContentType)
  @IsNotEmpty()
  type: ContentType;

  @ApiPropertyOptional({
    description: 'Cuerpo del contenido (Markdown, HTML, código fuente). Null para VIDEO/PDF/IMAGE.',
    example: '# Variables\nUna variable es un espacio en memoria...',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({
    description: 'Metadatos JSON (url para VIDEO/PDF/IMAGE, language para CODE)',
    example: { url: 'https://youtu.be/abc123', duration: 320 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Orden dentro de la unidad', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Visibilidad del bloque', default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
