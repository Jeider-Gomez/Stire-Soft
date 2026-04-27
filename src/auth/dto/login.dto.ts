import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Validación de email
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  // Validación de contraseña
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}