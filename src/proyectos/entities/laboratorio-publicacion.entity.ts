import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { ArchivoProyecto, TipoProyecto } from '../proyecto-reglas';
import type { AlcanceLaboratorio } from '../laboratorio-reglas';

/** Un proyecto mostrado en el Laboratorio (laboratorio-reglas.ts): una copia de sus archivos al publicarlo. */
@Entity('laboratorio_publicaciones')
@Index(['classId'])
@Index(['alcance'])
export class LaboratorioPublicacion {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  /** El proyecto del que salió; volver a publicarlo actualiza esta misma publicación. */
  @Index({ unique: true })
  @Column({ type: 'int' })
  proyectoId!: number;

  @Column({ type: 'int' })
  autorId!: number;

  /** La clase desde la que se publicó: su docente la modera. */
  @Column({ type: 'int' })
  classId!: number;

  @Column({ type: 'varchar', length: 20 })
  alcance!: AlcanceLaboratorio;

  @Column({ type: 'varchar', length: 100 })
  titulo!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: TipoProyecto;

  @Column({ type: 'varchar', length: 300, default: '' })
  descripcion!: string;

  @Column({ type: 'json' })
  archivos!: ArchivoProyecto[];

  /** Oculta por el docente o por varios reportes: solo la ven su autor, el docente y un administrador. */
  @Column({ type: 'boolean', default: false })
  oculta!: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
