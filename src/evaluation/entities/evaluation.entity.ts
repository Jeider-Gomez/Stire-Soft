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
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';

export enum EvaluationType {
  QUIZ = 'quiz',
  CODIGO = 'codigo',
  EJERCICIO = 'ejercicio',
  PROYECTO = 'proyecto',
}

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: EvaluationType,
    default: EvaluationType.QUIZ,
  })
  type!: EvaluationType;

  // Puntaje máximo posible de esta evaluación
  @Column({ type: 'int', nullable: false })
  maxScore!: number;

  @Column({ default: true })
  isActive!: boolean;

  // Una evaluación pertenece a una unidad de aprendizaje
  @ManyToOne(() => LearningUnit, (unit) => unit.evaluations, { eager: true })
  @JoinColumn({ name: 'learningUnitId' })
  learningUnit!: LearningUnit;

  @Column()
  learningUnitId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
