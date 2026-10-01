import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { ArchivoProyecto, TipoProyecto } from '../proyecto-reglas';

/**
 * Copia congelada de un proyecto enviada a una clase (docs/DISENO_PROYECTOS.md §3). No guarda una referencia fuerte al
 * proyecto: si el estudiante sigue editando o lo borra, la copia que recibió el docente no cambia.
 */
@Entity('proyecto_envios')
@Index(['classId'])
@Index(['proyectoId', 'classId'])
export class ProyectoEnvio {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  proyectoId!: number;

  @Column({ type: 'int' })
  studentId!: number;

  @Column({ type: 'int' })
  classId!: number;

  /** 1, 2, … por proyecto y clase (hasta VERSIONES_POR_CLASE). */
  @Column({ type: 'int' })
  version!: number;

  @Column({ type: 'varchar', length: 100 })
  titulo!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: TipoProyecto;

  @Column({ type: 'json' })
  archivos!: ArchivoProyecto[];

  /** 0,0 a 5,0; null = sin nota. */
  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true, transformer: { to: (v: number | null) => v, from: (v: string | null) => (v === null ? null : Number(v)) } })
  nota!: number | null;

  @Column({ type: 'text', nullable: true })
  comentario!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  revisadoAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
