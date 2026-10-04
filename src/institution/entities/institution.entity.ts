import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Program } from './program.entity';

export const TIPOS_INSTITUCION = ['universidad', 'colegio', 'otra'] as const;
export type TipoInstitucion = (typeof TIPOS_INSTITUCION)[number];

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  /** Nombre corto para la barra superior («Unicórdoba»). */
  @Column({ type: 'varchar', length: 40, nullable: true })
  sigla!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'universidad' })
  tipo!: TipoInstitucion;

  @OneToMany(() => Program, (program) => program.institution)
  programs!: Program[];
}
