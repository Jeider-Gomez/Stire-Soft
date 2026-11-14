import { CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

/** Un «me gusta» de alguien a una publicación del Laboratorio (uno por persona). */
@Entity('laboratorio_me_gusta')
@Index(['userId'])
export class LaboratorioMeGusta {
  @PrimaryColumn({ type: 'int' })
  publicacionId!: number;

  @PrimaryColumn({ type: 'int' })
  userId!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
