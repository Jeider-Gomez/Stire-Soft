import { ForbiddenException } from '@nestjs/common';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { ClassService } from './class.service';
import { UserRole } from '../user/entities/user.entity';

/**
 * Fase 30: el docente archiva una clase para guardarla sin borrar nada. Antes la pantalla mandaba `isActive` en
 * `PATCH /class/:id` y el backend lo rechazaba con 400 (`UpdateClassDto` no lo acepta): ahora hay rutas propias.
 */
describe('clase archivada (Fase 30)', () => {
  const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as never;
  const matricula = { findOne: jest.fn().mockResolvedValue({ id: 1, classId: 5, studentId: 20, status: 'active' }) };

  it('un estudiante matriculado no entra al contenido de una clase archivada', async () => {
    const auth = new AuthorizationService({ findOne: jest.fn().mockResolvedValue({ id: 5, isActive: false }) } as never, matricula as never);
    await expect(auth.assertEnrolledInClass(estudiante, 5)).rejects.toThrow(new ForbiddenException('Tu docente archivó esta clase.'));
  });

  it('en una clase activa sigue entrando como siempre', async () => {
    const auth = new AuthorizationService({ findOne: jest.fn().mockResolvedValue({ id: 5, isActive: true }) } as never, matricula as never);
    await expect(auth.assertEnrolledInClass(estudiante, 5)).resolves.toBeUndefined();
  });

  function servicio(clase: Record<string, unknown>) {
    const classRepo = { findOne: jest.fn().mockResolvedValue(clase), find: jest.fn().mockResolvedValue([]), save: jest.fn((c) => Promise.resolve(c)) };
    const enrollmentRepo = { find: jest.fn().mockResolvedValue([{ classId: 5 }]) };
    const auth = new AuthorizationService({ findOne: jest.fn().mockResolvedValue({ id: 5, teacherId: 10 }) } as never, {} as never);
    const service = new ClassService(classRepo as never, enrollmentRepo as never, {} as never, {} as never, auth, {} as never);
    jest.spyOn(service, 'findOne').mockResolvedValue(clase as never);
    return { service, classRepo };
  }

  it('el inicio del estudiante solo trae clases activas', async () => {
    const { service, classRepo } = servicio({ id: 5 });
    await service.findByStudent(20);
    expect(classRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ isActive: true }) }));
  });

  it('archivar y restaurar: solo el docente dueño', async () => {
    const { service } = servicio({ id: 5, teacherId: 10, isActive: true });
    await expect(service.archivar(5, { id: 10, role: UserRole.DOCENTE } as never)).resolves.toMatchObject({ isActive: false });
    await expect(service.restaurar(5, { id: 10, role: UserRole.DOCENTE } as never)).resolves.toMatchObject({ isActive: true });
    await expect(service.archivar(5, { id: 99, role: UserRole.DOCENTE } as never)).rejects.toThrow(ForbiddenException);
  });
});
