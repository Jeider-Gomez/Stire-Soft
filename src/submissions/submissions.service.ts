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
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
    @InjectQueue('judge') private readonly judgeQueue: Queue,
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

      // Encolar trabajos asíncronos después de guardar las entidades para tener los IDs
      for (let i = 0; i < dto.answers.length; i++) {
        const answerDto = dto.answers[i];
        const question = questions.find(q => q.id === answerDto.questionId);
        if (!question) continue;

        const evalResult = this.evalEngine.evaluateAnswer(question.type, answerDto.answer, question.config, question.points);
        if (evalResult.needsAsyncJudge) {
          const savedAnswer = answerEntities.find(a => a.questionId === question.id);
          if (savedAnswer) {
            await this.judgeQueue.add(
              'evaluate-code',
              {
                submissionAnswerId: savedAnswer.id,
                code: answerDto.answer.code,
                language: question.config.language || 'javascript',
                testCases: question.config.testCases || [],
              },
              {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: true,
                removeOnFail: false,
              }
            );
          }
        }
      }

      // Finalize submission
      const hasAsync = answerEntities.some(a => a.isCorrect === null);
      submission.score = totalScore;
      submission.status = hasAsync ? SubmissionStatus.SUBMITTED : SubmissionStatus.GRADED;
      submission.submittedAt = new Date();
      if (dto.timeSpentSeconds) submission.timeSpentSeconds = dto.timeSpentSeconds;
      
      await queryRunner.manager.save(submission);

      await queryRunner.commitTransaction();

      // Emitir evento fuera de la transacción (side-effects desacoplados)
      if (!hasAsync) {
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
      }

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

  async updateAnswerScore(answerId: number, isCorrect: boolean, score: number, feedback?: string) {
    const answer = await this.answersRepo.findOne({ where: { id: answerId } });
    if (!answer) return null;

    answer.isCorrect = isCorrect;
    answer.score = score;
    if (feedback) answer.feedback = feedback;

    return this.answersRepo.save(answer);
  }

  async consolidateSubmission(submissionId: string) {
    const submission = await this.submissionsRepo.findOne({
      where: { id: submissionId },
      relations: ['activity'],
    });
    if (!submission) return;

    const answers = await this.answersRepo.find({ where: { submissionId } });
    const isPending = answers.some(a => a.isCorrect === null);

    if (isPending) return;

    const totalScore = answers.reduce((sum, a) => sum + a.score, 0);

    submission.score = totalScore;
    submission.status = SubmissionStatus.GRADED;
    
    await this.submissionsRepo.save(submission);

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
  }

  async markAsFailed(submissionAnswerId: number, errorMessage: string) {
    const answer = await this.answersRepo.findOne({ where: { id: submissionAnswerId } });
    if (!answer) return;

    // 1. Calificar la respuesta como incorrecta para evitar deadlock de consolidación
    answer.isCorrect = false;
    answer.score = 0;
    answer.feedback = `Fallo crítico de evaluación en sandbox: ${errorMessage}`;
    await this.answersRepo.save(answer);

    // 2. Ejecutar la consolidación del intento para actualizar el score total y emitir el evento correspondiente
    await this.consolidateSubmission(answer.submissionId);
  }
}
