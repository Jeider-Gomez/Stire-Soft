import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** El texto nuevo de un mensaje propio (sugerencia n.º 13). */
export class EditMessageDto {
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @MaxLength(2000, { message: 'El mensaje no puede superar los 2000 caracteres' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  content: string;
}
