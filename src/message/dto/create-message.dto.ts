import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNumber({}, { message: 'El receiverId debe ser un número' })
  @IsNotEmpty({ message: 'El destinatario es obligatorio' })
  receiverId: number;

  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  content: string;
}
