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
import { Section } from '../../section/entities/section.entity';
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 0 })
  order!: number;

  @Column({ default: true })
  isActive!: boolean;

  // Un topic pertenece a una sección (jerarquía: Class → Section → Topic)
  @ManyToOne(() => Section, (section) => section.topics, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sectionId' })
  section!: Section;

  @Column({ nullable: false })
  sectionId!: number;

  // Un topic tiene muchas unidades de aprendizaje
  @OneToMany(() => LearningUnit, (unit) => unit.topic)
  learningUnits!: LearningUnit[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
