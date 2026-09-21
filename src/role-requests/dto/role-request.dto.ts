import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ROLE_REQUEST_STATUSES } from '../entities/role-request.entity';

export class DecideRoleRequestDto {
  @IsIn(['approve', 'reject'], { message: 'La decisión debe ser approve o reject' })
  decision: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La nota no puede superar 300 caracteres' })
  note?: string;
}

export class RoleRequestsQueryDto {
  @IsOptional()
  @IsIn([...ROLE_REQUEST_STATUSES], { message: 'El estado debe ser pending, approved o rejected' })
  status?: (typeof ROLE_REQUEST_STATUSES)[number];
}
