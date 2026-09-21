import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import {
  PASSWORD_COMPLEXITY_REGEX,
  PASSWORD_COMPLEXITY_MESSAGE,
} from '../../common/validators/password-complexity';

export class RegisterDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(PASSWORD_COMPLEXITY_REGEX, { message: PASSWORD_COMPLEXITY_MESSAGE })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName: string;

  // El registro público SIEMPRE crea un estudiante. 'docente' solo deja una solicitud pendiente
  // que un administrador debe aprobar; nunca concede el rol por sí mismo.
  @IsOptional()
  @IsIn(['estudiante', 'docente'], { message: 'El rol solicitado debe ser estudiante o docente' })
  requestedRole?: 'estudiante' | 'docente';

  @IsOptional()
  @IsString({ message: 'El motivo debe ser texto' })
  @MaxLength(300, { message: 'El motivo no puede superar 300 caracteres' })
  roleRequestReason?: string;
}
