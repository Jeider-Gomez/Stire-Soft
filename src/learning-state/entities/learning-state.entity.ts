import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';

export enum ProgressState {
  NO_VISTO = 'no_visto',
  EXPLORANDO = 'explorando',
  EN_PRACTICA = 'en_practica',
  CONSOLIDANDO = 'consolidando',
  DOMINADO = 'dominado',
}

@Entity('learning_states')
@Unique(['studentId', 'learningUnitId'])
export class LearningState {
  @PrimaryGeneratedColumn()
  id!: number;

  // Relación con el estudiante
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column()
  studentId!: number;

  // Relación con la unidad de aprendizaje
  @ManyToOne(() => LearningUnit, { eager: true })
  @JoinColumn({ name: 'learningUnitId' })
  learningUnit!: LearningUnit;

  @Column()
  learningUnitId!: number;

  // Estado del progreso
  @Column({
    type: 'enum',
    enum: ProgressState,
    default: ProgressState.NO_VISTO,
  })
  state!: ProgressState;

  // Nivel de dominio (0-100), calculado dinámicamente por submissions
  @Column({ type: 'int', default: 0 })
  mastery!: number;

  // Última vez que el estudiante practicó esta unidad
  @Column({ type: 'timestamp', nullable: true })
  lastPracticedAt!: Date | null;

  // Próxima fecha sugerida de repaso (repetición espaciada)
  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate!: Date | null;

  // Nivel de urgencia: 0 = sin urgencia, 1 = baja, 2 = media, 3 = alta
  @Column({ type: 'int', default: 0 })
  urgencyLevel!: number;

  // Tasa de éxito (0-100% evaluaciones aprobadas >= 70%)
  @Column({ type: 'int', default: 0 })
  successRate!: number;

  // Número de revisiones/intentos totales
  @Column({ type: 'int', default: 0 })
  totalAttempts!: number;

  @Column({ type: 'int', nullable: true })
  lastEvaluationId?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
