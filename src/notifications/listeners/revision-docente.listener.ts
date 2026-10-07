import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { EnvioRevisadoEvent, NotaRegistradaEvent } from '../../common/events/revision-docente.event';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { resumenRevision } from '../notificacion-reglas';

/**
 * Lo que hace el docente se le avisa al estudiante (notificacion-reglas.ts): la revisión de una entrega y una nota del libro
 * de calificaciones. Son las notificaciones que más importan: el estudiante no las ve si no entra a buscarlas.
 */
@Injectable()
export class RevisionDocenteListener {
  private readonly logger = new Logger(RevisionDocenteListener.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('envio.revisado')
  async envioRevisado(e: EnvioRevisadoEvent) {
    try {
      await this.notificationsService.createNotification(
        e.studentId,
        `Tu docente revisó «${e.titulo}»`,
        resumenRevision(e.nota, e.valoracion, e.comentario),
        NotificationType.GRADE,
        { enlace: `/estudiante/entregas/${e.entregaId}` },
      );
    } catch (error) {
      this.logger.error(`[Notificaciones] No se pudo avisar la revisión al estudiante ${e.studentId}: ${(error as Error).message}`);
    }
  }

  @OnEvent('nota.registrada')
  async notaRegistrada(e: NotaRegistradaEvent) {
    try {
      const filas: Array<{ name: string }> = await this.dataSource.query('SELECT name FROM classes WHERE id = ?', [e.classId]);
      await this.notificationsService.createNotification(
        e.studentId,
        `Nueva nota en ${filas[0]?.name ?? 'tu clase'}`,
        `${e.nombre}: ${e.nota.toFixed(1).replace('.', ',')}. Mira el detalle en «Mi progreso».`,
        NotificationType.GRADE,
        { enlace: '/estudiante/progreso' },
      );
    } catch (error) {
      this.logger.error(`[Notificaciones] No se pudo avisar la nota al estudiante ${e.studentId}: ${(error as Error).message}`);
    }
  }
}
