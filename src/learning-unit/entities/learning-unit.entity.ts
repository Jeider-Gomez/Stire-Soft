import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';

import { Difficulty } from '../../common/enums/difficulty.enum';

@Entity('learning_units')
export class LearningUnit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.BASICO,
  })
  difficulty!: Difficulty;

  @Column({ default: 0 })
  order!: number;

  @Column({ default: true })
  isActive!: boolean;

  // Relación con Topic (nullable para compatibilidad con unidades existentes)
  @ManyToOne(() => Topic, (topic) => topic.learningUnits, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'topicId' })
  topic!: Topic | null;

  @Column({ nullable: true })
  topicId!: number | null;

  // Una unidad tiene muchas evaluaciones
  @OneToMany(() => Evaluation, (evaluation) => evaluation.learningUnit)
  evaluations!: Evaluation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
