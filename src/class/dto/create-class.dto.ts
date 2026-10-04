import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  compartidaComoPlantilla?: boolean;

  /** Dominio (%) del módulo anterior para abrir el siguiente; 0 = sin bloqueo. */
  @IsInt({ message: 'El dominio para avanzar debe ser un número entero' })
  @Min(0, { message: 'El dominio para avanzar va de 0 a 100' })
  @Max(100, { message: 'El dominio para avanzar va de 0 a 100' })
  @IsOptional()
  dominioParaAvanzar?: number;
}
