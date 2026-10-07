import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Class } from '../../class/entities/class.entity';
import type { TipoAviso } from '../aviso-reglas';

/** Un aviso del docente a toda su clase (aviso-reglas.ts). */
@Entity('avisos_clase')
@Index(['classId', 'createdAt'])
export class AvisoClase {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  clase?: Class;

  @Column({ type: 'int' })
  classId!: number;

  @Column({ type: 'int' })
  autorId!: number;

  @Column({ type: 'varchar', length: 12, default: 'aviso' })
  tipo!: TipoAviso;

  @Column({ type: 'varchar', length: 120 })
  titulo!: string;

  @Column({ type: 'text' })
  cuerpo!: string;

  @Column({ type: 'datetime', nullable: true })
  fechaEvento!: Date | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  lugar!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
