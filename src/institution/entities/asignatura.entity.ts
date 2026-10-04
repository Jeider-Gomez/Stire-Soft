import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Institution } from './institution.entity';
import { Program } from './program.entity';

/**
 * Una asignatura o curso (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): lo que una clase enseña. Tres formas, todas válidas:
 * - de un programa: «Fundamentos de Algoritmia», Licenciatura en Informática, 3.er semestre;
 * - de una institución, sin programa: una electiva libre de la universidad o un curso de extensión;
 * - libre, sin institución: un curso que un docente dicta por su cuenta.
 * La crea cualquier docente desde «Nueva clase»; el admin solo une duplicados.
 */
@Entity('asignaturas')
@Index(['nombre'])
export class Asignatura {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  /** Código del plan de estudios (p. ej. 203413), si lo tiene. */
  @Column({ type: 'varchar', length: 30, nullable: true })
  codigo!: string | null;

  /** Semestre o grado del plan en que va (3 = 3.er semestre o grado 3.°), si va en uno. */
  @Column({ type: 'int', nullable: true })
  periodoPlan!: number | null;

  @ManyToOne(() => Program, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'programId' })
  program!: Program | null;

  @Column({ type: 'int', nullable: true })
  programId!: number | null;

  @ManyToOne(() => Institution, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'institutionId' })
  institution!: Institution | null;

  @Column({ type: 'int', nullable: true })
  institutionId!: number | null;

  @Column({ type: 'int', nullable: true })
  creadaPorId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
