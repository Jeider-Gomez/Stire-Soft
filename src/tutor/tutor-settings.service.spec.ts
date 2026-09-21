import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TutorSettingsService } from './tutor-settings.service';
import { DEFAULT_TUTOR_SETTINGS, mergeSettings, styleInstruction } from './tutor-settings';

const STUDENT: any = { id: 1, role: 'estudiante' };
const TEACHER: any = { id: 50, role: 'docente' };

type Row = { id: number; scopeType: string; scopeId: number; enabled: boolean | null; maxGuideLevel: number | null; style: string | null };

/** Repositorio en memoria mínimo para `find`/`findOne`/`save`/`create`/`delete` sobre filas de configuración. */
function fakeSettingsRepo(rows: Row[]) {
  const matches = (row: Row, where: any) =>
    Object.entries(where).every(([key, value]: [string, any]) =>
      value && typeof value === 'object' && Array.isArray(value._value) ? value._value.includes((row as any)[key]) : (row as any)[key] === value,
    );
  return {
    rows,
    find: jest.fn(async ({ where }: any) => rows.filter(r => (Array.isArray(where) ? where.some(w => matches(r, w)) : matches(r, where)))),
    findOne: jest.fn(async ({ where }: any) => rows.find(r => matches(r, where)) ?? null),
    create: jest.fn((row: any) => ({ id: rows.length + 100, ...row })),
    save: jest.fn(async (row: Row) => {
      if (!rows.includes(row)) rows.push(row);
      return row;
    }),
    delete: jest.fn(async ({ id }: any) => {
      const i = rows.findIndex(r => r.id === id);
      if (i >= 0) rows.splice(i, 1);
    }),
  };
}

describe('mergeSettings / estilos', () => {
  it('sin nada configurado usa los valores por defecto', () => {
    expect(mergeSettings([])).toEqual(DEFAULT_TUTOR_SETTINGS);
  });

  it('el ámbito más específico manda campo por campo y null hereda', () => {
    const merged = mergeSettings([
      { enabled: null, maxGuideLevel: 1, style: null },
      { enabled: false, maxGuideLevel: 3, style: 'breve' },
    ]);
    expect(merged).toEqual({ enabled: false, maxGuideLevel: 1, style: 'breve' });
  });

  it('el estilo equilibrado no agrega instrucciones (no gasta tokens) y los demás sí', () => {
    expect(styleInstruction('equilibrado')).toBeNull();
    expect(styleInstruction('breve')).toContain('60 palabras');
  });
});

describe('TutorSettingsService', () => {
  let repo: ReturnType<typeof fakeSettingsRepo>;
  let activityRepo: any;
  let enrollmentRepo: any;
  let learningUnitService: any;
  let authorizationService: any;
  let service: TutorSettingsService;

  beforeEach(() => {
    repo = fakeSettingsRepo([]);
    activityRepo = { findOne: jest.fn().mockResolvedValue({ id: 20, learningUnitId: 7 }) };
    enrollmentRepo = { find: jest.fn().mockResolvedValue([]) };
    learningUnitService = { getClassIdForUnit: jest.fn().mockResolvedValue(3) };
    authorizationService = {
      assertEnrolledInClass: jest.fn().mockResolvedValue(undefined),
      assertTeacherOwnsClass: jest.fn().mockResolvedValue(undefined),
    };
    service = new TutorSettingsService(repo as any, activityRepo, enrollmentRepo, learningUnitService, authorizationService);
  });

  describe('lado del estudiante', () => {
    it('usa los valores por defecto si el docente no configuró nada', async () => {
      await expect(service.resolveForStudent(STUDENT, { activityId: 20 })).resolves.toEqual(DEFAULT_TUTOR_SETTINGS);
    });

    it('actividad → unidad → clase: el más específico manda y lo demás se hereda', async () => {
      repo.rows.push(
        { id: 1, scopeType: 'class', scopeId: 3, enabled: null, maxGuideLevel: 2, style: 'tecnico' },
        { id: 2, scopeType: 'unit', scopeId: 7, enabled: null, maxGuideLevel: null, style: 'motivador' },
        { id: 3, scopeType: 'activity', scopeId: 20, enabled: false, maxGuideLevel: null, style: null },
      );

      await expect(service.resolveForStudent(STUDENT, { activityId: 20 })).resolves.toEqual({
        enabled: false,
        maxGuideLevel: 2,
        style: 'motivador',
      });
    });

    it('la unidad de la actividad la decide el servidor, no el cliente', async () => {
      await service.resolveForStudent(STUDENT, { activityId: 20, unitId: 999 });

      expect(learningUnitService.getClassIdForUnit).toHaveBeenCalledWith(7);
    });

    it('sin actividad usa la unidad verificada y comprueba que el estudiante esté matriculado en su clase', async () => {
      await service.resolveForStudent(STUDENT, { unitId: 7 });

      expect(learningUnitService.getClassIdForUnit).toHaveBeenCalledWith(7);
      expect(authorizationService.assertEnrolledInClass).toHaveBeenCalledWith(STUDENT, 3);
    });

    it('si el estudiante no está matriculado en esa clase, ignora ese contexto y cae al chat general', async () => {
      authorizationService.assertEnrolledInClass.mockRejectedValue(new ForbiddenException());
      enrollmentRepo.find.mockResolvedValue([{ classId: 9 }]);
      repo.rows.push({ id: 1, scopeType: 'class', scopeId: 3, enabled: false, maxGuideLevel: 1, style: null });

      // la configuración de la clase ajena (3) no se le aplica
      await expect(service.resolveForStudent(STUDENT, { activityId: 20 })).resolves.toEqual(DEFAULT_TUTOR_SETTINGS);
    });

    it('chat general: aplica lo más estricto entre las clases activas del estudiante', async () => {
      enrollmentRepo.find.mockResolvedValue([{ classId: 3 }, { classId: 4 }, { classId: 5 }]);
      repo.rows.push(
        { id: 1, scopeType: 'class', scopeId: 3, enabled: null, maxGuideLevel: 2, style: 'breve' },
        { id: 2, scopeType: 'class', scopeId: 4, enabled: false, maxGuideLevel: 1, style: null },
        { id: 3, scopeType: 'class', scopeId: 99, enabled: false, maxGuideLevel: 1, style: null },
      );

      await expect(service.resolveForStudent(STUDENT, {})).resolves.toEqual({
        enabled: false,
        maxGuideLevel: 1,
        style: 'equilibrado',
      });
    });

    it('chat general sin matrículas activas: valores por defecto', async () => {
      await expect(service.resolveForStudent(STUDENT, {})).resolves.toEqual(DEFAULT_TUTOR_SETTINGS);
    });

    it('un activityId inexistente se ignora sin fallar', async () => {
      activityRepo.findOne.mockResolvedValue(null);

      await expect(service.resolveForStudent(STUDENT, { activityId: 99999 })).resolves.toEqual(DEFAULT_TUTOR_SETTINGS);
    });

    it('si la unidad no existe (NotFound) cae al chat general en vez de fallar', async () => {
      learningUnitService.getClassIdForUnit.mockRejectedValue(new NotFoundException());

      await expect(service.resolveForStudent(STUDENT, { unitId: 12345 })).resolves.toEqual(DEFAULT_TUTOR_SETTINGS);
    });
  });

  describe('findAccessibleUnitId (base de "Ir al contenido")', () => {
    it('devuelve la unidad de la actividad, decidida por el servidor', async () => {
      await expect(service.findAccessibleUnitId(STUDENT, 20)).resolves.toBe(7);
      expect(activityRepo.findOne).toHaveBeenCalledWith({ where: { id: 20 } });
    });

    it('null si el estudiante no está matriculado en la clase de esa unidad', async () => {
      authorizationService.assertEnrolledInClass.mockRejectedValue(new ForbiddenException());

      await expect(service.findAccessibleUnitId(STUDENT, 20)).resolves.toBeNull();
    });

    it('null si no hay actividad o el id no es válido', async () => {
      activityRepo.findOne.mockResolvedValue(null);

      await expect(service.findAccessibleUnitId(STUDENT, 999)).resolves.toBeNull();
      await expect(service.findAccessibleUnitId(STUDENT, undefined)).resolves.toBeNull();
      await expect(service.findAccessibleUnitId(STUDENT, 'abc')).resolves.toBeNull();
    });
  });

  describe('lado del docente', () => {
    it('exige que el docente dicte la clase del ámbito (clase, unidad y actividad)', async () => {
      await service.updateForTeacher(TEACHER, 'class', 3, { enabled: false });
      expect(authorizationService.assertTeacherOwnsClass).toHaveBeenLastCalledWith(TEACHER, 3);

      await service.updateForTeacher(TEACHER, 'unit', 7, { maxGuideLevel: 2 });
      expect(learningUnitService.getClassIdForUnit).toHaveBeenLastCalledWith(7);
      expect(authorizationService.assertTeacherOwnsClass).toHaveBeenLastCalledWith(TEACHER, 3);

      await service.updateForTeacher(TEACHER, 'activity', 20, { style: 'breve' });
      expect(authorizationService.assertTeacherOwnsClass).toHaveBeenLastCalledWith(TEACHER, 3);
    });

    it('un docente ajeno a la clase no puede leer ni cambiar nada y no se escribe nada', async () => {
      authorizationService.assertTeacherOwnsClass.mockRejectedValue(new ForbiddenException('No dictas esta clase'));

      await expect(service.updateForTeacher(TEACHER, 'unit', 7, { enabled: false })).rejects.toBeInstanceOf(ForbiddenException);
      await expect(service.getForTeacher(TEACHER, 'unit', 7)).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rechaza ámbitos e identificadores inválidos', async () => {
      await expect(service.getForTeacher(TEACHER, 'universidad', 1)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.getForTeacher(TEACHER, 'class', 0)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.getForTeacher(TEACHER, 'class', 1.5)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('una actividad inexistente responde 404', async () => {
      activityRepo.findOne.mockResolvedValue(null);

      await expect(service.updateForTeacher(TEACHER, 'activity', 999, { enabled: false })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('guarda solo lo enviado y conserva lo demás; devuelve valores propios y efectivos', async () => {
      await service.updateForTeacher(TEACHER, 'class', 3, { maxGuideLevel: 2 });
      const view = await service.updateForTeacher(TEACHER, 'class', 3, { style: 'motivador' });

      expect(repo.rows).toHaveLength(1);
      expect(view.own).toEqual({ enabled: null, maxGuideLevel: 2, style: 'motivador' });
      expect(view.effective).toEqual({ enabled: true, maxGuideLevel: 2, style: 'motivador' });
    });

    it('enviar null vuelve a heredar, y si todo queda en null se borra la fila', async () => {
      await service.updateForTeacher(TEACHER, 'unit', 7, { maxGuideLevel: 1, style: 'breve' });
      await service.updateForTeacher(TEACHER, 'unit', 7, { maxGuideLevel: null });
      expect(repo.rows[0]).toMatchObject({ maxGuideLevel: null, style: 'breve' });

      await service.updateForTeacher(TEACHER, 'unit', 7, { style: null });
      expect(repo.rows).toHaveLength(0);
    });

    it('getForTeacher muestra lo propio (null = hereda) y lo efectivo de la cadena', async () => {
      repo.rows.push({ id: 1, scopeType: 'class', scopeId: 3, enabled: null, maxGuideLevel: 2, style: null });

      const view = await service.getForTeacher(TEACHER, 'activity', 20);

      expect(view.own).toEqual({ enabled: null, maxGuideLevel: null, style: null });
      expect(view.effective).toEqual({ enabled: true, maxGuideLevel: 2, style: 'equilibrado' });
    });
  });
});
