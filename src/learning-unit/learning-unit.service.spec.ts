import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LearningUnitService } from './learning-unit.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';

// Pendiente identificado en
// docs/agentes-ia/claude-code/informes/INFORME_2026-09-11_SESION_01.md §7, punto 2:
// GET /learning-unit/:id no verificaba matrícula/propiedad de clase, a
// diferencia de ContentService.findOne, que sí lo hace. Mismo patrón de
// prueba que content.service.spec.ts — AuthorizationService REAL con repos
// falsos, para probar la cadena de propiedad completa.
describe('LearningUnitService.findOne — BOLA fix', () => {
  let service: LearningUnitService;
  let authService: AuthorizationService;

  const mockLearningUnitRepo = { findOne: jest.fn(), find: jest.fn(), remove: jest.fn() };
  const mockTopicRepo = { findOne: jest.fn() };
  const mockSectionRepo = { findOne: jest.fn() };
  const mockClassRepo = { findOne: jest.fn() };
  const mockEnrollmentRepo = { findOne: jest.fn() };

  const unitId = 24;
  const topicId = 7;
  const sectionId = 3;
  const classId = 5;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthorizationService(mockClassRepo as any, mockEnrollmentRepo as any);
    service = new LearningUnitService(
      mockLearningUnitRepo as any,
      mockTopicRepo as any,
      mockSectionRepo as any,
      authService,
    );

    mockLearningUnitRepo.findOne.mockResolvedValue({ id: unitId, topicId, title: 'Unidad real' });
    mockTopicRepo.findOne.mockResolvedValue({ id: topicId, sectionId });
    mockSectionRepo.findOne.mockResolvedValue({ id: sectionId, classId });
    mockClassRepo.findOne.mockResolvedValue({ id: classId, teacherId: 10 });
  });

  it('docente ajeno (id=99) → 403, no filtra título/descripción de una clase que no dicta', async () => {
    const docenteAjeno = { id: 99, role: UserRole.DOCENTE } as any;
    await expect(service.findOne(unitId, docenteAjeno)).rejects.toThrow(ForbiddenException);
  });

  it('docente dueño (id=10) → ve la unidad', async () => {
    const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;
    await expect(service.findOne(unitId, docenteDueño)).resolves.toMatchObject({ id: unitId });
  });

  it('estudiante NO matriculado en la clase → 403, no puede leer unidades de una clase ajena', async () => {
    mockEnrollmentRepo.findOne.mockResolvedValue(null);
    const estudianteAjeno = { id: 20, role: UserRole.ESTUDIANTE } as any;
    await expect(service.findOne(unitId, estudianteAjeno)).rejects.toThrow(ForbiddenException);
  });

  it('estudiante matriculado → ve la unidad', async () => {
    mockEnrollmentRepo.findOne.mockResolvedValue({ classId, studentId: 20, status: EnrollmentStatus.ACTIVE });
    const estudianteMatriculado = { id: 20, role: UserRole.ESTUDIANTE } as any;
    await expect(service.findOne(unitId, estudianteMatriculado)).resolves.toMatchObject({ id: unitId });
  });

  it('la respuesta dice a qué clase pertenece la unidad (para que la app cambie a esa clase)', async () => {
    mockEnrollmentRepo.findOne.mockResolvedValue({ classId, studentId: 20, status: EnrollmentStatus.ACTIVE });
    const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
    await expect(service.findOne(unitId, estudiante)).resolves.toMatchObject({ id: unitId, classId });
  });

  it('admin: ve cualquier unidad sin verificación de propiedad', async () => {
    const admin = { id: 1, role: UserRole.ADMIN } as any;
    await expect(service.findOne(unitId, admin)).resolves.toMatchObject({ id: unitId });
    expect(mockClassRepo.findOne).not.toHaveBeenCalled();
    expect(mockEnrollmentRepo.findOne).not.toHaveBeenCalled();
  });

  it('unidad inexistente → 404 antes de intentar resolver la clase', async () => {
    mockLearningUnitRepo.findOne.mockResolvedValue(null);
    const docente = { id: 10, role: UserRole.DOCENTE } as any;
    await expect(service.findOne(999, docente)).rejects.toThrow(NotFoundException);
    expect(mockTopicRepo.findOne).not.toHaveBeenCalled();
  });
});

// Revisión del 04/10 (v2.0.0): findByClass filtraba por `topic.classId`, columna que no existe; la consulta fallaba con
// un 500 en producción la primera vez que se usó. La clase está en la sección: unidad → tema → sección → clase.
describe('LearningUnitService.findByClass — llega a la clase por la sección', () => {
  it('une tema y sección y filtra por section.classId', async () => {
    const llamadas: string[] = [];
    const qb = {
      innerJoin: (rel: string, alias: string) => { llamadas.push(`join ${rel} ${alias}`); return qb; },
      where: (cond: string) => { llamadas.push(`where ${cond}`); return qb; },
      orderBy: () => qb,
      getMany: () => Promise.resolve([]),
    };
    const repo = { createQueryBuilder: () => qb };
    const service = new LearningUnitService(repo as never, {} as never, {} as never, {} as never);
    await service.findByClass(5);
    expect(llamadas).toEqual(['join unit.topic topic', 'join topic.section section', 'where section.classId = :classId']);
  });

});

describe('LearningUnitService.mover — a otro tema de la misma clase (27/10)', () => {
  const lecciones = { findOne: jest.fn(), find: jest.fn(), save: jest.fn(async (u: unknown) => u) };
  const temas = { findOne: jest.fn(async ({ where }: { where: { id: number } }) => ({ id: where.id, sectionId: where.id === 9 ? 3 : where.id === 40 ? 30 : 3 })) };
  const secciones = { findOne: jest.fn(async ({ where }: { where: { id: number } }) => ({ id: where.id, classId: where.id === 30 ? 77 : 5 })) };
  const clases = { findOne: jest.fn(async () => ({ id: 5, teacherId: 10 })) };
  const service = new LearningUnitService(lecciones as never, temas as never, secciones as never, new AuthorizationService(clases as never, { findOne: jest.fn() } as never));
  const dueno = { id: 10, role: UserRole.DOCENTE } as Parameters<LearningUnitService['mover']>[2];

  beforeEach(() => lecciones.findOne.mockResolvedValue({ id: 24, topicId: 7, order: 1 }));
  it('pasa al final del tema de destino', async () => {
    lecciones.find.mockResolvedValue([{ id: 1, order: 2 }, { id: 2, order: 6 }]);
    await expect(service.mover(24, 9, dueno)).resolves.toMatchObject({ topicId: 9, order: 7 });
  });
  it('no se mueve a un tema de otra clase', async () => {
    await expect(service.mover(24, 40, dueno)).rejects.toThrow('misma clase');
  });
});
