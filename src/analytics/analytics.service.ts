import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { Difficulty } from '../common/enums/difficulty.enum';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ReviewSchedule } from '../review-schedules/entities/review-schedule.entity';
import { Class } from '../class/entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { User } from '../user/entities/user.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { Topic } from '../topic/entities/topic.entity';
import { Section } from '../section/entities/section.entity';
import { Activity } from '../activities/entities/activity.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { construirMapaDeCalor, MapaDeCalor } from './mapa-de-calor';
import { construirResumenSemanal, ResumenSemanal } from './resumen-semanal';
import { rachaDeDias, repasosPendientes } from './racha-y-repasos';
import { categoriasPermitidas, evaluarLogros, siguienteLogro, type Logro } from './logros';
import { esNivelConfianza, resumirCalibracion, type ResumenCalibracion } from './calibracion';
import { contarCalidades, type NombreCalidad } from '../common/utils/spaced-repetition';
import { CONFIANZA_SEGURO } from '../learning-progress/recommendation/recomendar-siguiente';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authorizationService: AuthorizationService,
  ) {}

  /**
   * OLA 3 - PUNTO 2/3 (P1-R5, docs/REAUDITORIA_OLA2.md): faltaba exactamente
   * la verificación que `getClassMetrics` sí hace en este mismo archivo
   * (línea ~104) — un docente veía el dashboard de CUALQUIER estudiante de
   * la institución, no solo los de sus propias clases.
   */
  async getStudentDashboard(studentId: number, requestingUser: any) {
    // 0. Control de Acceso
    if (requestingUser.role === 'estudiante' && requestingUser.id !== studentId) {
      throw new ForbiddenException('No tienes acceso a las métricas de otro estudiante.');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(requestingUser, studentId);

    const progressRepo = this.dataSource.getRepository(LearningProgress);
    const submissionRepo = this.dataSource.getRepository(Submission);
    const reviewRepo = this.dataSource.getRepository(ReviewSchedule);

    // 1. Progress stats
    const progressList = await progressRepo.find({
      where: { studentId },
      relations: ['learningUnit'],
    });

    const totalUnitsTracked = progressList.length;
    const avgMastery = totalUnitsTracked > 0
      ? progressList.reduce((acc, p) => acc + p.mastery, 0) / totalUnitsTracked
      : 0;

    const avgSuccessRate = totalUnitsTracked > 0
      ? progressList.reduce((acc, p) => acc + p.successRate, 0) / totalUnitsTracked
      : 0;

    const totalAttempts = progressList.reduce((acc, p) => acc + p.attemptsCount, 0);
    const completedActivitiesCount = progressList.reduce((acc, p) => acc + p.completedActivities, 0);

    // 2. Review stats
    const now = new Date();
    const reviews = await reviewRepo.find({
      where: { studentId },
    });
    
    const totalReviews = reviews.length;
    const pendingReviews = repasosPendientes(reviews.map((r) => r.nextReviewDate), now);

    // 3. Racha real calculada desde las entregas. Abrir un ejercicio (intento «en curso») no es practicar: antes contaba,
    // y el inicio decía «1 día» mientras «Mi progreso» decía «0 días» (revisión del 04/10, MOD-02). Misma regla y misma
    // fecha que las estadísticas (learning-progress.service.ts): entregas, por fecha de entrega.
    const allSubs = await submissionRepo.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
      select: ['createdAt', 'submittedAt', 'status'],
    });

    // Días en hora de Colombia (racha-y-repasos.ts), los mismos de las estadísticas del estudiante.
    const streakDays = rachaDeDias(
      allSubs.filter((sub) => sub.status !== SubmissionStatus.IN_PROGRESS).map((sub) => new Date(sub.submittedAt ?? sub.createdAt)),
      now,
    );

    // 4. Recent submissions
    const recentSubmissions = await submissionRepo.find({
      where: { studentId },
      relations: ['activity'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // 5. Cuánto movió cada entrega el dominio de su lección en los últimos 8 días (07/10, Jeider: «se que avancé, pero
    // tengo que calcularlo yo»). El inicio lo resume en «hoy» o «esta semana» con la hora del dispositivo
    // (utils/avanceReciente.ts); 8 días para que «esta semana» no se corte por la zona horaria.
    const cambiosRecientes = await submissionRepo.find({
      where: { studentId, submittedAt: MoreThanOrEqual(new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)) },
      relations: ['activity', 'activity.learningUnit'],
      order: { submittedAt: 'ASC' },
    });

    // Nombre para la cabecera del detalle del docente, que mostraba «ID: #4».
    const student = await this.dataSource.getRepository(User).findOne({
      where: { id: studentId },
      select: ['id', 'fullName'],
    });

    return {
      studentId,
      studentName: student?.fullName ?? null,
      summary: {
        avgMastery: Math.round(avgMastery * 100) / 100,
        avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
        totalUnitsTracked,
        totalAttempts,
        completedActivitiesCount,
        streakDays,
        reviewStats: {
          total: totalReviews,
          pending: pendingReviews,
        }
      },
      recentSubmissions: recentSubmissions.map(s => ({
        id: s.id,
        activityId: s.activityId,
        activityTitle: s.activity?.title || 'Actividad Desconocida',
        score: s.score,
        // Puntaje máximo real de la actividad y si aprobó: la pantalla del docente
        // mostraba "N / 100" fijo y pintaba de rojo un 20/20.
        maxScore: s.activity?.totalPoints ?? null,
        passed:
          s.status === 'graded' && s.activity?.totalPoints
            ? (s.score / s.activity.totalPoints) * 100 >= s.activity.passingScore
            : null,
        status: s.status,
        submittedAt: s.submittedAt,
        createdAt: s.createdAt,
        // Cuánto movió el dominio de su lección (null en las entregas de antes del 07/10)
        dominioAntes: s.dominioAntes ?? null,
        dominioDespues: s.dominioDespues ?? null,
      })),
      cambiosDominio: (cambiosRecientes ?? [])
        .filter((s) => s.dominioDespues !== null && s.dominioDespues !== undefined && s.dominioAntes !== null && s.dominioAntes !== undefined && s.activity)
        .map((s) => ({
          fecha: s.submittedAt,
          learningUnitId: s.activity.learningUnitId,
          titulo: s.activity.learningUnit?.title ?? s.activity.title,
          antes: s.dominioAntes,
          despues: s.dominioDespues,
        })),
      masteryByUnit: progressList.map(p => ({
        unitId: p.learningUnitId,
        unitTitle: p.learningUnit?.title || 'Unidad Desconocida',
        mastery: p.mastery,
        successRate: p.successRate,
      })),
    };
  }

  /**
   * Logros y medallas (logros.ts; BT-29): el catálogo completo con lo obtenido, el avance de lo que falta, los nuevos
   * que el estudiante no ha visto y la meta más cercana. Lo obtenido se guarda una vez con su fecha.
   */
  /**
   * Calibración del juicio de confianza (calibracion.ts): lo que el estudiante dijo antes de entregar contra lo que
   * obtuvo. La ve él mismo y su docente (para saber a quién conviene mostrarle que sabe más, o menos, de lo que cree).
   */
  /**
   * META-02 y «cómo avanzas» (pedido del dueño, 04/10): la calibración del juicio de confianza y, como en Anki, cuántos
   * de sus resultados de los últimos 30 días fueron «Otra vez», «Difícil», «Bien» o «Fácil» (la misma traducción con la
   * que se programan sus repasos: spaced-repetition.ts, calidadDeRepaso).
   */
  async getCalibracion(studentId: number, requestingUser: User): Promise<ResumenCalibracion & { escala: Record<NombreCalidad, number> }> {
    if (requestingUser.role === 'estudiante' && requestingUser.id !== studentId) {
      throw new ForbiddenException('No tienes acceso a la calibración de otro estudiante.');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(requestingUser, studentId);
    const filas: Array<{ confianza: string; score: number; totalPoints: number; passingScore: number }> = await this.dataSource.query(
      'SELECT s.confianza, s.score, a.totalPoints, a.passingScore FROM submissions s JOIN activities a ON a.id = s.activityId ' +
        "WHERE s.studentId = ? AND s.status = 'graded' AND s.confianza IS NOT NULL",
      [studentId],
    );
    const resumen = resumirCalibracion(
      filas.flatMap((f) =>
        esNivelConfianza(f.confianza)
          ? [{ confianza: f.confianza, acerto: Number(f.totalPoints) > 0 && (Number(f.score) / Number(f.totalPoints)) * 100 >= Number(f.passingScore) }]
          : [],
      ),
    );
    const desde = new Date(Date.now() - 30 * 86_400_000);
    const resultados: Array<{ attemptNumber: number; score: number; totalPoints: number; passingScore: number; confianza: string | null; entryConfidence: number | null }> =
      await this.dataSource.query(
        'SELECT s.attemptNumber, s.score, a.totalPoints, a.passingScore, s.confianza, lp.entryConfidence FROM submissions s ' +
          'JOIN activities a ON a.id = s.activityId ' +
          'LEFT JOIN learning_progress lp ON lp.studentId = s.studentId AND lp.learningUnitId = a.learningUnitId ' +
          "WHERE s.studentId = ? AND s.status = 'graded' AND COALESCE(s.submittedAt, s.createdAt) >= ?",
        [studentId, desde],
      );
    const escala = contarCalidades(
      resultados.map((r) => ({
        aprobado: Number(r.totalPoints) > 0 && (Number(r.score) / Number(r.totalPoints)) * 100 >= Number(r.passingScore),
        primerIntento: Number(r.attemptNumber) === 1,
        seSentiaSeguro: Number(r.entryConfidence) === CONFIANZA_SEGURO || r.confianza === 'seguro',
      })),
    );
    return { ...resumen, escala };
  }

  async getLogros(studentId: number, requestingUser: User): Promise<{ activos: boolean; logros: Logro[]; nuevos: string[]; siguiente: Logro | null }> {
    if (requestingUser.role === 'estudiante' && requestingUser.id !== studentId) {
      throw new ForbiddenException('No tienes acceso a los logros de otro estudiante.');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(requestingUser, studentId);

    // Lo que permiten sus clases (docs/DISENO_LOGROS.md §6): las categorías activas en cualquiera de ellas. Si ninguna
    // usa logros, no hay logros.
    const clases: Array<{ classId: number; logrosActivos: number; categoriasLogro: string | null }> = await this.dataSource.query(
      'SELECT c.id AS classId, c.logrosActivos, c.categoriasLogro FROM enrollments e JOIN classes c ON c.id = e.classId ' +
        "WHERE e.studentId = ? AND e.status = 'active'",
      [studentId],
    );
    const conLogros = clases.filter((c) => Number(c.logrosActivos));
    if (!conLogros.length) return { activos: false, logros: [], nuevos: [], siguiente: null };
    const permitidas = categoriasPermitidas(conLogros.map((c) => c.categoriasLogro));
    const clasesConDominio = new Set(conLogros.filter((c) => categoriasPermitidas([c.categoriasLogro]).has('dominio')).map((c) => Number(c.classId)));

    const filas: Array<{ activityId: number; learningUnitId: number; attemptNumber: number; score: number; isReview: number; status: string; fecha: Date; difficulty: string; totalPoints: number; passingScore: number }> =
      await this.dataSource.query(
        'SELECT s.activityId, a.learningUnitId, s.attemptNumber, s.score, s.isReview, s.status, COALESCE(s.submittedAt, s.createdAt) AS fecha, ' +
          "a.difficulty, a.totalPoints, a.passingScore FROM submissions s JOIN activities a ON a.id = s.activityId WHERE s.studentId = ? AND s.status <> 'in_progress'",
        [studentId],
      );
    const entregas = filas.map((e) => ({
      activityId: Number(e.activityId),
      learningUnitId: Number(e.learningUnitId),
      aprobada: e.status === 'graded' && Number(e.totalPoints) > 0 && (Number(e.score) / Number(e.totalPoints)) * 100 >= Number(e.passingScore),
      avanzado: e.difficulty === Difficulty.AVANZADO,
      intento: Number(e.attemptNumber) || 1,
      fecha: new Date(e.fecha),
      repaso: !!Number(e.isReview),
    }));
    const lecciones: Array<{ classId: number; unitId: number; moduloId: number; moduloTitulo: string; mastery: number | null; fecha: Date | null }> = await this.dataSource.query(
      'SELECT s.classId AS classId, lu.id AS unitId, s.id AS moduloId, s.title AS moduloTitulo, lp.mastery AS mastery, lp.updatedAt AS fecha FROM learning_units lu ' +
        'JOIN topics t ON t.id = lu.topicId JOIN sections s ON s.id = t.sectionId JOIN enrollments e ON e.classId = s.classId ' +
        'LEFT JOIN learning_progress lp ON lp.learningUnitId = lu.id AND lp.studentId = e.studentId ' +
        "WHERE e.studentId = ? AND e.status = 'active' AND s.isPublished = 1 AND t.isActive = 1 AND lu.isActive = 1",
      [studentId],
    );
    const logros = evaluarLogros(
      entregas,
      lecciones.filter((l) => clasesConDominio.has(Number(l.classId))).map((l) => ({
        learningUnitId: Number(l.unitId), moduloId: Number(l.moduloId), moduloTitulo: l.moduloTitulo,
        mastery: Number(l.mastery ?? 0), fecha: l.fecha ? new Date(l.fecha) : null,
      })),
      entregas.filter((e) => e.repaso).map((e) => e.fecha),
      entregas.map((e) => e.fecha),
    ).filter((l) => permitidas.has(l.categoria));

    // Guardar lo obtenido (una vez) y saber qué no ha visto: así se celebra una sola vez, con su fecha estable.
    const obtenidos = logros.filter((l) => l.obtenido);
    for (const l of obtenidos) {
      await this.dataSource.query('INSERT IGNORE INTO `logros_estudiante` (`studentId`, `clave`, `obtenidoEn`) VALUES (?, ?, ?)', [studentId, l.clave, new Date(l.obtenido!)]);
    }
    const guardados: Array<{ clave: string; visto: number }> = obtenidos.length
      ? await this.dataSource.query('SELECT `clave`, `visto` FROM `logros_estudiante` WHERE `studentId` = ?', [studentId])
      : [];
    const vigentes = new Set(logros.map((l) => l.clave));
    return {
      activos: true,
      logros,
      // Solo los que la clase permite hoy: si el docente quita una categoría, no se celebran sus medallas.
      nuevos: guardados.filter((g) => !Number(g.visto) && vigentes.has(g.clave)).map((g) => g.clave),
      siguiente: siguienteLogro(logros),
    };
  }

  /** El estudiante ya vio sus logros nuevos: no se vuelven a celebrar. */
  async marcarLogrosVistos(studentId: number): Promise<{ ok: true }> {
    await this.dataSource.query('UPDATE `logros_estudiante` SET `visto` = 1 WHERE `studentId` = ? AND `visto` = 0', [studentId]);
    return { ok: true };
  }

  async getClassMetrics(classId: number, requestingUser: any) {
    const enrollmentRepo = this.dataSource.getRepository(Enrollment);
    const progressRepo = this.dataSource.getRepository(LearningProgress);
    const submissionRepo = this.dataSource.getRepository(Submission);
    const classRepo = this.dataSource.getRepository(Class);

    const cls = await classRepo.findOne({ where: { id: classId } });
    if (!cls) {
      return null;
    }

    // Control de Acceso: solo el docente dueño de la clase o un admin pueden ver las métricas
    if (requestingUser.role === 'estudiante') {
      throw new ForbiddenException('Los estudiantes no tienen permiso para ver métricas de clase.');
    }
    if (requestingUser.role === 'docente' && cls.teacherId !== requestingUser.id) {
      throw new ForbiddenException('No tienes acceso a las métricas de esta clase.');
    }

    // Estudiantes matriculados: solo las matrículas activas. Antes contaba también a los retirados (y a las solicitudes sin
    // aprobar): un estudiante quitado en Ajustes seguía en «Estudiantes» y como «Necesita apoyo» (sugerencia n.º 9 de Pedro).
    const enrollments = await enrollmentRepo.find({
      where: { classId, status: EnrollmentStatus.ACTIVE },
      relations: ['student'],
    });

    const studentIds = enrollments.map(e => e.studentId);
    if (studentIds.length === 0) {
      return {
        classId,
        className: cls.name,
        classCode: cls.code,
        metrics: {
          totalStudents: 0,
          avgClassMastery: 0,
          avgClassSuccessRate: 0,
          totalSubmissions: 0,
        },
        studentRankings: [],
      };
    }

    // Solo el progreso y las entregas de las unidades de ESTA clase. Antes se unía el progreso por la matrícula y se
    // contaban todas las entregas del estudiante: quien está en dos clases salía con el mismo dominio y las mismas
    // entregas en ambas (Andrés: 96,8 % y 77 entregas en ALGO-203413 y en PENSAR-ALGO; evaluación heurística del 30/09).
    const idsUnidad = await this.idsUnidadesDeClase(classId, false);
    const progressList = idsUnidad.length === 0 ? [] : await progressRepo.createQueryBuilder('p')
      .where('p.studentId IN (:...studentIds)', { studentIds })
      .andWhere('p.learningUnitId IN (:...idsUnidad)', { idsUnidad })
      .getMany();

    const submissions = idsUnidad.length === 0 ? [] : await submissionRepo.createQueryBuilder('s')
      .innerJoin(Activity, 'a', 'a.id = s.activityId')
      .where('s.studentId IN (:...studentIds)', { studentIds })
      .andWhere('a.learningUnitId IN (:...idsUnidad)', { idsUnidad })
      .andWhere('s.status = :status', { status: 'graded' })
      .getMany();

    const totalProgressEntries = progressList.length;
    const avgClassMastery = totalProgressEntries > 0
      ? progressList.reduce((acc, p) => acc + p.mastery, 0) / totalProgressEntries
      : 0;

    const avgClassSuccessRate = totalProgressEntries > 0
      ? progressList.reduce((acc, p) => acc + p.successRate, 0) / totalProgressEntries
      : 0;

    // Calcular métricas por estudiante
    const studentMetrics = enrollments.map(e => {
      const studentProgress = progressList.filter(p => p.studentId === e.studentId);
      const studentSubs = submissions.filter(s => s.studentId === e.studentId);
      
      const sMastery = studentProgress.length > 0
        ? studentProgress.reduce((acc, p) => acc + p.mastery, 0) / studentProgress.length
        : 0;

      const sSuccessRate = studentProgress.length > 0
        ? studentProgress.reduce((acc, p) => acc + p.successRate, 0) / studentProgress.length
        : 0;

      return {
        studentId: e.studentId,
        fullName: e.student?.fullName || 'Estudiante Desconocido',
        email: e.student?.email,
        avgMastery: Math.round(sMastery * 100) / 100,
        successRate: Math.round(sSuccessRate * 100) / 100,
        submissionsCount: studentSubs.length,
      };
    });

    // Ordenar de mayor a menor mastery
    studentMetrics.sort((a, b) => b.avgMastery - a.avgMastery);

    return {
      classId,
      className: cls.name,
      classCode: cls.code,
      metrics: {
        totalStudents: studentIds.length,
        avgClassMastery: Math.round(avgClassMastery * 100) / 100,
        avgClassSuccessRate: Math.round(avgClassSuccessRate * 100) / 100,
        totalSubmissions: submissions.length,
      },
      studentRankings: studentMetrics,
    };
  }

  /**
   * GET /analytics/class/:classId/heatmap — mapa de calor del docente (paso 6). Solo el docente de la clase o un admin.
   * Unidades de las secciones publicadas, en el orden del curso; estudiantes con matrícula activa.
   */
  async getClassHeatmap(classId: number, requestingUser: { id: number; role: string }, ahora = new Date()): Promise<MapaDeCalor> {
    const cls = await this.dataSource.getRepository(Class).findOne({ where: { id: classId } });
    if (!cls) throw new NotFoundException('La clase no existe.');
    if (requestingUser.role === 'estudiante') {
      throw new ForbiddenException('Los estudiantes no tienen permiso para ver métricas de clase.');
    }
    if (requestingUser.role === 'docente' && cls.teacherId !== requestingUser.id) {
      throw new ForbiddenException('No tienes acceso a las métricas de esta clase.');
    }

    const unidades = await this.unidadesDeClase(classId, true);

    const matriculas = await this.dataSource.getRepository(Enrollment).find({
      where: { classId, status: EnrollmentStatus.ACTIVE },
      relations: ['student'],
    });
    const estudiantes = matriculas
      .map((m) => ({ id: m.studentId, fullName: m.student?.fullName ?? '—' }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));

    const idsUnidad = unidades.map((u) => u.id);
    const idsEstudiante = estudiantes.map((e) => e.id);
    if (idsUnidad.length === 0 || idsEstudiante.length === 0) {
      return construirMapaDeCalor({ unidades, estudiantes, progresos: [], entregas: [], ahora });
    }

    const progresos = await this.dataSource.getRepository(LearningProgress).createQueryBuilder('p')
      .where('p.studentId IN (:...idsEstudiante)', { idsEstudiante })
      .andWhere('p.learningUnitId IN (:...idsUnidad)', { idsUnidad })
      .getMany();

    const filasEntrega = await this.dataSource.getRepository(Submission).createQueryBuilder('sub')
      .innerJoin(Activity, 'a', 'a.id = sub.activityId')
      .where('sub.studentId IN (:...idsEstudiante)', { idsEstudiante })
      .andWhere('a.learningUnitId IN (:...idsUnidad)', { idsUnidad })
      .andWhere('sub.status = :calificada', { calificada: SubmissionStatus.GRADED })
      .select([
        'sub.studentId AS studentId', 'sub.activityId AS activityId', 'sub.score AS score',
        'sub.submittedAt AS submittedAt', 'sub.createdAt AS createdAt',
        'a.learningUnitId AS learningUnitId', 'a.totalPoints AS totalPoints', 'a.passingScore AS passingScore',
      ])
      .getRawMany<Record<string, string | number | Date | null>>();

    return construirMapaDeCalor({
      unidades,
      estudiantes,
      progresos: progresos.map((p) => ({
        studentId: p.studentId, learningUnitId: p.learningUnitId, mastery: p.mastery, status: p.status, entryConfidence: p.entryConfidence ?? null,
      })),
      entregas: filasEntrega.map((f) => {
        const total = Number(f.totalPoints);
        return {
          studentId: Number(f.studentId),
          activityId: Number(f.activityId),
          learningUnitId: Number(f.learningUnitId),
          // Mismo criterio que isSubmissionPassed: el puntaje de aprobación es un porcentaje del total.
          aprobada: total > 0 && (Number(f.score) / total) * 100 >= Number(f.passingScore),
          fecha: new Date((f.submittedAt ?? f.createdAt) as string | Date),
        };
      }),
      ahora,
    });
  }

  /**
   * GET /analytics/class/:classId/semana — resumen de la semana para «Hoy» (docs/DISENO_INTERVENCION_DOCENTE.md §4.4):
   * esta semana frente a la anterior y quién lleva 7 días o más sin practicar. Solo el docente de la clase o un admin.
   */
  async getResumenSemanal(classId: number, requestingUser: { id: number; role: string }, ahora = new Date()): Promise<ResumenSemanal> {
    const cls = await this.dataSource.getRepository(Class).findOne({ where: { id: classId } });
    if (!cls) throw new NotFoundException('La clase no existe.');
    if (requestingUser.role === 'estudiante') throw new ForbiddenException('Los estudiantes no tienen permiso para ver métricas de clase.');
    if (requestingUser.role === 'docente' && cls.teacherId !== requestingUser.id) throw new ForbiddenException('No tienes acceso a las métricas de esta clase.');

    const matriculas = await this.dataSource.getRepository(Enrollment).find({ where: { classId, status: EnrollmentStatus.ACTIVE }, relations: ['student'] });
    const estudiantes = matriculas.map((m) => ({ id: m.studentId, nombre: m.student?.fullName ?? '—' }));
    const idsUnidad = await this.idsUnidadesDeClase(classId, false);
    const idsEstudiante = estudiantes.map((e) => e.id);
    if (idsUnidad.length === 0 || idsEstudiante.length === 0) {
      return construirResumenSemanal({ estudiantes, intentos: [], ultimaActividad: new Map(), ahora });
    }

    const base = () => this.dataSource.getRepository(Submission).createQueryBuilder('sub')
      .innerJoin(Activity, 'a', 'a.id = sub.activityId')
      .where('sub.studentId IN (:...idsEstudiante)', { idsEstudiante })
      .andWhere('a.learningUnitId IN (:...idsUnidad)', { idsUnidad })
      .andWhere('sub.status = :calificada', { calificada: SubmissionStatus.GRADED });
    // 15 días hacia atrás alcanzan para las dos semanas, contadas en días de Colombia.
    const desde = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000);
    const recientes = await base()
      .andWhere('COALESCE(sub.submittedAt, sub.createdAt) >= :desde', { desde })
      .select(['sub.studentId AS studentId', 'sub.score AS score', 'sub.submittedAt AS submittedAt', 'sub.createdAt AS createdAt', 'a.totalPoints AS totalPoints', 'a.passingScore AS passingScore'])
      .getRawMany<Record<string, string | number | Date | null>>();
    const ultimas = await base()
      .select('sub.studentId', 'studentId')
      .addSelect('MAX(COALESCE(sub.submittedAt, sub.createdAt))', 'ultima')
      .groupBy('sub.studentId')
      .getRawMany<{ studentId: number; ultima: string | Date }>();

    return construirResumenSemanal({
      estudiantes,
      intentos: recientes.map((f) => {
        const total = Number(f.totalPoints);
        return {
          studentId: Number(f.studentId),
          aprobado: total > 0 && (Number(f.score) / total) * 100 >= Number(f.passingScore),
          fecha: new Date((f.submittedAt ?? f.createdAt) as string | Date),
        };
      }),
      ultimaActividad: new Map(ultimas.map((u) => [Number(u.studentId), new Date(u.ultima)])),
      ahora,
    });
  }

  /** Unidades de una clase en el orden del curso; con `soloPublicadas`, solo las de secciones publicadas. */
  private async unidadesDeClase(classId: number, soloPublicadas: boolean): Promise<Array<{ id: number; title: string; sectionTitle: string }>> {
    const qb = this.dataSource.getRepository(LearningUnit).createQueryBuilder('u')
      .innerJoin(Topic, 't', 't.id = u.topicId')
      .innerJoin(Section, 's', 's.id = t.sectionId')
      .where('s.classId = :classId', { classId });
    if (soloPublicadas) qb.andWhere('s.isPublished = :pub', { pub: true });
    const filas = await qb
      .select(['u.id AS id', 'u.title AS title', 's.title AS sectionTitle'])
      .orderBy('s.order', 'ASC').addOrderBy('t.order', 'ASC').addOrderBy('u.order', 'ASC').addOrderBy('u.id', 'ASC')
      .getRawMany<{ id: number; title: string; sectionTitle: string }>();
    return filas.map((u) => ({ id: Number(u.id), title: u.title, sectionTitle: u.sectionTitle }));
  }

  private async idsUnidadesDeClase(classId: number, soloPublicadas: boolean): Promise<number[]> {
    return (await this.unidadesDeClase(classId, soloPublicadas)).map((u) => u.id);
  }
}
