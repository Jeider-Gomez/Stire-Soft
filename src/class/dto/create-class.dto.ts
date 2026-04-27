import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
