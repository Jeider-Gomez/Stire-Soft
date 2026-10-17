import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LearningUnitService } from '../learning-unit/learning-unit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';
import { User } from '../user/entities/user.entity';
import { MotivoFalla } from './dto/recurso-falla.dto';

/** Fecha de hoy en Colombia (AAAA-MM-DD): un aviso por recurso y por día, aunque lo reporten varios estudiantes. */
export function diaColombia(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(ahora);
}

/** El aviso al docente, en palabras: qué recurso, de qué lección, cómo se supo y qué puede hacer. */
export function avisoRecursoCaido(titulo: string, leccion: string, motivo: MotivoFalla): { titulo: string; mensaje: string } {
  const como = motivo === 'no-se-puede-ver'
    ? 'YouTube avisó que el video no se puede ver dentro de STIRE (no existe, es privado o su autor no deja insertarlo)'
    : 'Un estudiante dijo que no le carga y le pidió al Tutor que se lo explicara';
  return {
    titulo: `Revisa un recurso de «${leccion}»`,
    mensaje: `${como}: «${titulo}». Ábrelo para comprobarlo; si no funciona, cámbialo por otro o agrega uno más en la lección.`,
  };
}

/**
 * Un recurso de la lección que no funciona (Jeider, 17/10: «que el profe sepa y revise ese recurso»). El estudiante ve
 * una alternativa en el momento (LessonResource.vue); el docente de la clase recibe una notificación que lleva a editar
 * esa lección. Una sola por recurso y por día (clave), aunque lo reporten varios.
 */
@Injectable()
export class RecursoFallaService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly lecciones: LearningUnitService,
    private readonly notificaciones: NotificationsService,
  ) {}

  async reportar(user: User, learningUnitId: number, titulo: string, motivo: MotivoFalla): Promise<{ avisado: boolean }> {
    await this.lecciones.findOne(learningUnitId, user); // 403/404 si no está inscrito o la lección no existe
    const filas: Array<{ teacherId: number; classId: number; unidad: string }> = await this.dataSource.query(
      'SELECT c.teacherId AS teacherId, c.id AS classId, lu.title AS unidad FROM learning_units lu JOIN topics t ON lu.topicId = t.id ' +
        'JOIN sections s ON t.sectionId = s.id JOIN classes c ON s.classId = c.id WHERE lu.id = ?',
      [learningUnitId],
    );
    const destino = filas[0];
    if (!destino) return { avisado: false };
    const nombre = titulo.trim().slice(0, 200);
    const aviso = avisoRecursoCaido(nombre, destino.unidad, motivo);
    const creada = await this.notificaciones.createNotification(Number(destino.teacherId), aviso.titulo, aviso.mensaje, NotificationType.AVISO, {
      enlace: `/docente/contenidos?classId=${destino.classId}&unitId=${learningUnitId}`,
      clave: `recurso-falla:${learningUnitId}:${nombre.toLowerCase().slice(0, 120)}:${diaColombia()}`,
    });
    return { avisado: !!creada };
  }
}
