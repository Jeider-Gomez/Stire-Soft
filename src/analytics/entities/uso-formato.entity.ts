import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Cuántas veces eligió el estudiante cada formato de una lección (diagrama, pseudocódigo, paso a paso, escuchar, video,
 * ejemplo en vivo). Alimenta la parte Visual/Verbal del perfil de aprendizaje (perfil-aprendizaje.ts, MOD-02).
 */
@Entity('uso_formatos')
@Index('IDX_uso_formatos_estudiante_formato', ['studentId', 'formato'], { unique: true })
export class UsoFormato {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  studentId!: number;

  @Column({ type: 'varchar', length: 20 })
  formato!: string;

  @Column({ type: 'int', default: 0 })
  veces!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
