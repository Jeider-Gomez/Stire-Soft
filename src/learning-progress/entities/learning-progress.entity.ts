import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { LearningStatus } from '../../common/enums/learning-status.enum';

@Entity('learning_progress')
@Index(['studentId', 'learningUnitId'], { unique: true })
export class LearningProgress extends StireBaseEntity {
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

  @Column({ type: 'float', default: 0 })
  mastery: number;

  @Column({
    type: 'enum',
    enum: LearningStatus,
    default: LearningStatus.NO_VISTO,
  })
  status: LearningStatus;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'float', default: 0 })
  successRate: number;

  @Column({ type: 'int', default: 0 })
  attemptsCount: number;

  @Column({ type: 'int', default: 0 })
  completedActivities: number;

  @ManyToOne(() => Activity, { eager: false, nullable: true })
  @JoinColumn({ name: 'lastActivityId' })
  lastActivity: Activity;

  @Column({ nullable: true })
  lastActivityId: number;
}
