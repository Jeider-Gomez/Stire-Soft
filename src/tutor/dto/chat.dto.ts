import { IsNotEmpty, IsString } from 'class-validator';

export class ChatDto {
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  message: string;
}
