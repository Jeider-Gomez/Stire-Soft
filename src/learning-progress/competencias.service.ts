import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Class, MODOS_COMPETENCIAS, type ModoCompetencias } from '../class/entities/class.entity';
import { User } from '../user/entities/user.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { PublicationStatus } from '../common/enums/status.enum';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { actividadVisiblePara } from '../activities/visibilidad';
import {
  calcularCompetencias,
  competenciaParaPracticar,
  competenciasDeActividad,
  DIFICULTAD_SEGUN_ESTADO,
  nivelCompetencia,
  estadoDeNivel,
  type ActividadEvaluable,
  type EstadoCompetencia,
  type EstadoNivel,
  type IdCompetencia,
  type IntentoCompetencia,
} from '../common/utils/competencias';

/** Una actividad de la clase con lo necesario para etiquetarla y calificarla. */
export interface ActividadDeClase extends ActividadEvaluable {
  title: string;
  learningUnitId: number;
  difficulty: string;
  status: string;
  asignadaA: number[] | null;
}

export interface EjercicioSugerido {
  activityId: number;
  title: string;
  learningUnitId: number;
  difficulty: string;
}

export interface CompetenciasDelEstudiante {
  modo: ModoCompetencias;
  /** Quién las activó («Prof. Pedro»). */
  docente: string | null;
  competencias: EstadoCompetencia[];
  /** «Elegido para ti»: la competencia más baja y un ejercicio para practicarla. */
  practicar: { id: IdCompetencia; nombre: string; estado: EstadoNivel; ejercicio: EjercicioSugerido | null } | null;
}

export interface CompetenciasDeLaClase {
  modo: ModoCompetencias;
  estudiantes: number;
  competencias: Array<{
    id: IdCompetencia;
    nombre: string;
    ejemplo: string;
    /** Nivel de la clase: la misma ecuación con los puntos de todos. */
    nivel: number;
    estado: EstadoNivel;
    porEstado: Record<EstadoNivel, number>;
    /** Los que van «En camino», del nivel más bajo al más alto (para un refuerzo). */
    enCamino: Array<{ studentId: number; nombre: string; nivel: number }>;
    /** Ejercicios en el banco de la clase por dificultad. */
    banco: { basico: number; intermedio: number; avanzado: number };
  }>;
  /** La competencia más baja de la clase y las que no tienen ejercicios. */
  masBaja: string | null;
}

/** Texto donde se ve el código del ejercicio: el enunciado, el código inicial o la plantilla. */
function codigoDe(descripcion: string | null, config: unknown): string {
  const c = (typeof config === 'string' ? jsonSeguro(config) : config) as Record<string, unknown> | null;
  return [descripcion ?? '', String(c?.starterCode ?? ''), String(c?.codeTemplate ?? '')].join('\n');
}

function jsonSeguro(t: string): unknown {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

const RANGO: Record<string, number> = { basico: 0, intermedio: 1, avanzado: 2 };

/**
 * Competencias (P39) de un estudiante o de una clase. Se calculan cada vez desde los intentos guardados con la ecuación
 * de `common/utils/competencias.ts`: no se guarda nada aparte, así que valen también hacia atrás.
 */
@Injectable()
export class CompetenciasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async modoDeClase(classId: number): Promise<ModoCompetencias> {
    const clase = await this.dataSource.getRepository(Class).findOne({ where: { id: classId }, select: ['id', 'competenciasModo'] });
    if (!clase) throw new NotFoundException('Clase no encontrada');
    return (MODOS_COMPETENCIAS as readonly string[]).includes(clase.competenciasModo) ? clase.competenciasModo : 'apagado';
  }

  /** Las actividades publicadas de la clase, con su lección, su tipo y su código. */
  async actividadesDeClase(classId: number): Promise<ActividadDeClase[]> {
    const filas: Array<{
      id: number; title: string; description: string | null; totalPoints: number; passingScore: number; difficulty: string;
      status: string; asignadaA: unknown; learningUnitId: number; leccion: string; tipo: string | null; config: unknown;
    }> = await this.dataSource.query(
      `SELECT a.id, a.title, a.description, a.totalPoints, a.passingScore, a.difficulty, a.status, a.asignadaA,
              a.learningUnitId, lu.title AS leccion, q.type AS tipo, q.config
         FROM activities a
         JOIN learning_units lu ON lu.id = a.learningUnitId
         JOIN topics t ON t.id = lu.topicId
         JOIN sections se ON se.id = t.sectionId
         LEFT JOIN activity_questions q ON q.id = (SELECT MIN(q2.id) FROM activity_questions q2 WHERE q2.activityId = a.id)
        WHERE se.classId = ? AND a.status = ? AND a.deletedAt IS NULL AND lu.isActive = 1
        ORDER BY se.order, t.order, lu.order, a.order, a.id`,
      [classId, PublicationStatus.PUBLISHED],
    );
    return filas.map((f) => ({
      id: Number(f.id),
      title: f.title,
      leccion: f.leccion,
      learningUnitId: Number(f.learningUnitId),
      questionType: f.tipo,
      codigo: codigoDe(f.description, f.config),
      totalPoints: Number(f.totalPoints),
      passingScore: Number(f.passingScore),
      difficulty: f.difficulty,
      status: f.status,
      asignadaA: (typeof f.asignadaA === 'string' ? jsonSeguro(f.asignadaA) : f.asignadaA) as number[] | null,
    }));
  }

  private async intentosDe(studentIds: number[], activityIds: number[]): Promise<Map<number, IntentoCompetencia[]>> {
    const porEstudiante = new Map<number, IntentoCompetencia[]>(studentIds.map((id) => [id, []]));
    if (studentIds.length === 0 || activityIds.length === 0) return porEstudiante;
    const filas: Array<{ studentId: number; activityId: number; score: number; fecha: Date }> = await this.dataSource.query(
      `SELECT s.studentId, s.activityId, s.score, COALESCE(s.submittedAt, s.createdAt) AS fecha
         FROM submissions s
        WHERE s.studentId IN (?) AND s.activityId IN (?) AND s.status <> ? AND s.deletedAt IS NULL`,
      [studentIds, activityIds, SubmissionStatus.IN_PROGRESS],
    );
    for (const f of filas) {
      porEstudiante.get(Number(f.studentId))?.push({ activityId: Number(f.activityId), score: Number(f.score), fecha: new Date(f.fecha) });
    }
    return porEstudiante;
  }

  /** Las competencias de un estudiante en una clase (sin mirar el modo: lo decide quien las muestra). */
  async calcularPara(studentId: number, classId: number): Promise<{ estados: EstadoCompetencia[]; actividades: ActividadDeClase[]; intentos: IntentoCompetencia[] }> {
    const actividades = (await this.actividadesDeClase(classId)).filter((a) => actividadVisiblePara(a, studentId));
    const intentos = (await this.intentosDe([studentId], actividades.map((a) => a.id))).get(studentId) ?? [];
    return { estados: calcularCompetencias(actividades, intentos), actividades, intentos };
  }

  /** «Mis competencias»: el propio estudiante (matriculado), su docente o un admin. */
  async deEstudiante(studentId: number, classId: number, user: User): Promise<CompetenciasDelEstudiante> {
    if (user.role === 'estudiante') {
      if (user.id !== studentId) throw new ForbiddenException('Solo puedes ver tus propias competencias.');
      await this.authorizationService.assertEnrolledInClass(user, classId);
    } else {
      await this.authorizationService.assertTeacherOwnsClass(user, classId);
    }
    const modo = await this.modoDeClase(classId);
    const filaDocente: Array<{ nombre: string }> = await this.dataSource.query(
      'SELECT u.fullName AS nombre FROM classes c JOIN users u ON u.id = c.teacherId WHERE c.id = ?',
      [classId],
    );
    const docente = filaDocente[0]?.nombre ?? null;
    if (modo === 'apagado') return { modo, docente, competencias: [], practicar: null };
    const { estados, actividades, intentos } = await this.calcularPara(studentId, classId);
    const p = competenciaParaPracticar(estados);
    return {
      modo,
      docente,
      competencias: estados,
      practicar: p ? { id: p.id, nombre: p.nombre, estado: p.estado, ejercicio: ejercicioParaPracticar(p.id, p.estado, actividades, intentos) } : null,
    };
  }

  /** El docente elige el modo desde la pestaña Competencias (cuadro D3-Competencias). */
  async cambiarModo(classId: number, modo: string, user: User): Promise<{ modo: ModoCompetencias }> {
    await this.authorizationService.assertTeacherOwnsClass(user, classId);
    if (!(MODOS_COMPETENCIAS as readonly string[]).includes(modo)) throw new NotFoundException('Ese modo no existe');
    await this.dataSource.getRepository(Class).update({ id: classId }, { competenciasModo: modo as ModoCompetencias });
    return { modo: modo as ModoCompetencias };
  }

  /** La vista del docente: cómo va la clase en cada competencia, a quién le cuesta y qué hay en el banco. */
  async deClase(classId: number, user: User): Promise<CompetenciasDeLaClase> {
    await this.authorizationService.assertTeacherOwnsClass(user, classId);
    const modo = await this.modoDeClase(classId);
    const estudiantes: Array<{ id: number; nombre: string }> = await this.dataSource.query(
      `SELECT u.id, u.fullName AS nombre FROM enrollments e JOIN users u ON u.id = e.studentId
        WHERE e.classId = ? AND e.status = ? ORDER BY u.fullName`,
      [classId, EnrollmentStatus.ACTIVE],
    );
    const actividades = await this.actividadesDeClase(classId);
    const ids = estudiantes.map((e) => Number(e.id));
    const intentos = await this.intentosDe(ids, actividades.map((a) => a.id));

    type Fila = CompetenciasDeLaClase['competencias'][number] & { logrados: number; posibles: number };
    const filas = new Map<IdCompetencia, Fila>();
    // El catálogo de la clase y su banco, aunque nadie haya empezado.
    for (const e of calcularCompetencias(actividades, [])) {
      filas.set(e.id, {
        id: e.id, nombre: e.nombre, ejemplo: e.ejemplo, nivel: 0, estado: 'sin-evidencia', logrados: 0, posibles: 0,
        porEstado: { 'sin-evidencia': 0, 'en-camino': 0, 'lo-hace': 0, 'lo-domina': 0 }, enCamino: [],
        banco: { basico: 0, intermedio: 0, avanzado: 0 },
      });
    }
    for (const a of actividades) {
      if (a.asignadaA) continue; // los refuerzos y retos de alguien no son del banco de la clase
      for (const id of competenciasDeActividad(a)) {
        const f = filas.get(id);
        const d = (['basico', 'intermedio', 'avanzado'] as const).find((x) => x === a.difficulty) ?? 'basico';
        if (f) f.banco[d]++;
      }
    }
    for (const est of estudiantes) {
      const id = Number(est.id);
      const visibles = actividades.filter((a) => actividadVisiblePara(a, id));
      for (const e of calcularCompetencias(visibles, intentos.get(id) ?? [])) {
        const f = filas.get(e.id);
        if (!f) continue;
        f.porEstado[e.estado]++;
        f.logrados += e.logrados;
        f.posibles += e.posibles;
        if (e.estado === 'en-camino') f.enCamino.push({ studentId: id, nombre: est.nombre, nivel: e.nivel });
      }
    }
    const competencias = [...filas.values()].map(({ logrados, posibles, ...f }) => {
      const nivel = nivelCompetencia(logrados, posibles);
      return { ...f, nivel: Math.round(nivel * 1000) / 1000, estado: estadoDeNivel(posibles, nivel), enCamino: f.enCamino.sort((a, b) => a.nivel - b.nivel) };
    });
    const conEvidencia = competencias.filter((c) => c.estado !== 'sin-evidencia');
    const masBaja = conEvidencia.length ? [...conEvidencia].sort((a, b) => a.nivel - b.nivel)[0].nombre : null;
    return { modo, estudiantes: estudiantes.length, competencias, masBaja };
  }

  /** «Practica esto primero» para el propio estudiante: la clase sale de la actividad y debe estar matriculado. */
  async practicarPrimeroDe(user: User, activityId: number) {
    const fila: Array<{ classId: number }> = await this.dataSource.query(
      `SELECT se.classId FROM activities a JOIN learning_units lu ON lu.id = a.learningUnitId
         JOIN topics t ON t.id = lu.topicId JOIN sections se ON se.id = t.sectionId WHERE a.id = ?`,
      [activityId],
    );
    if (!fila[0]) throw new NotFoundException('Ejercicio no encontrado');
    const classId = Number(fila[0].classId);
    await this.authorizationService.assertEnrolledInClass(user, classId);
    const modo = await this.modoDeClase(classId);
    if (modo === 'apagado') return { modo, competencia: null, leccion: null, ejercicio: null };
    return { modo, ...(await this.practicarPrimero(user.id, activityId, classId)) };
  }

  /**
   * «Practica esto primero» (P36; Toscano: si se bloquea, no darle la respuesta, remitirlo al concepto): para un ejercicio
   * que no le sale, la competencia más baja que ese ejercicio trabaja, la lección donde se explica y un ejercicio más
   * sencillo de esa competencia que todavía no ha resuelto.
   */
  async practicarPrimero(studentId: number, activityId: number, classId: number): Promise<{
    competencia: { id: IdCompetencia; nombre: string; ejemplo: string; nivel: number; estado: EstadoNivel } | null;
    leccion: { learningUnitId: number; titulo: string } | null;
    ejercicio: EjercicioSugerido | null;
  }> {
    const { estados, actividades, intentos } = await this.calcularPara(studentId, classId);
    const actual = actividades.find((a) => a.id === activityId);
    if (!actual) return { competencia: null, leccion: null, ejercicio: null };
    const propias = competenciasDeActividad(actual);
    const estado = estados.filter((e) => propias.includes(e.id)).sort((a, b) => a.nivel - b.nivel)[0];
    if (!estado) return { competencia: null, leccion: { learningUnitId: actual.learningUnitId, titulo: actual.leccion }, ejercicio: null };
    // Un ejercicio más sencillo que el que no sale, de la misma competencia.
    const masSencillo = actividades.filter((a) => a.id !== activityId && (RANGO[a.difficulty] ?? 0) <= (RANGO[actual.difficulty] ?? 0));
    const otro = ejercicioParaPracticar(estado.id, 'en-camino', masSencillo, intentos);
    // La lección que la explica: la primera de la clase que la trabaja (suele ser donde se enseña).
    const primera = actividades.find((a) => competenciasDeActividad(a).includes(estado.id)) ?? actual;
    return {
      competencia: { id: estado.id, nombre: estado.nombre, ejemplo: estado.ejemplo, nivel: estado.nivel, estado: estado.estado },
      leccion: { learningUnitId: primera.learningUnitId, titulo: primera.leccion },
      ejercicio: otro,
    };
  }
}

/**
 * Un ejercicio para practicar una competencia, con la dificultad que toca según su estado (cuadro D3-Competencias:
 * en camino → básico, lo hace → intermedio, lo domina → avanzado). Que no lo haya resuelto; primero los que nunca
 * intentó; si no hay de esa dificultad, el más cercano.
 */
export function ejercicioParaPracticar(
  competencia: IdCompetencia,
  estado: EstadoNivel,
  actividades: ActividadDeClase[],
  intentos: IntentoCompetencia[],
): EjercicioSugerido | null {
  const objetivo = RANGO[DIFICULTAD_SEGUN_ESTADO[estado]];
  const resuelta = (a: ActividadDeClase) =>
    intentos.some((i) => i.activityId === a.id && a.totalPoints > 0 && (i.score / a.totalPoints) * 100 >= a.passingScore);
  const intentada = (a: ActividadDeClase) => intentos.some((i) => i.activityId === a.id);
  const candidatas = actividades
    .filter((a) => competenciasDeActividad(a).includes(competencia) && !resuelta(a))
    .sort((a, b) =>
      Math.abs((RANGO[a.difficulty] ?? 0) - objetivo) - Math.abs((RANGO[b.difficulty] ?? 0) - objetivo) ||
      Number(intentada(a)) - Number(intentada(b)));
  const e = candidatas[0];
  return e ? { activityId: e.id, title: e.title, learningUnitId: e.learningUnitId, difficulty: e.difficulty } : null;
}

