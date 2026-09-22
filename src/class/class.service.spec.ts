import { ForbiddenException } from '@nestjs/common';
import { ClassService } from './class.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';

// Regresión de P1-06: DELETE /class/:id solo era validado el UPDATE, no el
// remove. Usa un AuthorizationService real (con repos falsos).
describe('ClassService.remove — P1-06', () => {
  let service: ClassService;
  const mockClassRepo = { findOne: jest.fn(), remove: jest.fn().mockResolvedValue(undefined) };
  const mockEnrollmentRepo = { findOne: jest.fn() };
  const mockProgressRepo = { find: jest.fn() };
  const mockUserService = {};

  beforeEach(() => {
    jest.clearAllMocks();
    const authService = new AuthorizationService(mockClassRepo as any, mockEnrollmentRepo as any);
    service = new ClassService(
      mockClassRepo as any,
      mockEnrollmentRepo as any,
      mockProgressRepo as any,
      mockUserService as any,
      authService,
    );
  });

  it('docente A no puede eliminar la clase de docente B → 403', async () => {
    mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10, teacher: {} });
    const docenteA = { id: 99, role: UserRole.DOCENTE } as any;

    await expect(service.remove(5, docenteA)).rejects.toThrow(ForbiddenException);
    expect(mockClassRepo.remove).not.toHaveBeenCalled();
  });

  it('el docente dueño sí puede eliminar su propia clase', async () => {
    mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10, teacher: {} });
    const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;

    await expect(service.remove(5, docenteDueño)).resolves.toBeUndefined();
    expect(mockClassRepo.remove).toHaveBeenCalled();
  });
});

// El dashboard docente (docente/index.vue) mostraba "0" fijo en estudiantes,
// maestría y "en riesgo" porque /class/my-classes nunca calculaba estos
// datos — encontrado al investigar el pendiente de KPIs inventados.
describe('ClassService.findByTeacher — enrollmentCount, avgMastery, atRiskCount reales', () => {
  let service: ClassService;
  const mockClassRepo = { find: jest.fn() };
  const mockEnrollmentRepo = { find: jest.fn() };
  const mockProgressRepo = { find: jest.fn() };
  const mockUserService = {};
  const mockAuthService = {};

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ClassService(
      mockClassRepo as any,
      mockEnrollmentRepo as any,
      mockProgressRepo as any,
      mockUserService as any,
      mockAuthService as any,
    );
  });

  it('sin clases, no consulta matrículas ni progreso', async () => {
    mockClassRepo.find.mockResolvedValue([]);
    await expect(service.findByTeacher(10)).resolves.toEqual([]);
    expect(mockEnrollmentRepo.find).not.toHaveBeenCalled();
  });

  it('calcula enrollmentCount, avgMastery y atRiskCount (umbral <50) por clase', async () => {
    mockClassRepo.find.mockResolvedValue([
      { id: 1, teacherId: 10, name: 'Clase A' },
      { id: 2, teacherId: 10, name: 'Clase B' },
    ]);
    mockEnrollmentRepo.find.mockResolvedValue([
      { classId: 1, studentId: 100 },
      { classId: 1, studentId: 101 },
      { classId: 2, studentId: 102 },
    ]);
    mockProgressRepo.find.mockResolvedValue([
      { studentId: 100, mastery: 80 },
      { studentId: 101, mastery: 20 }, // en riesgo
      // 102 sin ninguna fila de progreso → mastery 0 → también en riesgo
    ]);

    const result = await service.findByTeacher(10);

    expect(result[0]).toMatchObject({ id: 1, enrollmentCount: 2, avgMastery: 50, atRiskCount: 1 });
    expect(result[1]).toMatchObject({ id: 2, enrollmentCount: 1, avgMastery: 0, atRiskCount: 1 });
  });

  it('una clase sin matrículas activas queda con avgMastery indefinido (sin datos, no un cero mentiroso)', async () => {
    mockClassRepo.find.mockResolvedValue([{ id: 3, teacherId: 10, name: 'Clase vacía' }]);
    mockEnrollmentRepo.find.mockResolvedValue([]);
    mockProgressRepo.find.mockResolvedValue([]);

    const result = await service.findByTeacher(10);

    expect(result[0]).toMatchObject({ enrollmentCount: 0, atRiskCount: 0 });
    expect(result[0].avgMastery).toBeUndefined();
  });
});
