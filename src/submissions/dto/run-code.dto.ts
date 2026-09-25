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
