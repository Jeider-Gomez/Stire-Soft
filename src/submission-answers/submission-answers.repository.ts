import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SubmissionAnswer } from './entities/submission-answer.entity';

@Injectable()
export class SubmissionAnswersRepository extends Repository<SubmissionAnswer> {
  constructor(private dataSource: DataSource) {
    super(SubmissionAnswer, dataSource.createEntityManager());
  }
}
