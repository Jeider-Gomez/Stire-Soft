import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionBank } from './entities/question-bank.entity';
import { BankQuestion } from './entities/bank-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionBank, BankQuestion])],
})
export class QuestionBanksModule {}
