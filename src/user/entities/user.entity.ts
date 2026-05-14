import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  OneToOne
} from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { UserAffiliation } from './user-affiliation.entity';

export enum UserRole {
  ADMIN = 'admin',
  DOCENTE = 'docente',
  ESTUDIANTE = 'estudiante',
}

@Entity('users')
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false, select: false })
  password!: string;

  @Column({ nullable: false })
  fullName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ESTUDIANTE,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => UserAffiliation, (affiliation) => affiliation.user)
  affiliations!: UserAffiliation[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments!: Enrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
