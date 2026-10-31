import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// «Probar» sin gastar intento. Según el tipo de la pregunta de la actividad se usa `code` (coding) o `html` y `css`
// (html_css, Fase 25). SubmissionsService.runPublicCases exige el campo que corresponda al tipo.
export class RunCodeDto {
  @ApiPropertyOptional({ description: 'Código fuente a ejecutar contra los casos públicos (preguntas coding)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ApiPropertyOptional({ description: 'Datos de entrada que escribe el estudiante (preguntas coding): se ejecuta su código con ellos y se devuelve lo que mostró, sin comparar; máximo 5 000 caracteres' })
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  input?: string;

  @ApiPropertyOptional({ description: 'HTML del estudiante (preguntas html_css); máximo 50 000 caracteres' })
  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  html?: string;

  @ApiPropertyOptional({ description: 'CSS del estudiante (preguntas html_css); máximo 50 000 caracteres' })
  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  css?: string;
}
