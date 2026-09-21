import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

export const ROLE_REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type RoleRequestStatus = (typeof ROLE_REQUEST_STATUSES)[number];

/**
 * Solicitud de rol docente. El registro público SIEMPRE crea un estudiante; quien quiere ser docente
 * deja una solicitud pendiente que solo un administrador puede aprobar (nadie se da el rol a sí mismo).
 */
@Entity('role_requests')
export class RoleRequest extends StireBaseEntity {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'docente' })
  requestedRole: 'docente';

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'pending' })
  status: RoleRequestStatus;

  /** Lo que escribe quien solicita (por ejemplo, su cátedra o dependencia). Ayuda al admin a decidir. */
  @Column({ type: 'varchar', length: 300, nullable: true })
  reason: string | null;

  @Column({ type: 'int', nullable: true })
  reviewedById: number | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  reviewNote: string | null;
}
