import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActivityLog, ActivityLogAction } from './entities/activity-log.entity';

export interface LogEventDto {
  studentId: number;
  action: ActivityLogAction;
  referenceId: string | number;
  referenceType: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityLogService {
  private readonly repo: Repository<ActivityLog>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(ActivityLog);
  }

  /**
   * Registra un evento pedagógico.
   * Fire-and-forget: no lanza excepción si falla para no interrumpir el flujo principal.
   */
  async log(event: LogEventDto): Promise<void> {
    try {
      const entry = this.repo.create({
        studentId: event.studentId,
        action: event.action,
        referenceId: String(event.referenceId),
        referenceType: event.referenceType,
        metadata: event.metadata,
      });
      await this.repo.save(entry);
    } catch (err) {
      // Log silencioso: nunca debe interrumpir el flujo principal del estudiante
      console.warn('[ActivityLog] Error guardando log:', err?.message);
    }
  }

  /** Obtener historial de un estudiante (para el Tutor IA) */
  async getStudentHistory(studentId: number, limit = 50): Promise<ActivityLog[]> {
    return this.repo.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /** Obtener logs de un recurso específico */
  async getByReference(referenceId: string, referenceType: string): Promise<ActivityLog[]> {
    return this.repo.find({
      where: { referenceId, referenceType },
      order: { createdAt: 'DESC' },
    });
  }
}
