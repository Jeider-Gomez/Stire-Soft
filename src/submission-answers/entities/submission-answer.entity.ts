import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Submission } from '../../submissions/entities/submission.entity';
import { ActivityQuestion } from '../../activity-questions/entities/activity-question.entity';

@Entity('submission_answers')
export class SubmissionAnswer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Submission, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: Submission;

  @Column({ type: 'uuid', nullable: false })
  submissionId: string;

  @ManyToOne(() => ActivityQuestion, { eager: false, nullable: false })
  @JoinColumn({ name: 'questionId' })
  question: ActivityQuestion;

  @Column({ nullable: false })
  questionId: number;

  @Column({ type: 'json', nullable: false })
  answer: Record<string, any>; // Estructura depende del QuestionType

  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;
}
