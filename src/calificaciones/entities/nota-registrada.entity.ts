import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const decimal = { to: (v: number | null) => v, from: (v: string | null) => (v === null ? null : Number(v)) };

/**
 * Una nota que puso el docente: la de un componente manual (un parcial) o el ajuste de la nota final (clave «final»,
 * con motivo). Cada cambio queda además en `notas_historial`.
 */
@Entity('notas_registradas')
@Index(['classId', 'studentId', 'clave'], { unique: true })
export class NotaRegistrada {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  classId!: number;

  @Column({ type: 'int' })
  studentId!: number;

  @Column({ type: 'varchar', length: 30 })
  clave!: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, transformer: decimal })
  nota!: number;

  @Column({ type: 'text', nullable: true })
  motivo!: string | null;

  @Column({ type: 'int' })
  updatedBy!: number;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
