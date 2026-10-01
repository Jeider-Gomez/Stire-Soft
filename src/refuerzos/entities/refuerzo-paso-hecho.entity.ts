import { CreateDateColumn, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Un paso de explicación o de recurso que el estudiante marcó «Ya lo vi». Los ejercicios y entregas se deducen solos. */
@Entity('refuerzo_pasos_hechos')
@Index(['refuerzoId', 'studentId', 'paso'], { unique: true })
export class RefuerzoPasoHecho {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  refuerzoId!: number;

  @Column({ type: 'int' })
  studentId!: number;

  /** Índice del paso (0, 1, …). */
  @Column({ type: 'int' })
  paso!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  hechoAt!: Date;
}
