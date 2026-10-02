import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user.entity';

/** Por dónde cambió el rol: el panel de usuarios del admin o la aprobación de una solicitud de rol docente. */
export type OrigenCambioDeRol = 'panel_admin' | 'solicitud_docente';

/**
 * Registro de cada cambio de rol: a quién, de qué rol a cuál, quién lo hizo y cuándo. Solo se agrega, nunca se edita.
 * Existe porque una cuenta de docente apareció como estudiante sin que se supiera quién la cambió (01/10/2026).
 */
@Entity('cambios_de_rol')
@Index('IDX_cambios_de_rol_user_fecha', ['userId', 'createdAt'])
export class CambioDeRol {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'varchar', length: 20 })
  rolAnterior!: UserRole;

  @Column({ type: 'varchar', length: 20 })
  rolNuevo!: UserRole;

  /** El admin que hizo el cambio (null si no se sabe). */
  @Column({ type: 'int', nullable: true })
  cambiadoPorId!: number | null;

  @Column({ type: 'varchar', length: 20 })
  origen!: OrigenCambioDeRol;

  @CreateDateColumn()
  createdAt!: Date;
}
