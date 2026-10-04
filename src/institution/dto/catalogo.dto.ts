import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { TIPOS_INSTITUCION } from '../entities/institution.entity';
import type { TipoInstitucion } from '../entities/institution.entity';
import { TIPOS_PROGRAMA } from '../entities/program.entity';
import type { TipoPrograma } from '../entities/program.entity';

export class CrearInstitucionDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(3, { message: 'Escribe el nombre completo de la institución' })
  @MaxLength(150, { message: 'El nombre puede tener hasta 150 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La sigla debe ser texto' })
  @MaxLength(40, { message: 'La sigla puede tener hasta 40 caracteres' })
  sigla?: string;

  @IsIn(TIPOS_INSTITUCION, { message: 'El tipo es universidad, colegio u otra' })
  tipo!: TipoInstitucion;
}

export class CrearProgramaDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(3, { message: 'Escribe el nombre completo del programa' })
  @MaxLength(150, { message: 'El nombre puede tener hasta 150 caracteres' })
  name!: string;

  @IsInt({ message: 'Elige la institución' })
  institutionId!: number;

  @IsIn(TIPOS_PROGRAMA, { message: 'El tipo es carrera o grado' })
  tipo!: TipoPrograma;

  /** Cuántos semestres (carrera) o grados (nivel escolar) tiene. */
  @IsInt({ message: 'Indica cuántos semestres o grados tiene' })
  @Min(1, { message: 'Debe tener al menos 1 semestre o grado' })
  @Max(20, { message: 'Hasta 20 semestres o grados' })
  maxSemesters!: number;

  @IsOptional()
  @IsString({ message: 'La facultad debe ser texto' })
  @MaxLength(150, { message: 'La facultad puede tener hasta 150 caracteres' })
  facultad?: string;
}

export class CrearAsignaturaDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'Escribe el nombre de la asignatura' })
  @MinLength(3, { message: 'Escribe el nombre completo de la asignatura' })
  @MaxLength(150, { message: 'El nombre puede tener hasta 150 caracteres' })
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'El código debe ser texto' })
  @MaxLength(30, { message: 'El código puede tener hasta 30 caracteres' })
  codigo?: string;

  /** Semestre o grado del plan; solo con programa. */
  @IsOptional()
  @IsInt({ message: 'El semestre o grado debe ser un número' })
  @Min(1, { message: 'El semestre o grado empieza en 1' })
  @Max(20, { message: 'Hasta el semestre o grado 20' })
  periodoPlan?: number;

  /** Con programa: asignatura del plan de estudios. */
  @IsOptional()
  @IsInt({ message: 'El programa no es válido' })
  programId?: number;

  /** Sin programa pero con institución: una electiva libre o un curso de extensión. Sin ninguno: curso libre. */
  @IsOptional()
  @IsInt({ message: 'La institución no es válida' })
  institutionId?: number;
}

export class BuscarAsignaturasDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  programId?: number;
}
