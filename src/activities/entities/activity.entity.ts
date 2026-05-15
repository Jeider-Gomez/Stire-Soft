import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';
import { ActivityType } from '../../activity-types/entities/activity-type.entity';
import { Difficulty } from '../../common/enums/difficulty.enum';
import { PublicationStatus } from '../../common/enums/status.enum';

@Entity('activities')
@Index(['learningUnitId', 'status'])
export class Activity extends StireBaseEntity {
  @ManyToOne(() => LearningUnit, { eager: false, nullable: false })
  @JoinColumn({ name: 'learningUnitId' })
  learningUnit: LearningUnit;

  @Column({ nullable: false })
  learningUnitId: number;

  @ManyToOne(() => ActivityType, { eager: true, nullable: false })
  @JoinColumn({ name: 'activityTypeId' })
  activityType: ActivityType;

  @Column({ nullable: false })
  activityTypeId: number;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ nullable: false })
  createdBy: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: Difficulty, default: Difficulty.BASICO })
  difficulty: Difficulty;

  @Column({ type: 'int', default: 100 })
  totalPoints: number;

  @Column({ type: 'int', default: 60 })
  passingScore: number;

  @Column({ type: 'int', default: 3 })
  attemptsAllowed: number;

  @Column({ type: 'int', nullable: true })
  timeLimit: number; // en minutos

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'enum', enum: PublicationStatus, default: PublicationStatus.DRAFT })
  status: PublicationStatus;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ type: 'float', default: 1.0 })
  adaptiveWeight: number;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;
}
