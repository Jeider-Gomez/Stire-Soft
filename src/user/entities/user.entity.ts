import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn,
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

  /** Foto de perfil opcional: una imagen de media_files (se ve en /media/<fotoId>). */
  @Column({ type: 'varchar', length: 36, nullable: true })
  fotoId?: string | null;

  // Último cambio de contraseña por recuperación o por un admin: los JWT emitidos
  // antes de este momento se rechazan (JwtStrategy).
  @Column({ type: 'timestamp', nullable: true })
  passwordChangedAt?: Date | null;

  @OneToMany(() => UserAffiliation, (affiliation) => affiliation.user)
  affiliations!: UserAffiliation[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments!: Enrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
