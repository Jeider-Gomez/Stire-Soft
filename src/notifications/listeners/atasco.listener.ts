import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource, In, Not } from 'typeorm';
import { SubmissionGradedEvent } from '../../common/events/submission-graded.event';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { Activity } from '../../activities/entities/activity.entity';
import { Submission } from '../../submissions/entities/submission.entity';
import { SubmissionStatus } from '../../common/enums/submission-status.enum';
import { User } from '../../user/entities/user.entity';
import { FALLOS_PARA_PAUSA, fallosSeguidos } from '../../learning-progress/recommendation/recomendar-siguiente';
import { avisoDeAtasco } from '../notificacion-reglas';

/**
 * Tope estilo ASSISTments (docs/DISENO_INTERVENCION_DOCENTE.md §4.4; BASE_TEORICA.md BT-16): cuando un estudiante llega
 * a FALLOS_PARA_PAUSA fallos seguidos en una lección, el docente recibe un aviso, una sola vez por racha. Al estudiante
 * el recomendador ya le propone parar y volver a la explicación. Sin tope, practica en círculo y nadie se entera.
 * Desde el 07/10 el estudiante también recibe, una vez por racha, una sugerencia de qué hacer (notificacion-reglas.ts):
 * queda en sus notificaciones para volver a ella aunque ya haya salido del ejercicio (hallazgo de José).
 */
@Injectable()
export class AtascoListener {
  private readonly logger = new Logger(AtascoListener.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('submission.graded')
  async handle(event: SubmissionGradedEvent): Promise<void> {
    try {
      const actividades = await this.dataSource.getRepository(Activity).find({ where: { learningUnitId: event.learningUnitId } });
      const porId = new Map(actividades.map((a) => [a.id, a]));
      const intentos = await this.dataSource.getRepository(Submission).find({
        where: { studentId: event.studentId, activityId: In([...porId.keys()]), status: Not(SubmissionStatus.IN_PROGRESS) },
      });
      const racha = fallosSeguidos(intentos.map((s) => {
        const a = porId.get(s.activityId)!;
        return {
          aprobado: a.totalPoints > 0 && (Number(s.score) / a.totalPoints) * 100 >= a.passingScore,
          fecha: new Date(s.submittedAt ?? s.createdAt ?? 0),
        };
      }));
      // Exactamente al llegar al tope: un aviso por racha, no uno por cada fallo de más.
      if (racha !== FALLOS_PARA_PAUSA) return;

      const filas: Array<{ teacherId: number; classId: number; unidad: string }> = await this.dataSource.query(
        'SELECT c.teacherId AS teacherId, c.id AS classId, lu.title AS unidad FROM learning_units lu JOIN topics t ON lu.topicId = t.id ' +
          'JOIN sections s ON t.sectionId = s.id JOIN classes c ON s.classId = c.id WHERE lu.id = ?',
        [event.learningUnitId],
      );
      const destino = filas[0];
      if (!destino) return;
      const sugerencia = avisoDeAtasco(destino.unidad, FALLOS_PARA_PAUSA);
      await this.notificationsService.createNotification(event.studentId, sugerencia.titulo, sugerencia.mensaje, NotificationType.INFO, {
        enlace: `/estudiante/unidad/${event.learningUnitId}`,
      });
      const estudiante = await this.dataSource.getRepository(User).findOne({ where: { id: event.studentId } });
      await this.notificationsService.createNotification(
        Number(destino.teacherId),
        `${estudiante?.fullName ?? 'Un estudiante'} se atascó`,
        `Lleva ${FALLOS_PARA_PAUSA} intentos seguidos sin lograr «${destino.unidad}». STIRE le propuso volver a la explicación. ` +
          'En «Hoy» de tu clase puedes asignarle un refuerzo o escribirle.',
        NotificationType.INFO,
        { enlace: `/docente/clase/${destino.classId}` },
      );
    } catch (error) {
      // Un aviso que no se pudo crear no debe romper la calificación.
      this.logger.error(`[Tope] No se pudo avisar del atasco del estudiante ${event.studentId}: ${(error as Error).message}`);
    }
  }
}
