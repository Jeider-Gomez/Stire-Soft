import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Un mensaje para el autor de una publicación del Laboratorio. */
@Entity('laboratorio_comentarios')
@Index(['publicacionId'])
export class LaboratorioComentario {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  publicacionId!: number;

  @Column({ type: 'int' })
  autorId!: number;

  @Column({ type: 'varchar', length: 500 })
  texto!: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
