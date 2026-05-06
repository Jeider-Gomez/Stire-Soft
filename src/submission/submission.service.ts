import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { EvaluationService } from '../evaluation/evaluation.service';
import { LearningStateService } from '../learning-state/learning-state.service';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    private readonly evaluationService: EvaluationService,
    private readonly learningStateService: LearningStateService,
  ) {}

  /**
   * Enviar un intento (submission) — TRIGGER PRINCIPAL
   * 1. Valida evaluación
   * 2. Guarda submission
   * 3. Recalcula mastery automáticamente
   */
  async submit(studentId: number, createDto: CreateSubmissionDto): Promise<{
    submission: Submission;
    progress: { mastery: number; state: string };
  }> {
    // 1. Verificar que la evaluación existe y está activa
    const evaluation = await this.evaluationService.findOne(createDto.evaluationId);

    if (!evaluation.isActive) {
      throw new BadRequestException('Esta evaluación no está activa');
    }

    // 2. Validar que el score no exceda el máximo
    if (createDto.score > evaluation.maxScore) {
      throw new BadRequestException(
        `El score (${createDto.score}) no puede superar el máximo (${evaluation.maxScore})`,
      );
    }

    // 3. Guardar la submission
    const submission = this.submissionRepository.create({
      studentId,
      evaluationId: createDto.evaluationId,
      score: createDto.score,
      answers: createDto.answers || '',
    });
    const savedSubmission = await this.submissionRepository.save(submission) as Submission;

    // 4. Recalcular mastery de la unidad correspondiente
    const unitId = evaluation.learningUnitId;
    const updatedProgress = await this.learningStateService.recalculateMastery(studentId, unitId);

    return {
      submission: savedSubmission,
      progress: {
        mastery: updatedProgress.mastery,
        state: updatedProgress.state,
      },
    };
  }

  /**
   * Obtener mis submissions de una evaluación
   */
  async getMySubmissions(studentId: number, evaluationId: number): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: { studentId, evaluationId },
      order: { submittedAt: 'DESC' },
    });
  }

  /**
   * Obtener el mejor score por evaluación para un estudiante en una unidad
   */
  async getBestScoresByUnit(
    studentId: number,
    unitId: number,
  ): Promise<{ evaluationId: number; bestScore: number; maxScore: number; title: string }[]> {
    // Obtener evaluaciones activas de la unidad
    const evaluations = await this.evaluationService.findActiveByUnit(unitId);

    const results: { evaluationId: number; bestScore: number; maxScore: number; title: string }[] = [];
    for (const evaluation of evaluations) {
      // Obtener el mejor intento del estudiante para esta evaluación
      const bestSubmission = await this.submissionRepository
        .createQueryBuilder('submission')
        .where('submission.studentId = :studentId', { studentId })
        .andWhere('submission.evaluationId = :evaluationId', { evaluationId: evaluation.id })
        .orderBy('submission.score', 'DESC')
        .getOne();

      results.push({
        evaluationId: evaluation.id,
        title: evaluation.title,
        maxScore: evaluation.maxScore,
        bestScore: bestSubmission?.score || 0,
      });
    }

    return results;
  }

  /**
   * Obtener el mejor score del estudiante en una evaluación específica
   * Usado por LearningStateService para calcular mastery
   */
  async getBestScore(studentId: number, evaluationId: number): Promise<number> {
    const bestSubmission = await this.submissionRepository
      .createQueryBuilder('submission')
      .where('submission.studentId = :studentId', { studentId })
      .andWhere('submission.evaluationId = :evaluationId', { evaluationId })
      .orderBy('submission.score', 'DESC')
      .getOne();

    return bestSubmission?.score || 0;
  }

  /**
   * Contar total de submissions del estudiante en una unidad
   */
  async countByUnit(studentId: number, unitId: number): Promise<number> {
    const evaluations = await this.evaluationService.findActiveByUnit(unitId);
    if (evaluations.length === 0) return 0;

    const evaluationIds = evaluations.map(e => e.id);
    
    return await this.submissionRepository
      .createQueryBuilder('submission')
      .where('submission.studentId = :studentId', { studentId })
      .andWhere('submission.evaluationId IN (:...evaluationIds)', { evaluationIds })
      .getCount();
  }
}
