import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Refuerzo } from './entities/refuerzo.entity';
import { RefuerzoPasoHecho } from './entities/refuerzo-paso-hecho.entity';
import { asignacionTrasRefuerzo, ordenarSugerencias, pasosHechos, RefuerzoInvalidoError, validarRefuerzo, type Paso, type TipoRefuerzo } from './refuerzo-reglas';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityQuestion } from '../activity-questions/entities/activity-question.entity';
import { Entrega } from '../proyectos/entities/entrega.entity';
import { ProyectoEnvio } from '../proyectos/entities/proyecto-envio.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { PublicationStatus } from '../common/enums/status.enum';
import { rangoNivel } from '../common/utils/casilla';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { MessageService } from '../message/message.service';
import { User } from '../user/entities/user.entity';

function reglas<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof RefuerzoInvalidoError) throw new BadRequestException(e.message);
    throw e;
  }
}

/**
 * Refuerzos y retos (docs/DISENO_INTERVENCION_DOCENTE.md §4 y §10.4): el docente arma una secuencia corta de pasos para
 * uno o varios estudiantes; STIRE sugiere ejercicios, guarda el dominio de partida y muestra después si funcionó.
 */
@Injectable()
export class RefuerzosService {
  private readonly logger = new Logger(RefuerzosService.name);

  constructor(
    @InjectRepository(Refuerzo) private readonly refuerzos: Repository<Refuerzo>,
    @InjectRepository(RefuerzoPasoHecho) private readonly hechos: Repository<RefuerzoPasoHecho>,
    @InjectRepository(Activity) private readonly actividades: Repository<Activity>,
    @InjectRepository(Entrega) private readonly entregas: Repository<Entrega>,
    @InjectRepository(ProyectoEnvio) private readonly envios: Repository<ProyectoEnvio>,
    @InjectRepository(Enrollment) private readonly matriculas: Repository<Enrollment>,
    @InjectRepository(LearningProgress) private readonly progresos: Repository<LearningProgress>,
    @InjectRepository(Submission) private readonly intentos: Repository<Submission>,
    @InjectRepository(User) private readonly usuarios: Repository<User>,
    private readonly autorizacion: AuthorizationService,
    private readonly mensajes: MessageService,
  ) {}

  /** Lecciones de la clase (id → título), por la cadena lección → tema → módulo. */
  private async leccionesDeLaClase(classId: number): Promise<Map<number, string>> {
    const filas: Array<{ id: number; title: string }> = await this.refuerzos.manager.query(
      'SELECT lu.id AS id, lu.title AS title FROM learning_units lu JOIN topics t ON lu.topicId = t.id JOIN sections s ON t.sectionId = s.id WHERE s.classId = ?',
      [classId],
    );
    return new Map(filas.map((f) => [Number(f.id), f.title]));
  }

  private async estudiantesActivos(classId: number): Promise<number[]> {
    return (await this.matriculas.find({ where: { classId, status: EnrollmentStatus.ACTIVE } })).map((m) => m.studentId);
  }

  // ───────────────────────── Docente ─────────────────────────

  async crear(user: User, datos: Record<string, unknown>) {
    const classId = Number(datos.classId);
    if (!Number.isInteger(classId)) throw new BadRequestException('Elige la clase.');
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const v = reglas(() => validarRefuerzo(datos));

    const lecciones = await this.leccionesDeLaClase(classId);
    if (v.learningUnitIds.some((id) => !lecciones.has(id))) throw new BadRequestException('Alguna lección elegida no es de esta clase.');
    const activos = new Set(await this.estudiantesActivos(classId));
    if (v.estudiantes.some((id) => !activos.has(id))) throw new BadRequestException('Algún estudiante elegido no está en esta clase.');

    // Los ejercicios y entregas del refuerzo quedan disponibles para estos estudiantes. Un borrador se publica solo
    // para ellos: así el docente crea un ejercicio nuevo en Contenidos y lo convierte en un refuerzo personal.
    for (const paso of v.pasos) {
      if (paso.tipo === 'ejercicio') {
        const a = await this.actividades.findOne({ where: { id: paso.activityId } });
        if (!a || !lecciones.has(a.learningUnitId)) throw new BadRequestException('Algún ejercicio elegido no es de esta clase.');
        const publicada = a.status === PublicationStatus.PUBLISHED;
        a.asignadaA = asignacionTrasRefuerzo(a.asignadaA ?? null, publicada, v.estudiantes);
        if (!publicada) {
          a.status = PublicationStatus.PUBLISHED;
          a.publishedAt = new Date();
        }
        await this.actividades.save(a);
      } else if (paso.tipo === 'entrega') {
        const e = await this.entregas.findOne({ where: { id: paso.entregaId } });
        if (!e || e.classId !== classId) throw new BadRequestException('Alguna entrega elegida no es de esta clase.');
        e.asignadaA = asignacionTrasRefuerzo(e.asignadaA, e.publicada, v.estudiantes);
        e.publicada = true;
        await this.entregas.save(e);
      }
    }

    const progresos = await this.progresos.find({ where: { studentId: In(v.estudiantes), learningUnitId: In(v.learningUnitIds) } });
    const dominioInicial: Record<string, Record<string, number>> = {};
    for (const sid of v.estudiantes) {
      dominioInicial[sid] = {};
      for (const uid of v.learningUnitIds) {
        dominioInicial[sid][uid] = Math.round(progresos.find((p) => p.studentId === sid && p.learningUnitId === uid)?.mastery ?? 0);
      }
    }

    const refuerzo = await this.refuerzos.save(this.refuerzos.create({ ...v, classId, dominioInicial, archivado: false, createdBy: user.id }));

    // El mensaje lo escribió (o revisó) el docente: se envía tal cual. Si falla, el refuerzo ya quedó creado.
    if (v.mensaje) {
      const contenido = `${v.mensaje}\n\n${v.tipo === 'reto' ? 'Tienes un reto' : 'Tienes un refuerzo'}: «${v.titulo}». Lo encuentras en tu inicio.`;
      for (const sid of v.estudiantes) {
        await this.mensajes.create({ receiverId: sid, content: contenido }, user).catch((e: unknown) => {
          this.logger.warn(`No se envió el mensaje del refuerzo ${refuerzo.id} al estudiante ${sid}: ${String(e)}`);
        });
      }
    }
    return refuerzo;
  }

  /** Qué pasos hizo cada estudiante: ejercicios intentados y entregas enviadas desde que se creó, y lo marcado. */
  private async hechosDe(refuerzo: Refuerzo, studentIds: number[]): Promise<Map<number, boolean[]>> {
    const actividadIds = refuerzo.pasos.flatMap((p) => (p.tipo === 'ejercicio' ? [p.activityId] : []));
    const entregaIds = refuerzo.pasos.flatMap((p) => (p.tipo === 'entrega' ? [p.entregaId] : []));
    const intentos = actividadIds.length
      ? await this.intentos.find({ where: { studentId: In(studentIds), activityId: In(actividadIds), status: Not(SubmissionStatus.IN_PROGRESS), createdAt: MoreThanOrEqual(refuerzo.createdAt) } })
      : [];
    const envios = entregaIds.length
      ? await this.envios.find({ where: { studentId: In(studentIds), entregaId: In(entregaIds), createdAt: MoreThanOrEqual(refuerzo.createdAt) } })
      : [];
    const marcados = await this.hechos.find({ where: { refuerzoId: refuerzo.id, studentId: In(studentIds) } });
    return new Map(
      studentIds.map((sid) => [
        sid,
        pasosHechos(refuerzo.pasos, {
          intentados: new Set(intentos.filter((i) => i.studentId === sid).map((i) => i.activityId)),
          entregados: new Set(envios.filter((e) => e.studentId === sid).map((e) => e.entregaId)),
          marcados: new Set(marcados.filter((m) => m.studentId === sid).map((m) => m.paso)),
        }),
      ]),
    );
  }

  /** Los refuerzos de la clase con «¿funcionó?»: pasos hechos y dominio antes → ahora por estudiante y lección. */
  async deLaClase(user: User, classId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const lista = await this.refuerzos.find({ where: { classId }, order: { archivado: 'ASC', createdAt: 'DESC' } });
    const lecciones = await this.leccionesDeLaClase(classId);
    const ids = [...new Set(lista.flatMap((r) => r.estudiantes))];
    const personas = ids.length ? await this.usuarios.find({ where: { id: In(ids) } }) : [];
    const nombre = new Map(personas.map((u) => [u.id, u.fullName || u.email]));
    const progresos = ids.length ? await this.progresos.find({ where: { studentId: In(ids) } }) : [];
    return Promise.all(lista.map(async (r) => {
      const hechos = await this.hechosDe(r, r.estudiantes);
      return {
        id: r.id,
        tipo: r.tipo,
        titulo: r.titulo,
        fechaLimite: r.fechaLimite,
        archivado: r.archivado,
        createdAt: r.createdAt,
        totalPasos: r.pasos.length,
        lecciones: r.learningUnitIds.map((uid) => ({ id: uid, titulo: lecciones.get(uid) ?? '' })),
        estudiantes: r.estudiantes.map((sid) => {
          const h = hechos.get(sid) ?? [];
          return {
            studentId: sid,
            nombre: nombre.get(sid) ?? 'Estudiante',
            pasosHechos: h.filter(Boolean).length,
            dominio: r.learningUnitIds.map((uid) => ({
              learningUnitId: uid,
              antes: r.dominioInicial[sid]?.[uid] ?? 0,
              ahora: Math.round(progresos.find((p) => p.studentId === sid && p.learningUnitId === uid)?.mastery ?? 0),
            })),
          };
        }),
      };
    }));
  }

  /** Ejercicios de las lecciones elegidas, ordenados para el refuerzo o el reto, y las entregas de la clase. */
  async sugerencias(user: User, classId: number, unitIds: number[], studentIds: number[], tipo: TipoRefuerzo) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const lecciones = await this.leccionesDeLaClase(classId);
    const validas = unitIds.filter((u) => lecciones.has(u));
    const actividades = validas.length ? await this.actividades.find({ where: { learningUnitId: In(validas) }, order: { order: 'ASC', id: 'ASC' } }) : [];
    const preguntas = actividades.length
      ? await this.refuerzos.manager.find(ActivityQuestion, { where: { activityId: In(actividades.map((a) => a.id)) }, order: { order: 'ASC', id: 'ASC' } })
      : [];
    const intentos = actividades.length && studentIds.length
      ? await this.intentos.find({ where: { studentId: In(studentIds), activityId: In(actividades.map((a) => a.id)), status: Not(SubmissionStatus.IN_PROGRESS) } })
      : [];
    const ejercicios = actividades.map((a) => {
      const aprobaron = new Set(
        intentos.filter((i) => i.activityId === a.id && a.totalPoints > 0 && (i.score / a.totalPoints) * 100 >= a.passingScore).map((i) => i.studentId),
      );
      return {
        id: a.id,
        titulo: a.title,
        leccion: lecciones.get(a.learningUnitId) ?? '',
        nivel: rangoNivel(a.difficulty),
        dificultad: a.difficulty,
        tipoPregunta: preguntas.find((p) => p.activityId === a.id)?.type ?? null,
        borrador: a.status !== PublicationStatus.PUBLISHED,
        soloPara: a.asignadaA?.length ?? 0,
        aprobadosPor: aprobaron.size,
      };
    });
    const entregas = await this.entregas.find({ where: { classId }, order: { createdAt: 'DESC' } });
    return {
      ejercicios: ordenarSugerencias(ejercicios, tipo, studentIds.length),
      entregas: entregas.map((e) => ({ id: e.id, titulo: e.titulo, publicada: e.publicada })),
    };
  }

  async archivar(user: User, id: number) {
    const r = await this.refuerzos.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Refuerzo no encontrado.');
    await this.autorizacion.assertTeacherOwnsClass(user, r.classId);
    r.archivado = true;
    await this.refuerzos.save(r);
    return { ok: true };
  }

  // ───────────────────────── Estudiante ─────────────────────────

  /** Un refuerzo asignado a este estudiante; a cualquier otro le responde 404. */
  private async delEstudiante(user: User, id: number): Promise<Refuerzo> {
    const r = await this.refuerzos.findOne({ where: { id } });
    if (!r || r.archivado || !r.estudiantes.includes(user.id)) throw new NotFoundException('Refuerzo no encontrado.');
    return r;
  }

  async mios(user: User) {
    const clases = (await this.matriculas.find({ where: { studentId: user.id, status: EnrollmentStatus.ACTIVE } })).map((m) => m.classId);
    if (!clases.length) return [];
    const lista = (await this.refuerzos.find({ where: { classId: In(clases), archivado: false }, order: { createdAt: 'DESC' } }))
      .filter((r) => r.estudiantes.includes(user.id));
    return Promise.all(lista.map(async (r) => {
      const h = (await this.hechosDe(r, [user.id])).get(user.id) ?? [];
      return { id: r.id, classId: r.classId, tipo: r.tipo, titulo: r.titulo, mensaje: r.mensaje, fechaLimite: r.fechaLimite, totalPasos: r.pasos.length, pasosHechos: h.filter(Boolean).length };
    }));
  }

  async verComoEstudiante(user: User, id: number) {
    const r = await this.delEstudiante(user, id);
    const h = (await this.hechosDe(r, [user.id])).get(user.id) ?? [];
    const actividadIds = r.pasos.flatMap((p) => (p.tipo === 'ejercicio' ? [p.activityId] : []));
    const entregaIds = r.pasos.flatMap((p) => (p.tipo === 'entrega' ? [p.entregaId] : []));
    const actividades = actividadIds.length ? await this.actividades.find({ where: { id: In(actividadIds) } }) : [];
    const entregas = entregaIds.length ? await this.entregas.find({ where: { id: In(entregaIds) } }) : [];
    const lecciones = await this.leccionesDeLaClase(r.classId);
    return {
      id: r.id,
      tipo: r.tipo,
      titulo: r.titulo,
      mensaje: r.mensaje,
      fechaLimite: r.fechaLimite,
      lecciones: r.learningUnitIds.map((uid) => ({ id: uid, titulo: lecciones.get(uid) ?? '' })),
      pasos: r.pasos.map((p: Paso, i: number) => {
        if (p.tipo === 'ejercicio') return { ...p, titulo: actividades.find((a) => a.id === p.activityId)?.title ?? 'Ejercicio', hecho: h[i] ?? false };
        if (p.tipo === 'entrega') return { ...p, titulo: entregas.find((e) => e.id === p.entregaId)?.titulo ?? 'Entrega', hecho: h[i] ?? false };
        return { ...p, hecho: h[i] ?? false };
      }),
    };
  }

  /** «Ya lo vi» en un paso de explicación o de recurso. */
  async marcar(user: User, id: number, paso: number) {
    const r = await this.delEstudiante(user, id);
    const p = r.pasos[paso];
    if (!p || (p.tipo !== 'explicacion' && p.tipo !== 'recurso')) throw new BadRequestException('Ese paso se completa haciéndolo, no marcándolo.');
    const ya = await this.hechos.findOne({ where: { refuerzoId: id, studentId: user.id, paso } });
    if (!ya) await this.hechos.save(this.hechos.create({ refuerzoId: id, studentId: user.id, paso }));
    return { ok: true };
  }
}
