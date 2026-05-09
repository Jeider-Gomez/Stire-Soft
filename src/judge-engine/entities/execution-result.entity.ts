import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { SubmissionAnswer } from '../../submission-answers/entities/submission-answer.entity';

@Entity('execution_results')
export class ExecutionResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubmissionAnswer, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionAnswerId' })
  submissionAnswer: SubmissionAnswer;

  @Column({ nullable: false })
  submissionAnswerId: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  status: string; // 'accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'compile_error'

  @Column({ type: 'text', nullable: true })
  stdout: string;

  @Column({ type: 'text', nullable: true })
  stderr: string;

  @Column({ type: 'int', default: 0 })
  executionTimeMs: number;

  @Column({ type: 'int', default: 0 })
  memoryUsedKB: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  testCaseLabel: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
