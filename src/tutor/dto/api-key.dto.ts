import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

export class SaveApiKeyDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La clave debe ser texto' })
  @Length(20, 200, { message: 'La clave tiene una longitud inválida' })
  @Matches(/^[A-Za-z0-9_.\-]+$/, { message: 'La clave solo puede tener letras, números, guiones, puntos y guion bajo' })
  apiKey: string;
}
