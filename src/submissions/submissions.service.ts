import { Inject, Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubmissionsRepository } from './submissions.repository';
import { SubmissionAnswersRepository } from '../submission-answers/submission-answers.repository';
import { ActivitiesRepository } from '../activities/activities.repository';
import { ActivityQuestionsRepository } from '../activity-questions/activity-questions.repository';
import { EvaluationEngineService } from '../evaluation-engine/evaluation-engine.service';
import { StartSubmissionDto } from './dto/start-submission.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { RunCodeDto } from './dto/run-code.dto';
import { Submission } from './entities/submission.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { QuestionType } from '../common/enums/question-type.enum';
import { SubmissionGradedEvent } from '../common/events/submission-graded.event';
import { JUDGE_QUEUE } from '../judge-engine/judge-queue.interface';
import type { JudgeQueue } from '../judge-engine/judge-queue.interface';
import { JudgeExecutionService } from '../judge-engine/judge-execution.service';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { Activity } from '../activities/entities/activity.entity';

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
    // Puerto, no BullMQ directo (ADR 08): antes @InjectQueue('judge')
    // acoplaba este servicio a Redis incluso para poder arrancar.
    @Inject(JUDGE_QUEUE) private readonly judgeQueue: JudgeQueue,
    private readonly contentRenderingService: ContentRenderingService,
    private readonly judgeExecutionService: JudgeExecutionService,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async startSubmission(dto: StartSubmissionDto, studentId: number): Promise<Submission> {
    const activity = await this.activitiesRepo.findOne({
      where: { id: dto.activityId },
      relations: ['learningUnit', 'learningUnit.topic', 'learningUnit.topic.section'],
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');

    await this.assertActiveEnrollment(activity, studentId);

    // Verificar si ya hay uno en progreso
    const active = await this.submissionsRepo.findActiveSubmission(studentId, activity.id);
    if (active) return active;

    // Verificar límites de intentos
    // attemptsAllowed = 0 → intentos infinitos; > 0 → límite estricto
    const attempts = await this.submissionsRepo.getAttemptCount(studentId, activity.id);
    if (activity.attemptsAllowed > 0 && attempts >= activity.attemptsAllowed) {
      throw new BadRequestException(`Límite de intentos alcanzado (${activity.attemptsAllowed})`);
    }

    const submission = this.submissionsRepo.create({
      activityId: activity.id,
      studentId,
      attemptNumber: attempts + 1,
      status: SubmissionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    try {
      return await this.submissionsRepo.save(submission);
    } catch (error: unknown) {
      // La restricción de BD cierra la carrera entre dos POST concurrentes.
      // Si otro request creó el intento primero, devolvemos ese mismo intento.
      if (this.isActiveAttemptDuplicate(error)) {
        const concurrentActive = await this.submissionsRepo.findActiveSubmission(studentId, activity.id);
        if (concurrentActive) return concurrentActive;
      }
      throw error;
    }
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

    // Recopilar los jobs asíncronos a encolar DESPUÉS de comprometer la transacción
    const asyncJobs: Array<{
      savedAnswer: any;
      answerDto: any;
      question: any;
    }> = [];

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
          // ADR 07, perfil PLAIN.
          feedback: evalResult.feedback
            ? this.contentRenderingService.escapePlainText(evalResult.feedback)
            : evalResult.feedback,
        });

        totalScore += evalResult.score;
        answerEntities.push(answerEntity);
      }

      await queryRunner.manager.save(answerEntities);

      // Identificar qué respuestas necesitan evaluación asíncrona (sin encolar aún)
      for (let i = 0; i < dto.answers.length; i++) {
        const answerDto = dto.answers[i];
        const question = questions.find(q => q.id === answerDto.questionId);
        if (!question) continue;

        const evalResult = this.evalEngine.evaluateAnswer(question.type, answerDto.answer, question.config, question.points);
        if (evalResult.needsAsyncJudge) {
          const savedAnswer = answerEntities.find(a => a.questionId === question.id);
          if (savedAnswer) {
            asyncJobs.push({ savedAnswer, answerDto, question });
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

      // ✅ COMMIT PRIMERO — la transacción DB siempre se compromete antes de tocar Redis
      await queryRunner.commitTransaction();

      // Emitir evento (solo si no hay evaluación asíncrona pendiente).
      // emitAsync (no emit): esperamos a que mastery/repasos/notificaciones
      // terminen de procesar el evento ANTES de responder al frontend, para
      // que el mastery ya esté actualizado cuando el estudiante lo consulte
      // justo después de recibir la calificación (ver workspace.ts).
      if (!hasAsync) await this.emitSubmissionGraded(submission);

      // Encolar jobs FUERA de la transacción, vía el puerto JudgeQueue.
      // En modo inline (default) no hay Redis que pueda fallar aquí; en modo
      // redis, si BullMQ no está disponible, el job no se encola pero la
      // submission permanece en estado SUBMITTED — el MaintenanceService
      // limpia el limbo.
      for (const job of asyncJobs) {
        try {
          await this.judgeQueue.enqueue({
            submissionAnswerId: job.savedAnswer.id,
            code: job.answerDto.answer.code,
            language: job.question.config.language || 'javascript',
            testCases: job.question.config.testCases || [],
          });
        } catch (queueError: any) {
          console.warn(
            `[SubmissionsService] No se pudo encolar job para respuesta ID ${job.savedAnswer.id}. ` +
            `${queueError.message}. La limpieza de mantenimiento actuará sobre el limbo.`
          );
        }
      }

      return {
        submissionId: submission.id,
        totalScore,
        maxScore: submission.activity.totalPoints,
        passed: !hasAsync
          ? (totalScore / submission.activity.totalPoints) * 100 >= submission.activity.passingScore
          : null,
        status: submission.status,
      };

    } catch (error: any) {
      console.error('[SubmissionsService] Error crítico en submitAnswers — haciendo rollback:', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Fallo crítico al procesar la evaluación de la entrega.');
    } finally {
      await queryRunner.release();
    }
  }

  // "Probar código" (EST-V03, Insumo 15 §7.1): ensayo libre contra los casos
  // PÚBLICOS de la pregunta CODING de la actividad, sin consumir intento.
  // A propósito NO crea submission, NO modifica attemptsCount/attemptNumber,
  // NO cambia el status de la submission, NO emite 'submission.graded' y NO
  // toca mastery — nada de esto pasa por submissionsRepo.save() ni por el
  // event emitter, a diferencia de submitAnswers().
  async runPublicCases(submissionId: string, dto: RunCodeDto, studentId: number) {
    const submission = await this.submissionsRepo.findOne({
      where: { id: submissionId, studentId },
    });
    if (!submission) throw new NotFoundException('Intento no encontrado');

    const activity = await this.activitiesRepo.findOne({
      where: { id: submission.activityId },
      relations: ['learningUnit', 'learningUnit.topic', 'learningUnit.topic.section'],
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');
    await this.assertActiveEnrollment(activity, studentId);

    const questions = await this.questionsRepo.findByActivityId(submission.activityId);
    const codingQuestion = questions.find((q) => q.type === QuestionType.CODING);
    if (!codingQuestion) {
      throw new BadRequestException('Esta actividad no tiene una pregunta de código para ensayar');
    }

    const config = codingQuestion.config || {};
    const testCases: Array<{ label?: string; input?: string; expected?: string; isPublic?: boolean }> =
      config.testCases || [];

    const results = await this.judgeExecutionService.runPublicCases(
      dto.code,
      config.language || 'javascript',
      testCases,
    );

    return {
      submissionId: submission.id,
      results,
      allPassed: results.length > 0 && results.every((r) => r.passed),
    };
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
    // ADR 07, perfil PLAIN: el feedback puede venir del Judge Engine (que
    // puede reflejar stdout/stderr del código del estudiante) — sin HTML.
    if (feedback) answer.feedback = this.contentRenderingService.escapePlainText(feedback);

    return this.answersRepo.save(answer);
  }

  // Consulta de estado (Insumo 15 §9.3): la calificación de preguntas CODING es
  // asíncrona (ver consolidateSubmission más abajo) -- la respuesta inmediata de
  // submitAnswers() no trae la nota final. El frontend usa este endpoint para
  // sondear el resultado real hasta que status pase a GRADED.
  async getSubmissionStatus(submissionId: string, studentId: number) {
    const submission = await this.submissionsRepo.findOne({
      where: { id: submissionId, studentId },
      relations: ['answers', 'activity'],
    });
    if (!submission) throw new NotFoundException('Intento no encontrado');

    return {
      submissionId: submission.id,
      status: submission.status,
      totalScore: submission.score,
      maxScore: submission.activity.totalPoints,
      passed:
        submission.status === SubmissionStatus.GRADED
          ? (submission.score / submission.activity.totalPoints) * 100 >= submission.activity.passingScore
          : null,
      passedCount: submission.answers.filter((a) => a.isCorrect === true).length,
      totalCount: submission.answers.length,
      feedback: submission.feedback,
    };
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

    // await emitAsync (ver nota en submitAnswers): quien consulte
    // GET /submissions/:id después de que este método retorne debe encontrar
    // el mastery ya recalculado, no una carrera contra el listener.
    await this.emitSubmissionGraded(submission);
  }

  async markAsFailed(submissionAnswerId: number, errorMessage: string) {
    const answer = await this.answersRepo.findOne({ where: { id: submissionAnswerId } });
    if (!answer) return;

    // 1. Calificar la respuesta como incorrecta para evitar deadlock de consolidación
    answer.isCorrect = false;
    answer.score = 0;
    // ADR 07, perfil PLAIN: errorMessage sale del sandbox saneado, pero
    // puede seguir conteniendo texto no confiable — nunca se le da por
    // sentado que es seguro solo porque no viene directamente del usuario.
    answer.feedback = this.contentRenderingService.escapePlainText(
      `Fallo crítico de evaluación en sandbox: ${errorMessage}`,
    );
    await this.answersRepo.save(answer);

    // 2. Ejecutar la consolidación del intento para actualizar el score total y emitir el evento correspondiente
    await this.consolidateSubmission(answer.submissionId);
  }

  private isActiveAttemptDuplicate(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const databaseError = error as { code?: string; sqlState?: string };
    return databaseError.code === 'ER_DUP_ENTRY' || databaseError.sqlState === '23000';
  }

  private async assertActiveEnrollment(activity: Activity, studentId: number): Promise<void> {
    const classId = activity.learningUnit?.topic?.section?.classId;
    if (!classId) throw new ForbiddenException('No se pudo verificar la matrícula de esta actividad');
    const enrollment = await this.enrollmentRepo.findOne({
      where: { classId, studentId, status: EnrollmentStatus.ACTIVE },
    });
    if (!enrollment) throw new ForbiddenException('No estás matriculado en esta clase');
  }

  private async emitSubmissionGraded(submission: Submission): Promise<void> {
    try {
      await this.eventEmitter.emitAsync(
        'submission.graded',
        new SubmissionGradedEvent(
          submission.id,
          submission.studentId,
          submission.activityId,
          submission.activity.learningUnitId,
          submission.score,
          submission.activity.passingScore,
          submission.activity.totalPoints,
        ),
      );
    } catch (error: unknown) {
      // Mitigación ligera: la calificación ya fue persistida. Un outbox con
      // reintentos sería el siguiente paso si estos fallos son frecuentes.
      console.error(
        `[SubmissionsService] No se pudo emitir submission.graded (submissionId=${submission.id}, studentId=${submission.studentId}, activityId=${submission.activityId}):`,
        error,
      );
    }
  }
}
