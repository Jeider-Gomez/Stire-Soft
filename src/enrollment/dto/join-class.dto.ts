import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class JoinClassDto {
  @IsString({ message: 'El código de clase debe ser texto' })
  @IsNotEmpty({ message: 'El código de clase es obligatorio' })
  @MaxLength(50, { message: 'El código de clase es demasiado largo' })
  code: string;
}
