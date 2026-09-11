import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LearningUnitService } from './learning-unit.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';

// Pendiente identificado en
// docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md §7, punto 2:
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
