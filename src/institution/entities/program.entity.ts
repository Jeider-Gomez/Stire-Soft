import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Institution } from './institution.entity';
import { UserAffiliation } from '../../user/entities/user-affiliation.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'int' })
  maxSemesters!: number;

  @ManyToOne(() => Institution, (institution) => institution.programs)
  @JoinColumn({ name: 'institutionId' })
  institution!: Institution;

  @Column()
  institutionId!: number;

  @OneToMany(() => UserAffiliation, (affiliation) => affiliation.program)
  affiliations!: UserAffiliation[];
}
