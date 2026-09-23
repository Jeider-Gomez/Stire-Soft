import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { UserRole } from '../../user/entities/user.entity';
import { EnrollmentStatus } from '../../enrollment/enums/enrollment-status.enum';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  const mockClassRepo = { findOne: jest.fn() };
  const mockEnrollmentRepo = { findOne: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthorizationService(mockClassRepo as any, mockEnrollmentRepo as any);
  });

  describe('assertTeacherOwnsClass', () => {
    it('admin siempre pasa, sin consultar el repositorio', async () => {
      const admin = { id: 1, role: UserRole.ADMIN } as any;
      await expect(service.assertTeacherOwnsClass(admin, 999)).resolves.toBeUndefined();
      expect(mockClassRepo.findOne).not.toHaveBeenCalled();
    });

    it('docente dueño de la clase pasa', async () => {
      mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10 });
      const docente = { id: 10, role: UserRole.DOCENTE } as any;
      await expect(service.assertTeacherOwnsClass(docente, 5)).resolves.toBeUndefined();
    });

    it('docente A intentando sobre la clase de docente B → 403', async () => {
      mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10 });
      const docenteB = { id: 99, role: UserRole.DOCENTE } as any;
      await expect(service.assertTeacherOwnsClass(docenteB, 5)).rejects.toThrow(ForbiddenException);
    });

    it('clase inexistente → 404', async () => {
      mockClassRepo.findOne.mockResolvedValue(null);
      const docente = { id: 10, role: UserRole.DOCENTE } as any;
      await expect(service.assertTeacherOwnsClass(docente, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assertEnrolledInClass', () => {
    it('admin siempre pasa', async () => {
      const admin = { id: 1, role: UserRole.ADMIN } as any;
      await expect(service.assertEnrolledInClass(admin, 999)).resolves.toBeUndefined();
    });

    it('estudiante matriculado activo pasa', async () => {
      mockEnrollmentRepo.findOne.mockResolvedValue({ classId: 5, studentId: 20, status: EnrollmentStatus.ACTIVE });
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
      await expect(service.assertEnrolledInClass(estudiante, 5)).resolves.toBeUndefined();
    });

    it('estudiante no matriculado → 403', async () => {
      mockEnrollmentRepo.findOne.mockResolvedValue(null);
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
      await expect(service.assertEnrolledInClass(estudiante, 5)).rejects.toThrow(ForbiddenException);
    });
  });
});

describe('AuthorizationService.assertCanMessage', () => {
  const build = (sharedCount: number) => {
    const qb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(sharedCount),
    };
    const enrollmentRepo = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    return { service: new AuthorizationService({} as any, enrollmentRepo as any), qb, enrollmentRepo };
  };

  it('admin puede escribirle a cualquiera sin consultar nada', async () => {
    const { service, enrollmentRepo } = build(0);
    await expect(service.assertCanMessage({ id: 1, role: UserRole.ADMIN } as any, 5)).resolves.toBeUndefined();
    expect(enrollmentRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('estudiante → docente de una clase donde tiene matrícula ACTIVA: pasa', async () => {
    const { service, qb } = build(1);
    await expect(service.assertCanMessage({ id: 2, role: UserRole.ESTUDIANTE } as any, 10)).resolves.toBeUndefined();
    expect(qb.andWhere).toHaveBeenCalledWith('e.status = :status', { status: EnrollmentStatus.ACTIVE });
    expect(qb.andWhere).toHaveBeenCalledWith('c.teacherId = :teacherId', { teacherId: 10 });
  });

  it.each([
    ['estudiante → otro estudiante o admin o docente ajeno', UserRole.ESTUDIANTE],
    ['docente → alguien que no es estudiante suyo', UserRole.DOCENTE],
  ])('%s → 403', async (_n, role) => {
    const { service } = build(0);
    await expect(service.assertCanMessage({ id: 2, role } as any, 99)).rejects.toThrow(ForbiddenException);
  });
});
