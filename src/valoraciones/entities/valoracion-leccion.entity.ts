import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * «¿Te sirvió esta explicación?» (UI-04 de la lista de chequeo de Sistemas Tutores, Caro 2015: curaduría de recursos
 * con la valoración del estudiante). Un voto por estudiante y lección; puede cambiarlo. El docente ve el resultado por
 * lección, sin nombres, y así el curso se mejora con el uso.
 */
@Entity('valoraciones_leccion')
@Index('IDX_valoracion_estudiante_leccion', ['studentId', 'learningUnitId'], { unique: true })
export class ValoracionLeccion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  studentId!: number;

  @Column()
  learningUnitId!: number;

  @Column()
  util!: boolean;

  /** Qué no quedó claro (opcional, solo con «No»). Texto plano; la pantalla lo escapa al mostrarlo. */
  @Column({ type: 'varchar', length: 300, nullable: true })
  comentario!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
