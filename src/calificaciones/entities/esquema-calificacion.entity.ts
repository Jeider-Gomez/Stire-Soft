import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Componente } from '../calificacion-reglas';

const decimal = { to: (v: number | null) => v, from: (v: string | null) => (v === null ? null : Number(v)) };

/** El esquema de calificación de una clase (docs/DISENO_INTERVENCION_DOCENTE.md §6). Opcional: uno por clase. */
@Entity('esquemas_calificacion')
@Index(['classId'], { unique: true })
export class EsquemaCalificacion {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  classId!: number;

  @Column({ type: 'json' })
  componentes!: Componente[];

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 3, transformer: decimal })
  notaAprobatoria!: number;

  /** Si cada estudiante ve su nota y su desglose en «Mi progreso». */
  @Column({ default: false })
  visibleParaEstudiantes!: boolean;

  @Column({ type: 'int' })
  updatedBy!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
