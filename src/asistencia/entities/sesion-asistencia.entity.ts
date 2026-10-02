import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Un día (o bloque) de clase en el que el docente toma asistencia. Abierta: se puede seguir marcando con QR. */
@Entity('sesiones_asistencia')
@Index('IDX_sesiones_asistencia_clase_fecha', ['classId', 'fecha'])
export class SesionAsistencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  classId!: number;

  /** AAAA-MM-DD (hora de Colombia). */
  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  tema!: string | null;

  @Column({ default: true })
  abierta!: boolean;

  @Column()
  creadaPorId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
