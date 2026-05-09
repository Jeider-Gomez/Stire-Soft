import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { QuestionType } from '../../common/enums/question-type.enum';
import { QuestionConfig } from '../interfaces/question-configs.interface';

@Entity('activity_questions')
export class ActivityQuestion extends StireBaseEntity {
  @ManyToOne(() => Activity, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({ nullable: false })
  activityId: number;

  @Column({ type: 'enum', enum: QuestionType, nullable: false })
  type: QuestionType;

  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({ type: 'int', default: 10 })
  points: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'json', nullable: false })
  config: any;
}
