import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Activity } from '../activities/entities/activity.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { LearningUnitService } from '../learning-unit/learning-unit.service';
import { User } from '../user/entities/user.entity';
import { TutorSetting } from './entities/tutor-setting.entity';
import { GuidanceLevel } from './tutor-guidance';
import {
  DEFAULT_TUTOR_SETTINGS,
  EffectiveTutorSettings,
  mergeSettings,
  OwnTutorSettings,
  TUTOR_SETTING_SCOPES,
  TUTOR_STYLES,
  TutorSettingScope,
  TutorStyle,
} from './tutor-settings';

export interface ScopeSettingsView {
  scopeType: TutorSettingScope;
  scopeId: number;
  own: OwnTutorSettings;
  effective: EffectiveTutorSettings;
}

interface ResolvedScope {
  classId: number;
  unitId?: number;
  activityId?: number;
}

const EMPTY: OwnTutorSettings = { enabled: null, maxGuideLevel: null, style: null };

/**
 * Configuración del Tutor por parte del docente. Tres ámbitos, el más específico manda:
 * actividad, unidad, clase y, al final, los valores por defecto (activo, ayuda hasta el nivel 3,
 * estilo equilibrado). Fuera de una unidad o actividad (chat general) se aplica lo más estricto
 * entre las clases activas del estudiante.
 */
@Injectable()
export class TutorSettingsService {
  constructor(
    @InjectRepository(TutorSetting) private readonly repo: Repository<TutorSetting>,
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    private readonly learningUnitService: LearningUnitService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  // Lado del estudiante

  /** Configuración que aplica a este estudiante según dónde esté. Nunca falla por datos del cliente. */
  async resolveForStudent(
    user: User,
    target: { activityId?: unknown; unitId?: number | null },
  ): Promise<EffectiveTutorSettings> {
    const scope = await this.locateStudentScope(user, target);
    if (scope) return this.effectiveFor(scope);
    return this.strictestAcrossClasses(user.id);
  }

  /**
   * Unidad de una actividad, decidida en el servidor y solo si el estudiante está matriculado en
   * su clase. Sirve para ofrecer "Ir al contenido" sin confiar en ningún id que mande el cliente.
   */
  async findAccessibleUnitId(user: User, activityId: unknown): Promise<number | null> {
    const scope = await this.locateStudentScope(user, { activityId });
    return scope?.unitId ?? null;
  }

  private async locateStudentScope(
    user: User,
    target: { activityId?: unknown; unitId?: number | null },
  ): Promise<ResolvedScope | null> {
    let unitId = target.unitId ?? undefined;
    let activityId: number | undefined;

    const rawActivityId = Number(target.activityId);
    if (Number.isInteger(rawActivityId) && rawActivityId > 0) {
      const activity = await this.activityRepo.findOne({ where: { id: rawActivityId } });
      if (activity) {
        activityId = activity.id;
        unitId = activity.learningUnitId;
      }
    }
    if (!unitId) return null;

    let classId: number;
    try {
      classId = await this.learningUnitService.getClassIdForUnit(unitId);
      await this.authorizationService.assertEnrolledInClass(user, classId);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException) return null;
      throw err;
    }
    return { classId, unitId, activityId };
  }

  private async strictestAcrossClasses(studentId: number): Promise<EffectiveTutorSettings> {
    const enrollments = await this.enrollmentRepo.find({ where: { studentId, status: EnrollmentStatus.ACTIVE } });
    const classIds = enrollments.map(e => e.classId);
    if (classIds.length === 0) return { ...DEFAULT_TUTOR_SETTINGS };

    const rows = await this.repo.find({ where: { scopeType: 'class', scopeId: In(classIds) } });
    const own = rows.map(r => this.toOwn(r));
    const levels = own.map(o => o.maxGuideLevel).filter((v): v is GuidanceLevel => v !== null);
    return {
      enabled: !own.some(o => o.enabled === false),
      maxGuideLevel: levels.length ? (Math.min(...levels) as GuidanceLevel) : DEFAULT_TUTOR_SETTINGS.maxGuideLevel,
      style: DEFAULT_TUTOR_SETTINGS.style,
    };
  }

  private async effectiveFor(scope: ResolvedScope): Promise<EffectiveTutorSettings> {
    const wanted: Array<{ scopeType: TutorSettingScope; scopeId: number }> = [];
    if (scope.activityId) wanted.push({ scopeType: 'activity', scopeId: scope.activityId });
    if (scope.unitId) wanted.push({ scopeType: 'unit', scopeId: scope.unitId });
    wanted.push({ scopeType: 'class', scopeId: scope.classId });

    const rows = await this.repo.find({ where: wanted });
    const chain = wanted.map(w => {
      const row = rows.find(r => r.scopeType === w.scopeType && r.scopeId === w.scopeId);
      return row ? this.toOwn(row) : EMPTY;
    });
    return mergeSettings(chain);
  }

  // Lado del docente

  async getForTeacher(user: User, scopeType: string, scopeId: number): Promise<ScopeSettingsView> {
    const scope = this.parseScope(scopeType, scopeId);
    const resolved = await this.authorizeTeacher(user, scope.scopeType, scope.scopeId);
    const row = await this.repo.findOne({ where: { scopeType: scope.scopeType, scopeId: scope.scopeId } });
    return { ...scope, own: row ? this.toOwn(row) : { ...EMPTY }, effective: await this.effectiveFor(resolved) };
  }

  async updateForTeacher(
    user: User,
    scopeType: string,
    scopeId: number,
    changes: { enabled?: boolean | null; maxGuideLevel?: number | null; style?: string | null },
  ): Promise<ScopeSettingsView> {
    const scope = this.parseScope(scopeType, scopeId);
    const resolved = await this.authorizeTeacher(user, scope.scopeType, scope.scopeId);

    const existing = await this.repo.findOne({ where: { scopeType: scope.scopeType, scopeId: scope.scopeId } });
    const current = existing ? this.toOwn(existing) : { ...EMPTY };
    const next: OwnTutorSettings = {
      enabled: changes.enabled !== undefined ? changes.enabled : current.enabled,
      maxGuideLevel: (changes.maxGuideLevel !== undefined ? changes.maxGuideLevel : current.maxGuideLevel) as GuidanceLevel | null,
      style: (changes.style !== undefined ? changes.style : current.style) as TutorStyle | null,
    };

    if (next.enabled === null && next.maxGuideLevel === null && next.style === null) {
      if (existing) await this.repo.delete({ id: existing.id });
    } else if (existing) {
      existing.enabled = next.enabled;
      existing.maxGuideLevel = next.maxGuideLevel;
      existing.style = next.style;
      await this.repo.save(existing);
    } else {
      await this.repo.save(this.repo.create({ ...scope, ...next }));
    }

    return { ...scope, own: next, effective: await this.effectiveFor(resolved) };
  }

  private parseScope(scopeType: string, scopeId: number): { scopeType: TutorSettingScope; scopeId: number } {
    if (!(TUTOR_SETTING_SCOPES as readonly string[]).includes(scopeType)) {
      throw new BadRequestException(`El ámbito debe ser uno de: ${TUTOR_SETTING_SCOPES.join(', ')}`);
    }
    if (!Number.isInteger(scopeId) || scopeId <= 0) {
      throw new BadRequestException('El identificador del ámbito no es válido');
    }
    return { scopeType: scopeType as TutorSettingScope, scopeId };
  }

  /** Resuelve la clase del ámbito y exige que el docente la dicte (el administrador pasa siempre). */
  private async authorizeTeacher(user: User, scopeType: TutorSettingScope, scopeId: number): Promise<ResolvedScope> {
    let classId: number;
    let unitId: number | undefined;
    let activityId: number | undefined;

    if (scopeType === 'class') {
      classId = scopeId;
    } else if (scopeType === 'unit') {
      unitId = scopeId;
      classId = await this.learningUnitService.getClassIdForUnit(scopeId);
    } else {
      const activity = await this.activityRepo.findOne({ where: { id: scopeId } });
      if (!activity) throw new NotFoundException('Actividad no encontrada');
      activityId = activity.id;
      unitId = activity.learningUnitId;
      classId = await this.learningUnitService.getClassIdForUnit(activity.learningUnitId);
    }

    await this.authorizationService.assertTeacherOwnsClass(user, classId);
    return { classId, unitId, activityId };
  }

  private toOwn(row: TutorSetting): OwnTutorSettings {
    const level = row.maxGuideLevel;
    return {
      enabled: row.enabled ?? null,
      maxGuideLevel: level === 1 || level === 2 || level === 3 ? level : null,
      style: row.style && (TUTOR_STYLES as readonly string[]).includes(row.style) ? (row.style as TutorStyle) : null,
    };
  }
}
