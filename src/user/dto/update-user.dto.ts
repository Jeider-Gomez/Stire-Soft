import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

// PartialType hace que todas las propiedades de CreateUserDto sean opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Campo opcional para actualizar el estado activo
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;

  // Campo opcional para actualizar el rol
  @IsString({ message: 'El rol debe ser una cadena de texto' })
  @IsOptional()
  role?: string;
}