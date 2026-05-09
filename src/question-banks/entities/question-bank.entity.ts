import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { BankQuestion } from './bank-question.entity';

@Entity('question_banks')
export class QuestionBank extends StireBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ nullable: false })
  authorId: number;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @OneToMany(() => BankQuestion, (question) => question.bank)
  questions: BankQuestion[];
}
