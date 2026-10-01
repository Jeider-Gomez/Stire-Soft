import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Section } from '../../section/entities/section.entity';

@Entity('classes')
@Index(['teacherId'])
export class Class {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ unique: true, nullable: false })
  code!: string;

  // Relación ManyToOne: Un docente puede tener muchas clases
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  @Column()
  teacherId!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  requiresApproval!: boolean;

  /**
   * El docente comparte el CONTENIDO de esta clase como plantilla: otros docentes pueden copiarlo a sus propias clases
   * (docs/DISENO_CLASES_Y_DOCENTES.md). Se copia, nunca se enlaza; los estudiantes, entregas y notas no se comparten.
   */
  @Column({ default: false })
  compartidaComoPlantilla!: boolean;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'int', nullable: true })
  maxStudents?: number;

  // Relación OneToMany: Una clase tiene muchas inscripciones (Enrollment)
  @OneToMany(() => Enrollment, (enrollment) => enrollment.class, { eager: false })
  enrollments!: Enrollment[];

  // Relación OneToMany: Una clase tiene muchas secciones/módulos
  @OneToMany(() => Section, (section) => section.class, { eager: false })
  sections!: Section[];

  // Propiedad virtual para mantener compatibilidad con el frontend
  students?: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
