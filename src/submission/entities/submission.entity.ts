import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id!: number;

  // Estudiante que envió el intento
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column()
  studentId!: number;

  // Evaluación a la que pertenece
  @ManyToOne(() => Evaluation, { eager: true })
  @JoinColumn({ name: 'evaluationId' })
  evaluation!: Evaluation;

  @Column()
  evaluationId!: number;

  // Puntaje obtenido en este intento
  @Column({ type: 'int', default: 0 })
  score!: number;

  // Respuestas del estudiante (JSON libre para flexibilidad)
  @Column({ type: 'text', nullable: true })
  answers!: string;

  @CreateDateColumn()
  submittedAt!: Date;
}
