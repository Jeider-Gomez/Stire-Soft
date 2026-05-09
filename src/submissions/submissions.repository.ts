import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';

@Injectable()
export class SubmissionsRepository extends Repository<Submission> {
  constructor(private dataSource: DataSource) {
    super(Submission, dataSource.createEntityManager());
  }

  async getAttemptCount(studentId: number, activityId: number): Promise<number> {
    return this.count({
      where: { studentId, activityId },
    });
  }

  async findActiveSubmission(studentId: number, activityId: number): Promise<Submission | null> {
    return this.findOne({
      where: { studentId, activityId, status: SubmissionStatus.IN_PROGRESS },
    });
  }
}
