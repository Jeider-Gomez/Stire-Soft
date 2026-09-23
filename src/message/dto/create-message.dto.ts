import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateMessageDto {
  @IsInt({ message: 'El receiverId debe ser un número entero' })
  @Min(1, { message: 'El receiverId no es válido' })
  @IsNotEmpty({ message: 'El destinatario es obligatorio' })
  receiverId: number;

  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @MaxLength(2000, { message: 'El mensaje no puede superar los 2000 caracteres' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  content: string;
}
