import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** «¿Algo no está bien?»: un reporte de una publicación (o de uno de sus mensajes) para el docente de la clase. */
@Entity('laboratorio_reportes')
@Index(['publicacionId', 'userId'], { unique: true })
export class LaboratorioReporte {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  publicacionId!: number;

  @Column({ type: 'int', nullable: true })
  comentarioId!: number | null;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', length: 300, default: '' })
  motivo!: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
