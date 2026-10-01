import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

const decimal = { to: (v: number | null) => v, from: (v: string | null) => (v === null ? null : Number(v)) };

/** Cada cambio de una nota puesta por el docente: antes → después, quién, cuándo y por qué. No se borra. */
@Entity('notas_historial')
@Index(['classId', 'studentId'])
export class NotaHistorial {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  classId!: number;

  @Column({ type: 'int' })
  studentId!: number;

  /** Clave del componente o «final». */
  @Column({ type: 'varchar', length: 30 })
  clave!: string;

  /** Nombre del componente cuando se hizo el cambio (el esquema puede cambiar después). */
  @Column({ type: 'varchar', length: 60 })
  nombre!: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true, transformer: decimal })
  antes!: number | null;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true, transformer: decimal })
  despues!: number | null;

  @Column({ type: 'text', nullable: true })
  motivo!: string | null;

  @Column({ type: 'int' })
  actorId!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
