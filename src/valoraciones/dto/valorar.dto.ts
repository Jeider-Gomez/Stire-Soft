import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ValorarLeccionDto {
  @IsBoolean({ message: 'util debe ser verdadero o falso' })
  util!: boolean;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser texto' })
  @MaxLength(300, { message: 'El comentario puede tener hasta 300 caracteres' })
  comentario?: string;
}
