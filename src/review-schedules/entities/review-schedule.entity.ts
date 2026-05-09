import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';

@Entity('review_schedules')
@Index(['studentId', 'learningUnitId'], { unique: true })
export class ReviewSchedule extends StireBaseEntity {
  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ nullable: false })
  studentId: number;

  @ManyToOne(() => LearningUnit, { eager: false, nullable: false })
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

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt: Date;
}
