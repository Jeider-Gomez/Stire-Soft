import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';

@Entity('review_schedules')
@Index(['studentId', 'learningUnitId'], { unique: true })
export class ReviewSchedule extends StireBaseEntity {
  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ nullable: false })
  studentId: number;

  @ManyToOne(() => LearningUnit, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learningUnitId' })
  learningUnit: LearningUnit;

  @Column({ nullable: false })
  learningUnitId: number;

  @Column({ type: 'timestamp', nullable: false })
  nextReviewDate: Date;

  @Column({ type: 'int', default: 0 })
  urgencyLevel: number; // 0=none, 1=low, 2=medium, 3=high (overdue)

  @Column({ type: 'int', default: 1 })
  intervalDays: number;

  @Column({ type: 'int', default: 0 })
  repetitions: number;

  // FASE CC-09 Bloqueo 2: calculateNextReview() ya calculaba este valor
  // para derivar intervalDays, pero se descartaba al retornar — nunca se
  // guardaba. 2.5 es el punto de partida estándar SM-2 (repetitions 0-1,
  // donde el algoritmo actual todavía no calcula un ease factor propio).
  @Column({ type: 'float', default: 2.5 })
  easeFactor: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt: Date;
}
