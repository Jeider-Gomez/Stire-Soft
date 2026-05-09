import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionAnswer } from './entities/submission-answer.entity';
import { SubmissionAnswersRepository } from './submission-answers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionAnswer])],
  providers: [SubmissionAnswersRepository],
  exports: [SubmissionAnswersRepository],
})
export class SubmissionAnswersModule {}
