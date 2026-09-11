import { ForbiddenException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';
import { EnrollmentStatus } from './enums/enrollment-status.enum';

// Regresión de P1-06: GET /enrollment/class/:classId exponía el roster
// completo (nombres, emails) de CUALQUIER clase a cualquier docente/admin.
describe('EnrollmentService.findByClass — P1-06', () => {
  let service: EnrollmentService;
  const mockEnrollmentRepo = { find: jest.fn().mockResolvedValue([{ id: 1 }]), findOne: jest.fn() };
  const mockClassRepo = { findOne: jest.fn() };
  const mockClassService = {};
  const mockUserService = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10 });
    const authService = new AuthorizationService(mockClassRepo as any, mockEnrollmentRepo as any);
    service = new EnrollmentService(
      mockEnrollmentRepo as any,
      mockClassService as any,
      mockUserService as any,
      authService,
    );
  });

  it('docente A no puede ver el roster de la clase de docente B → 403', async () => {
    const docenteA = { id: 99, role: UserRole.DOCENTE } as any;
    await expect(service.findByClass(5, docenteA)).rejects.toThrow(ForbiddenException);
    expect(mockEnrollmentRepo.find).not.toHaveBeenCalled();
  });

  it('el docente dueño de la clase sí ve su propio roster', async () => {
    const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;
    await expect(service.findByClass(5, docenteDueño)).resolves.toEqual([{ id: 1 }]);
  });

  it('un admin ve el roster de cualquier clase', async () => {
    const admin = { id: 1, role: UserRole.ADMIN } as any;
    await expect(service.findByClass(5, admin)).resolves.toEqual([{ id: 1 }]);
  });
});

describe('EnrollmentService — moderación de matrícula', () => {
  const repository = {
    findOne: jest.fn(),
    save: jest.fn(async (enrollment) => enrollment),
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn((value) => value),
  };
  const classService = { findByCode: jest.fn() };
  const userService = { findOne: jest.fn() };
  const authorization = { assertTeacherOwnsClass: jest.fn() };
  let service: EnrollmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnrollmentService(repository as any, classService as any, userService as any, authorization as any);
    userService.findOne.mockResolvedValue({ id: 7, role: UserRole.ESTUDIANTE });
    classService.findByCode.mockResolvedValue({ id: 3, isActive: true, requiresApproval: true });
    repository.findOne.mockResolvedValue(null);
  });

  it('crea PENDING cuando la clase exige aprobación', async () => {
    const enrollment = await service.joinClass(7, 'ABC');
    expect(enrollment.status).toBe('pending');
  });

  it('aprueba una solicitud y conserva la matrícula', async () => {
    repository.findOne.mockResolvedValue({ id: 'e1', classId: 3, status: 'pending', class: {} });
    const result = await service.changeStatus('e1', EnrollmentStatus.ACTIVE, { id: 10, role: UserRole.DOCENTE } as any);
    expect(result.status).toBe(EnrollmentStatus.ACTIVE);
    expect(authorization.assertTeacherOwnsClass).toHaveBeenCalledWith({ id: 10, role: UserRole.DOCENTE }, 3);
  });

  it('rechaza con 403 si el docente no es dueño', async () => {
    repository.findOne.mockResolvedValue({ id: 'e1', classId: 3, status: 'pending', class: {} });
    authorization.assertTeacherOwnsClass.mockRejectedValue(new ForbiddenException());
    await expect(service.changeStatus('e1', EnrollmentStatus.ACTIVE, { id: 99, role: UserRole.DOCENTE } as any))
      .rejects.toThrow(ForbiddenException);
  });
});
