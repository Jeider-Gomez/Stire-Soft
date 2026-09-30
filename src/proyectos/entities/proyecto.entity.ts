import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { ArchivoProyecto, TipoProyecto } from '../proyecto-reglas';

/** Un proyecto propio del estudiante (docs/DISENO_PROYECTOS.md). Solo su dueño lo ve, lo edita y lo borra. */
@Entity('proyectos')
@Index(['ownerId'])
export class Proyecto {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  ownerId!: number;

  @Column({ type: 'varchar', length: 100 })
  titulo!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: TipoProyecto;

  /** Los archivos de texto del proyecto (hasta 10 y 200 KB, validados en proyecto-reglas.ts). */
  @Column({ type: 'json' })
  archivos!: ArchivoProyecto[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
