import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

/** Cómo se supo que el recurso falla: YouTube avisó que no se puede ver, o el estudiante dijo que no le carga. */
export const MOTIVOS_FALLA = ['no-se-puede-ver', 'no-carga'] as const;
export type MotivoFalla = (typeof MOTIVOS_FALLA)[number];

export class RecursoFallaDto {
  @IsString({ message: 'El título del recurso debe ser texto' })
  @MinLength(1, { message: 'Falta el título del recurso' })
  @MaxLength(200, { message: 'El título del recurso puede tener hasta 200 caracteres' })
  titulo!: string;

  @IsIn(MOTIVOS_FALLA as unknown as string[], { message: 'Motivo no válido' })
  motivo!: MotivoFalla;
}
