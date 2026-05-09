import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubmissionsRepository } from './submissions.repository';
import { SubmissionAnswersRepository } from '../submission-answers/submission-answers.repository';
import { ActivitiesRepository } from '../activities/activities.repository';
import { ActivityQuestionsRepository } from '../activity-questions/activity-questions.repository';
import { EvaluationEngineService } from '../evaluation-engine/evaluation-engine.service';
import { StartSubmissionDto } from './dto/start-submission.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { Submission } from './entities/submission.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { SubmissionGradedEvent } from '../common/events/submission-graded.event';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly submissionsRepo: SubmissionsRepository,
    private readonly answersRepo: SubmissionAnswersRepository,
    private readonly activitiesRepo: ActivitiesRepository,
    private readonly questionsRepo: ActivityQuestionsRepository,
    private readonly evalEngine: EvaluationEngineService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async startSubmission(dto: StartSubmissionDto, studentId: number): Promise<Submission> {
    const activity = await this.activitiesRepo.findOne({ where: { id: dto.activityId } });
    if (!activity) throw new NotFoundException('Actividad no encontrada');

    // Verificar si ya hay uno en progreso
    const active = await this.submissionsRepo.findActiveSubmission(studentId, activity.id);
    if (active) return active;

    // Verificar límites de intentos
    const attempts = await this.submissionsRepo.getAttemptCount(studentId, activity.id);
    if (attempts >= activity.attemptsAllowed) {
      throw new BadRequestException(`Límite de intentos alcanzado (${activity.attemptsAllowed})`);
    }

    const submission = this.submissionsRepo.create({
      activityId: activity.id,
      studentId,
      attemptNumber: attempts + 1,
      status: SubmissionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    return this.submissionsRepo.save(submission);
  }

  async submitAnswers(submissionId: string, dto: SubmitAnswersDto, studentId: number) {
    const submission = await this.submissionsRepo.findOne({
      where: { id: submissionId, studentId },
      relations: ['activity'],
    });

    if (!submission) throw new NotFoundException('Intento no encontrado');
    if (submission.status !== SubmissionStatus.IN_PROGRESS) {
      throw new BadRequestException('El intento ya fue procesado o ha expirado');
    }

    const questions = await this.questionsRepo.findByActivityId(submission.activityId);
    let totalScore = 0;
    
    // Iniciar Transacción SQL para asegurar consistencia
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const answerEntities: any[] = [];

      // Auto-grading loop
      for (const answerDto of dto.answers) {
        const question = questions.find(q => q.id === answerDto.questionId);
        if (!question) continue;

        const evalResult = this.evalEngine.evaluateAnswer(question.type, answerDto.answer, question.config, question.points);

        const answerEntity = this.answersRepo.create({
          submissionId: submission.id,
          questionId: question.id,
          answer: answerDto.answer,
          isCorrect: evalResult.needsAsyncJudge ? null : evalResult.isCorrect,
          score: evalResult.score,
          feedback: evalResult.feedback,
        });

        totalScore += evalResult.score;
        answerEntities.push(answerEntity);
      }

      await queryRunner.manager.save(answerEntities);

      // Finalize submission
      submission.score = totalScore;
      submission.status = SubmissionStatus.GRADED;
      submission.submittedAt = new Date();
      if (dto.timeSpentSeconds) submission.timeSpentSeconds = dto.timeSpentSeconds;
      
      await queryRunner.manager.save(submission);

      await queryRunner.commitTransaction();

      // Emitir evento fuera de la transacción (side-effects desacoplados)
      this.eventEmitter.emit(
        'submission.graded',
        new SubmissionGradedEvent(
          submission.id,
          submission.studentId,
          submission.activityId,
          submission.activity.learningUnitId,
          submission.score,
          submission.activity.passingScore,
        )
      );

      return {
        submissionId: submission.id,
        totalScore,
        status: submission.status,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Fallo crítico al procesar la evaluación de la entrega.');
    } finally {
      await queryRunner.release();
    }
  }

  async autosave(submissionId: string, dto: SubmitAnswersDto, studentId: number) {
    const submission = await this.submissionsRepo.findOne({ where: { id: submissionId, studentId } });
    if (!submission || submission.status !== SubmissionStatus.IN_PROGRESS) {
      throw new BadRequestException('Intento inválido para autosave');
    }

    submission.autosaveData = dto.answers;
    submission.lastSavedAt = new Date();
    if (dto.timeSpentSeconds) submission.timeSpentSeconds += dto.timeSpentSeconds;

    return this.submissionsRepo.save(submission);
  }
}
