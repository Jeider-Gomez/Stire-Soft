import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class CreateClassDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es obligatorio' })
  code: string;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  compartidaComoPlantilla?: boolean;

  /** Dominio (%) del módulo anterior para abrir el siguiente; 0 = sin bloqueo. */
  @IsInt({ message: 'El dominio para avanzar debe ser un número entero' })
  @Min(0, { message: 'El dominio para avanzar va de 0 a 100' })
  @Max(100, { message: 'El dominio para avanzar va de 0 a 100' })
  @IsOptional()
  dominioParaAvanzar?: number;

  /** Asignatura del catálogo (GET /asignaturas); null la quita. */
  @ValidateIf((_o, v) => v !== null && v !== undefined)
  @IsInt({ message: 'La asignatura no es válida' })
  @IsOptional()
  asignaturaId?: number | null;

  /** Periodo académico: «2026-2» o «2026». Vacío o null lo quita. */
  @ValidateIf((_o, v) => v !== null && v !== undefined && v !== '')
  @Matches(/^\d{4}(-[1-4])?$/, { message: 'El periodo se escribe como 2026-2 (año y periodo) o 2026' })
  @IsOptional()
  periodo?: string | null;

  /** Grupo o sección: «Grupo 2». */
  @ValidateIf((_o, v) => v !== null && v !== undefined)
  @IsString({ message: 'El grupo debe ser texto' })
  @MaxLength(40, { message: 'El grupo puede tener hasta 40 caracteres' })
  @IsOptional()
  grupo?: string | null;
}
