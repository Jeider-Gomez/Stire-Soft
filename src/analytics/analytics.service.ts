import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
    const pendingReviews = reviews.filter(r => r.nextReviewDate <= now).length;

    // 3. Racha real calculada desde las entregas
    const allSubs = await submissionRepo.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
      select: ['createdAt'],
    });

    let streakDays = 0;
    if (allSubs.length > 0) {
      const distinctDays = Array.from(
        new Set(allSubs.map(s => new Date(s.createdAt).toISOString().slice(0, 10)))
      ).sort().reverse();

      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      const startsToday = distinctDays.includes(todayStr);
      const startsYesterday = distinctDays.includes(yesterdayStr);

      if (startsToday || startsYesterday) {
        let cursor = startsToday ? new Date() : new Date(Date.now() - 86400000);
        while (true) {
          const cursorStr = cursor.toISOString().slice(0, 10);
          if (distinctDays.includes(cursorStr)) {
            streakDays++;
            cursor = new Date(cursor.getTime() - 86400000);
          } else {
            break;
          }
        }
      }
    }

    // 4. Recent submissions
    const recentSubmissions = await submissionRepo.find({
      where: { studentId },
      relations: ['activity'],
      order: { createdAt: 'DESC' },
      take: 5,
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
      })),
      masteryByUnit: progressList.map(p => ({
        unitId: p.learningUnitId,
        unitTitle: p.learningUnit?.title || 'Unidad Desconocida',
        mastery: p.mastery,
        successRate: p.successRate,
      })),
    };
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

    // Estudiantes matriculados
    const enrollments = await enrollmentRepo.find({
      where: { classId },
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
