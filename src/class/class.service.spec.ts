import { BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ClassService } from './class.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateClassDto } from './dto/update-class.dto';

// Regresión de P1-06: DELETE /class/:id solo era validado el UPDATE, no el
// remove. Usa un AuthorizationService real (con repos falsos).
describe('ClassService.remove — P1-06', () => {
  let service: ClassService;
  const mockClassRepo = { findOne: jest.fn(), remove: jest.fn().mockResolvedValue(undefined), manager: { count: jest.fn() } };
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
    mockClassRepo.manager.count.mockResolvedValue(0);
    const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;

    await expect(service.remove(5, docenteDueño)).resolves.toBeUndefined();
    expect(mockClassRepo.remove).toHaveBeenCalled();
  });

  // Antes respondía 500 («Cannot delete or update a parent row»): las unidades no se borran en cascada con sus temas.
  it('una clase con contenido no se borra: 409 con un mensaje que explica por qué', async () => {
    mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10, teacher: {} });
    mockClassRepo.manager.count.mockResolvedValue(3);
    const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;

    await expect(service.remove(5, docenteDueño)).rejects.toThrow(ConflictException);
    await expect(service.remove(5, docenteDueño)).rejects.toThrow(/tiene contenido/);
    expect(mockClassRepo.remove).not.toHaveBeenCalled();
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

// F24-09 (auditoría de la Fase 24): PATCH /class/:id respondía 409 al docente ajeno y dejaba cambiar el código por API (duplicado → 500).
describe('ClassService.update — F24-09', () => {
  const classRepo = { findOne: jest.fn(), save: jest.fn((c: unknown) => Promise.resolve(c)) };
  const auth = new AuthorizationService(classRepo as any, { findOne: jest.fn() } as any);
  const service = new ClassService(classRepo as any, {} as any, {} as any, {} as any, auth);

  beforeEach(() => {
    jest.clearAllMocks();
    classRepo.findOne.mockResolvedValue({ id: 5, name: 'Vieja', code: 'ABC', teacherId: 10, teacher: {} });
  });

  it('un docente ajeno recibe 403 (no 409) y no se guarda nada', async () => {
    await expect(service.update(5, { name: 'Nueva' }, { id: 99, role: UserRole.DOCENTE } as any)).rejects.toThrow(ForbiddenException);
    expect(classRepo.save).not.toHaveBeenCalled();
  });

  it('el docente dueño actualiza el nombre', async () => {
    const out = await service.update(5, { name: 'Nueva' }, { id: 10, role: UserRole.DOCENTE } as any);
    expect(out.name).toBe('Nueva');
    expect(classRepo.save).toHaveBeenCalledTimes(1);
  });

  it('el DTO de actualización rechaza el campo `code` (el código de ingreso no se edita) y acepta el resto', async () => {
    const check = (body: object) =>
      validate(plainToInstance(UpdateClassDto, body), { whitelist: true, forbidNonWhitelisted: true });
    const withCode = await check({ name: 'X', code: 'OTRO' });
    expect(withCode.some((e) => e.property === 'code')).toBe(true);
    expect(await check({ name: 'X', description: 'y' })).toHaveLength(0);
  });
});

// Organización académica (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): la clase guarda su asignatura, periodo y grupo.
describe('ClassService — asignatura, periodo y grupo de la clase', () => {
  const asignatura = { id: 3, nombre: 'Fundamentos de Algoritmia' };
  const buscarAsignatura = jest.fn();
  const classRepo = {
    findOne: jest.fn(),
    create: jest.fn((x: object) => x),
    save: jest.fn(async (x: object) => x),
    manager: { findOne: buscarAsignatura },
  };
  const auth = { assertTeacherOwnsClass: jest.fn() };
  type Args = ConstructorParameters<typeof ClassService>;
  const service = new ClassService(classRepo as unknown as Args[0], {} as Args[1], {} as Args[2], {} as Args[3], auth as unknown as Args[4]);

  beforeEach(() => jest.clearAllMocks());

  it('al crear guarda la asignatura (con su relación), el periodo y el grupo sin espacios', async () => {
    classRepo.findOne.mockResolvedValue(null);
    buscarAsignatura.mockResolvedValue(asignatura);
    const c = await service.create({ name: 'Algoritmia', code: 'ALGO-2034', asignaturaId: 3, periodo: ' 2026-2 ', grupo: ' Grupo 2 ' }, 10);
    expect(c).toMatchObject({ asignaturaId: 3, asignatura, periodo: '2026-2', grupo: 'Grupo 2' });
  });

  it('una asignatura que no existe es un 400 que dice qué hacer', async () => {
    classRepo.findOne.mockResolvedValue(null);
    buscarAsignatura.mockResolvedValue(null);
    await expect(service.create({ name: 'A', code: 'ALGO-2035', asignaturaId: 99 }, 10)).rejects.toThrow('Esa asignatura no existe');
  });

  it('al editar, null quita la asignatura aunque estuviera cargada, y el texto vacío quita periodo y grupo', async () => {
    classRepo.findOne.mockResolvedValue({ id: 1, teacherId: 10, asignaturaId: 3, asignatura, periodo: '2026-1', grupo: 'G1' });
    const c = await service.update(1, { asignaturaId: null, periodo: '', grupo: '  ' }, { id: 10, role: UserRole.DOCENTE } as Parameters<ClassService['update']>[2]);
    expect(c).toMatchObject({ asignaturaId: null, asignatura: null, periodo: null, grupo: null });
  });

  it('el periodo se escribe como 2026-2 o 2026', async () => {
    const mal = await validate(plainToInstance(UpdateClassDto, { periodo: 'segundo de 2026' }));
    expect(mal.map((e) => e.property)).toEqual(['periodo']);
    expect(await validate(plainToInstance(UpdateClassDto, { periodo: '2026-2', grupo: 'Grupo 2', asignaturaId: null }))).toHaveLength(0);
  });
});

// Plantillas por alcance (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3).
describe('ClassService — con quién se comparte el contenido', () => {
  const buscarAsignatura = jest.fn();
  const classRepo = { findOne: jest.fn(), create: jest.fn((x: object) => x), save: jest.fn(async (x: object) => x), manager: { findOne: buscarAsignatura } };
  type Args = ConstructorParameters<typeof ClassService>;
  const service = new ClassService(classRepo as unknown as Args[0], {} as Args[1], {} as Args[2], {} as Args[3], { assertTeacherOwnsClass: jest.fn() } as unknown as Args[4]);
  const docente = { id: 10, role: UserRole.DOCENTE } as Parameters<ClassService['update']>[2];
  const ALGO = { id: 1, nombre: 'Fundamentos de Algoritmia', programId: 10, institutionId: 100, program: { facultad: 'Educación' } };

  beforeEach(() => jest.clearAllMocks());

  it('el alcance y el antiguo sí/no siempre coinciden', async () => {
    classRepo.findOne.mockResolvedValue({ id: 1, teacherId: 10, asignatura: ALGO, alcancePlantilla: 'nadie', compartidaComoPlantilla: false });
    await expect(service.update(1, { alcancePlantilla: 'programa', enfoque: '  Con JavaScript  ' }, docente)).resolves.toMatchObject({
      alcancePlantilla: 'programa', compartidaComoPlantilla: true, enfoque: 'Con JavaScript',
    });
    classRepo.findOne.mockResolvedValue({ id: 1, teacherId: 10, asignatura: null, alcancePlantilla: 'nadie' });
    await expect(service.update(1, { compartidaComoPlantilla: true }, docente)).resolves.toMatchObject({ alcancePlantilla: 'todos' });
    await expect(service.update(1, { alcancePlantilla: 'nadie' }, docente)).resolves.toMatchObject({ compartidaComoPlantilla: false });
  });

  it('compartir con la asignatura exige que la clase la tenga: 400 que dice qué hacer', async () => {
    classRepo.findOne.mockResolvedValue({ id: 1, teacherId: 10, asignatura: null, alcancePlantilla: 'nadie' });
    await expect(service.update(1, { alcancePlantilla: 'asignatura' }, docente)).rejects.toThrow('primero elige la asignatura');
  });

  it('quitar la asignatura de una clase compartida con su asignatura se rechaza (dejaría de verse sin aviso)', async () => {
    classRepo.findOne.mockResolvedValue({ id: 1, teacherId: 10, asignaturaId: 1, asignatura: ALGO, alcancePlantilla: 'asignatura', compartidaComoPlantilla: true });
    await expect(service.update(1, { asignaturaId: null }, docente)).rejects.toThrow(BadRequestException);
  });
});

// Logros y medallas configurables por clase (docs/DISENO_LOGROS.md §6).
describe('ClassService — logros de la clase', () => {
  const classRepo = { findOne: jest.fn(), create: jest.fn((x: object) => x), save: jest.fn(async (x: object) => x), manager: { findOne: jest.fn() } };
  type Args = ConstructorParameters<typeof ClassService>;
  const service = new ClassService(classRepo as unknown as Args[0], {} as Args[1], {} as Args[2], {} as Args[3], { assertTeacherOwnsClass: jest.fn() } as unknown as Args[4]);
  const docente = { id: 10, role: UserRole.DOCENTE } as Parameters<ClassService['update']>[2];
  beforeEach(() => classRepo.findOne.mockResolvedValue({ id: 1, teacherId: 10, logrosActivos: true, categoriasLogro: null, alcancePlantilla: 'nadie' }));

  it('guarda las categorías elegidas como texto, en el orden del catálogo; todas = vacío (todas)', async () => {
    await expect(service.update(1, { categoriasLogro: ['memoria', 'dominio', 'dominio'] }, docente)).resolves.toMatchObject({ categoriasLogro: 'dominio,memoria' });
    const todas = ['constancia', 'practica', 'dominio', 'desafio', 'persistencia', 'memoria'];
    await expect(service.update(1, { categoriasLogro: todas }, docente)).resolves.toMatchObject({ categoriasLogro: null });
    await expect(service.update(1, { logrosActivos: false }, docente)).resolves.toMatchObject({ logrosActivos: false });
  });
  it('una categoría desconocida es un 400 del validador', async () => {
    const errores = await validate(plainToInstance(UpdateClassDto, { categoriasLogro: ['puntos'] }));
    expect(errores.map((e) => e.property)).toEqual(['categoriasLogro']);
  });
});
