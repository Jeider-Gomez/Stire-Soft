import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TUTOR_STYLES } from '../tutor-settings';

/** Todos los campos son opcionales y admiten `null` (= volver a heredar del ámbito superior). */
export class UpdateTutorSettingsDto {
  @IsOptional()
  @IsBoolean({ message: 'enabled debe ser verdadero o falso' })
  enabled?: boolean | null;

  @IsOptional()
  @IsInt({ message: 'El tope de ayuda debe ser 1, 2 o 3' })
  @Min(1, { message: 'El tope de ayuda debe ser 1, 2 o 3' })
  @Max(3, { message: 'El tope de ayuda debe ser 1, 2 o 3' })
  maxGuideLevel?: number | null;

  @IsOptional()
  @IsIn([...TUTOR_STYLES], { message: `El estilo debe ser uno de: ${TUTOR_STYLES.join(', ')}` })
  style?: string | null;
}
