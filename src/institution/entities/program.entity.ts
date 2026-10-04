import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Institution } from './institution.entity';
import { UserAffiliation } from '../../user/entities/user-affiliation.entity';

/** Carrera (por semestres) o nivel escolar (por grados): el mismo modelo sirve a una universidad y a un colegio. */
export const TIPOS_PROGRAMA = ['carrera', 'grado'] as const;
export type TipoPrograma = (typeof TIPOS_PROGRAMA)[number];

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  /** Cuántos semestres o grados tiene. */
  @Column({ type: 'int' })
  maxSemesters!: number;

  @Column({ type: 'varchar', length: 20, default: 'carrera' })
  tipo!: TipoPrograma;

  /** Facultad o dependencia, si la institución las tiene (un colegio no). */
  @Column({ type: 'varchar', length: 150, nullable: true })
  facultad!: string | null;

  @ManyToOne(() => Institution, (institution) => institution.programs)
  @JoinColumn({ name: 'institutionId' })
  institution!: Institution;

  @Column()
  institutionId!: number;

  @OneToMany(() => UserAffiliation, (affiliation) => affiliation.program)
  affiliations!: UserAffiliation[];
}
