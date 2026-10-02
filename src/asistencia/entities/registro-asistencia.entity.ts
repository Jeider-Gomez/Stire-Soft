import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import type { EstadoAsistencia } from '../asistencia-reglas';

/**
 * Cómo quedó un estudiante en una sesión. Sin registro = sin marcar (ausente cuando la sesión se cierra).
 * `dispositivo` solo existe si marcó con QR: sirve para avisar cuando un mismo celular marca a dos cuentas.
 */
@Entity('registros_asistencia')
@Unique('UQ_registros_asistencia_sesion_usuario', ['sesionId', 'userId'])
@Index('IDX_registros_asistencia_usuario', ['userId'])
export class RegistroAsistencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sesionId!: number;

  @Column()
  userId!: number;

  @Column({ type: 'varchar', length: 10 })
  estado!: EstadoAsistencia;

  @Column({ type: 'varchar', length: 10 })
  metodo!: 'qr' | 'manual';

  @Column({ type: 'varchar', length: 32, nullable: true })
  dispositivo!: string | null;

  @Column()
  marcadoPorId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
