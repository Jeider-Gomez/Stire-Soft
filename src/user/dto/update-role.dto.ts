import { IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateRoleDto {
  @IsEnum(UserRole, { message: 'El rol debe ser un rol válido (admin, docente, estudiante)' })
  role: UserRole;
}
