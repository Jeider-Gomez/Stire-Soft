import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { LearningStatusChangedEvent } from '../../common/events/learning-status-changed.event';
import { NotificationsService } from '../notifications.service';
import { LearningStatus } from '../../common/enums/learning-status.enum';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { avisoDeHito, hitoCruzado } from '../notificacion-reglas';

/**
 * Avance por módulo (notificacion-reglas.ts): cuando una lección pasa a «dominada», se cuenta cuántas del módulo lleva el
 * estudiante y se avisa solo si cruzó el 50 %, el 75 % o el 100 %, una vez por hito. Antes había un aviso por cada cambio
 * de estado de cada lección («¡En marcha!», «¡Gran avance!»…), que saturaba y repetía lo que ya se veía en pantalla.
 */
@Injectable()
export class LearningStatusChangedListener {
  private readonly logger = new Logger(LearningStatusChangedListener.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('learning.status.changed')
  async handleLearningStatusChangedEvent(event: LearningStatusChangedEvent) {
    if (event.newStatus !== LearningStatus.DOMINADO || event.oldStatus === LearningStatus.DOMINADO) return;
    try {
      const modulo: Array<{ id: number; title: string }> = await this.dataSource.query(
        'SELECT s.id AS id, s.title AS title FROM learning_units lu JOIN topics t ON lu.topicId = t.id JOIN sections s ON t.sectionId = s.id WHERE lu.id = ?',
        [event.learningUnitId],
      );
      if (!modulo[0]) return;
      const sectionId = Number(modulo[0].id);
      const filas: Array<{ total: number | string; dominadas: number | string }> = await this.dataSource.query(
        'SELECT COUNT(*) AS total, SUM(CASE WHEN lp.status = ? THEN 1 ELSE 0 END) AS dominadas FROM learning_units lu ' +
          'JOIN topics t ON lu.topicId = t.id LEFT JOIN learning_progress lp ON lp.learningUnitId = lu.id AND lp.studentId = ? ' +
          'WHERE t.sectionId = ? AND lu.isActive = 1 AND t.isActive = 1',
        [LearningStatus.DOMINADO, event.studentId, sectionId],
      );
      const total = Number(filas[0]?.total ?? 0);
      const dominadas = Number(filas[0]?.dominadas ?? 0);
      const hito = hitoCruzado(dominadas - 1, dominadas, total);
      if (hito === null) return;
      const { titulo, mensaje } = avisoDeHito(hito, modulo[0].title, dominadas, total);
      await this.notificationsService.createNotification(event.studentId, titulo, mensaje, NotificationType.INFO, {
        enlace: '/estudiante/progreso',
        clave: `modulo:${sectionId}:${hito}`,
      });
    } catch (error) {
      this.logger.error(`[Notificaciones] No se pudo avisar el avance del estudiante ${event.studentId}: ${(error as Error).message}`);
    }
  }
}
