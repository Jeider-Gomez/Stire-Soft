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

// Regresión de la simulación del 23/09: GET /class y GET /class/:id devolvían
// el `code` (secreto de ingreso) y el correo del docente a CUALQUIER usuario
// autenticado — cualquier estudiante podía listar los códigos de todas las clases.
describe('ClassService — el código de ingreso solo lo ven admin, dueño y matriculados', () => {
  const cls = { id: 1, name: 'A', code: 'SECRETO-1', teacherId: 10, teacher: { id: 10, fullName: 'Prof', email: 'prof@x.com' } };
  const classRepo = { findOne: jest.fn(), find: jest.fn() };
  const enrollmentRepo = { findOne: jest.fn(), find: jest.fn() };
  const service = new ClassService(classRepo as any, enrollmentRepo as any, {} as any, {} as any, {} as any);

  beforeEach(() => {
    jest.clearAllMocks();
    classRepo.findOne.mockResolvedValue(cls);
    classRepo.find.mockResolvedValue([cls]);
  });

  it('el catálogo no trae code ni el correo del docente', async () => {
    const [entry] = await service.findCatalogue();
    expect(entry).not.toHaveProperty('code');
    expect(entry.teacher).toEqual({ id: 10, fullName: 'Prof' });
    expect(JSON.stringify(entry)).not.toContain('prof@x.com');
  });

  it.each([
    ['admin', { id: 1, role: UserRole.ADMIN }, false],
    ['docente dueño', { id: 10, role: UserRole.DOCENTE }, false],
  ])('%s ve la clase completa', async (_n, user, _e) => {
    await expect(service.findOneFor(1, user as any)).resolves.toHaveProperty('code', 'SECRETO-1');
  });

  it('estudiante matriculado ve el código; no matriculado no', async () => {
    enrollmentRepo.findOne.mockResolvedValueOnce({ id: 'e1' });
    await expect(service.findOneFor(1, { id: 5, role: UserRole.ESTUDIANTE } as any)).resolves.toHaveProperty('code');
    enrollmentRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOneFor(1, { id: 6, role: UserRole.ESTUDIANTE } as any)).resolves.not.toHaveProperty('code');
  });

  it('un docente que no es dueño recibe la vista de catálogo', async () => {
    await expect(service.findOneFor(1, { id: 99, role: UserRole.DOCENTE } as any)).resolves.not.toHaveProperty('code');
  });

  it('findByStudent solo consulta clases de matrículas activas', async () => {
    enrollmentRepo.find.mockResolvedValue([{ classId: 1 }]);
    await service.findByStudent(5);
    expect(enrollmentRepo.find.mock.calls[0][0].where).toMatchObject({ studentId: 5, status: 'active' });
    enrollmentRepo.find.mockResolvedValue([]);
    await expect(service.findByStudent(5)).resolves.toEqual([]);
  });
});

describe('ClassService.findByCode — un código ausente no puede devolver "la primera clase"', () => {
  const mockClassRepo = { findOne: jest.fn().mockResolvedValue({ id: 1, code: 'X' }) };
  const service = new ClassService(mockClassRepo as any, {} as any, {} as any, {} as any, {} as any);

  beforeEach(() => mockClassRepo.findOne.mockClear());

  it.each([undefined, null, '', '   ', 42])('código %p → null y sin consultar la base', async (code) => {
    await expect(service.findByCode(code as any)).resolves.toBeNull();
    expect(mockClassRepo.findOne).not.toHaveBeenCalled();
  });

  it('un código real sí consulta', async () => {
    await expect(service.findByCode('X')).resolves.toMatchObject({ id: 1 });
    expect(mockClassRepo.findOne).toHaveBeenCalledWith({ where: { code: 'X' } });
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
