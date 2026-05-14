import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Program } from '../../institution/entities/program.entity';

@Entity('user_affiliations')
export class UserAffiliation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.affiliations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Program, (program) => program.affiliations)
  @JoinColumn({ name: 'programId' })
  program!: Program;

  @Column()
  programId!: number;

  @Column({ type: 'varchar' })
  roleType!: string;

  @Column({ type: 'int', nullable: true })
  currentSemester!: number;

  @Column({ default: true })
  isActive!: boolean;
}
