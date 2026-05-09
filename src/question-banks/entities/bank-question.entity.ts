import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { QuestionBank } from './question-bank.entity';
import { QuestionType } from '../../common/enums/question-type.enum';

@Entity('bank_questions')
export class BankQuestion extends StireBaseEntity {
  @ManyToOne(() => QuestionBank, (bank) => bank.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bankId' })
  bank: QuestionBank;

  @Column({ nullable: false })
  bankId: number;

  @Column({ type: 'enum', enum: QuestionType, nullable: false })
  type: QuestionType;

  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({ type: 'json', nullable: false })
  config: any;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];
}
