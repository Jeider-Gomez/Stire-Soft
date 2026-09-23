import { ForbiddenException } from '@nestjs/common';
import { SectionService } from './section.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';

// Regresión de P1-06: antes solo `create` verificaba propiedad de la clase;
// update/togglePublish/remove quedaban abiertos a cualquier docente/admin.
describe('SectionService — P1-06', () => {
  let service: SectionService;
  const mockSectionRepo = {
    findOne: jest.fn(),
    save: jest.fn((s) => Promise.resolve(s)),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  const mockClassRepo = { findOne: jest.fn() };
  const mockEnrollmentRepo = { findOne: jest.fn() };
  const mockClassService = {};

  const sectionOfClass5 = { id: 1, classId: 5, title: 'Sección', isPublished: false };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSectionRepo.findOne.mockResolvedValue({ ...sectionOfClass5 });
    mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10 });
    const authService = new AuthorizationService(mockClassRepo as any, mockEnrollmentRepo as any);
    service = new SectionService(mockSectionRepo as any, mockClassService as any, authService);
  });

  it('update: docente A no puede editar sección de clase de docente B → 403', async () => {
    const docenteA = { id: 99, role: UserRole.DOCENTE } as any;
    await expect(service.update(1, { title: 'Hackeado' } as any, docenteA)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('togglePublish: docente A no puede publicar/despublicar sección ajena → 403', async () => {
    const docenteA = { id: 99, role: UserRole.DOCENTE } as any;
    await expect(service.togglePublish(1, docenteA)).rejects.toThrow(ForbiddenException);
  });

  it('remove: docente A no puede eliminar sección ajena → 403', async () => {
    const docenteA = { id: 99, role: UserRole.DOCENTE } as any;
    await expect(service.remove(1, docenteA)).rejects.toThrow(ForbiddenException);
    expect(mockSectionRepo.remove).not.toHaveBeenCalled();
  });

  it('el docente dueño sí puede editar/publicar/eliminar su sección', async () => {
    const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;
    await expect(service.update(1, { title: 'Nuevo' } as any, docenteDueño)).resolves.toBeDefined();
    await expect(service.togglePublish(1, docenteDueño)).resolves.toBeDefined();
    await expect(service.remove(1, docenteDueño)).resolves.toBeUndefined();
  });
});

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSectionDto } from './dto/update-section.dto';
import { UpdateContentDto } from '../content/dto/update-content.dto';
import { UpdateLearningUnitDto } from '../learning-unit/dto/update-learning-unit.dto';

// Simulación 23/09: la propiedad se verificaba solo en el ORIGEN; un PATCH con
// `classId`/`learningUnitId`/`topicId` movía el elemento a la clase de otro docente.
describe('DTOs de actualización — no permiten cambiar el padre', () => {
  const rejects = async (cls: any, body: object) =>
    (await validate(plainToInstance(cls, body), { whitelist: true, forbidNonWhitelisted: true })).length > 0;

  it('UpdateSectionDto rechaza classId; acepta título', async () => {
    expect(await rejects(UpdateSectionDto, { classId: 99 })).toBe(true);
    expect(await rejects(UpdateSectionDto, { title: 'Nuevo' })).toBe(false);
  });
  it('UpdateContentDto rechaza learningUnitId; acepta título/cuerpo', async () => {
    expect(await rejects(UpdateContentDto, { learningUnitId: 99 })).toBe(true);
    expect(await rejects(UpdateContentDto, { title: 'T', body: 'B' })).toBe(false);
  });
  it('UpdateLearningUnitDto rechaza topicId; acepta isActive', async () => {
    expect(await rejects(UpdateLearningUnitDto, { topicId: 99 })).toBe(true);
    expect(await rejects(UpdateLearningUnitDto, { isActive: false })).toBe(false);
  });
});

describe('SectionService.findByClassFor — quién ve qué', () => {
  const tree = [
    {
      id: 1, classId: 5, isPublished: true,
      topics: [
        { id: 1, isActive: true, learningUnits: [{ id: 1, isActive: true, activities: [{ id: 1, status: 'published' }, { id: 2, status: 'draft' }] }, { id: 2, isActive: false, activities: [] }] },
        { id: 2, isActive: false, learningUnits: [] },
      ],
    },
    { id: 2, classId: 5, isPublished: false, topics: [] },
  ];
  const qb: any = { leftJoinAndSelect: () => qb, where: () => qb, orderBy: () => qb, addOrderBy: () => qb, getMany: async () => JSON.parse(JSON.stringify(tree)) };
  const classRepo = { findOne: jest.fn().mockResolvedValue({ id: 5, teacherId: 10 }) };
  const enrollmentRepo = { findOne: jest.fn() };
  const service = new SectionService({ createQueryBuilder: () => qb } as any, {} as any, new AuthorizationService(classRepo as any, enrollmentRepo as any));

  it('estudiante matriculado: solo módulos publicados, temas/unidades activos y actividades publicadas', async () => {
    enrollmentRepo.findOne.mockResolvedValue({ id: 'e' });
    const res = await service.findByClassFor(5, { id: 20, role: UserRole.ESTUDIANTE } as any);
    expect(res.map((s) => s.id)).toEqual([1]);
    expect(res[0].topics.map((t) => t.id)).toEqual([1]);
    expect(res[0].topics[0].learningUnits.map((u) => u.id)).toEqual([1]);
    expect(res[0].topics[0].learningUnits[0].activities.map((a) => a.id)).toEqual([1]);
  });

  it('estudiante SIN matrícula → 403', async () => {
    enrollmentRepo.findOne.mockResolvedValue(null);
    await expect(service.findByClassFor(5, { id: 21, role: UserRole.ESTUDIANTE } as any)).rejects.toThrow(ForbiddenException);
  });

  it('docente dueño ve todo, borradores incluidos; docente ajeno → 403', async () => {
    const res = await service.findByClassFor(5, { id: 10, role: UserRole.DOCENTE } as any);
    expect(res).toHaveLength(2);
    await expect(service.findByClassFor(5, { id: 99, role: UserRole.DOCENTE } as any)).rejects.toThrow(ForbiddenException);
  });
});
