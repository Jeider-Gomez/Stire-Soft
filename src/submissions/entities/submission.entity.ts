import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { SubmissionStatus } from '../../common/enums/submission-status.enum';

@Entity('submissions')
@Index(['studentId', 'activityId'])
@Index(['studentId', 'status'])
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Activity, { eager: false, nullable: false })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({ nullable: false })
  activityId: number;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ nullable: false })
  studentId: number;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'int', default: 1 })
  attemptNumber: number;

  @Column({ type: 'enum', enum: SubmissionStatus, default: SubmissionStatus.IN_PROGRESS })
  status: SubmissionStatus;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'int', default: 0 })
  timeSpentSeconds: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSavedAt: Date;

  @Column({ type: 'json', nullable: true })
  autosaveData: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isAbandoned: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
