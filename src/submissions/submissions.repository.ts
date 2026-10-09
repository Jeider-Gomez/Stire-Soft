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

  /** Cuándo hizo cada intento de esta actividad (para reabrir uno a las 24 horas del último; motor-dominio.ts). */
  async fechasDeIntentos(studentId: number, activityId: number): Promise<Date[]> {
    const filas = await this.find({ where: { studentId, activityId }, select: { id: true, submittedAt: true, startedAt: true, createdAt: true } });
    return filas.map((f) => new Date(f.submittedAt ?? f.startedAt ?? f.createdAt ?? 0));
  }

  async findActiveSubmission(studentId: number, activityId: number): Promise<Submission | null> {
    return this.findOne({
      where: { studentId, activityId, status: SubmissionStatus.IN_PROGRESS },
    });
  }
}
