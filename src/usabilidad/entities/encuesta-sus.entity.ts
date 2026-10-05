import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Una respuesta a la encuesta SUS (src/usabilidad/sus.ts). Se guarda quién respondió solo para no invitarle de nuevo
 * antes de tiempo; el admin ve los resultados sin nombres.
 */
@Entity('encuestas_sus')
@Index('IDX_encuesta_sus_usuario', ['userId'])
export class EncuestaSus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'varchar', length: 20 })
  rol!: string;

  @Column({ type: 'json' })
  respuestas!: number[];

  @Column({ type: 'float' })
  puntaje!: number;

  /** «¿Qué cambiarías primero?» (opcional). Texto plano; la pantalla lo escapa al mostrarlo. */
  @Column({ type: 'varchar', length: 500, nullable: true })
  comentario!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
