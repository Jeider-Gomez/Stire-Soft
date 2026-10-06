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
    const service = new ClassService(classRepo as never, enrollmentRepo as never, {} as never, {} as never, auth);
    jest.spyOn(service, 'findOne').mockResolvedValue(clase as never);
    return { service, classRepo };
  }

  it('el inicio del estudiante solo trae clases activas', async () => {
    const { service, classRepo } = servicio({ id: 5 });
    await service.findByStudent(20);
    expect(classRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ isActive: true }) }));
  });

  /** Base falsa para eliminar: 1 módulo con 2 lecciones; `trabajo` = estudiantes con trabajo en la clase. */
  function clasePorEliminar(trabajo: number) {
    const consultas: string[] = [];
    const deleteFn = jest.fn().mockResolvedValue(undefined);
    const query = jest.fn(async (sql: string) => {
      consultas.push(sql);
      if (sql.startsWith('SELECT s.id AS seccion')) return [{ seccion: 1, tema: 2, leccion: 3 }, { seccion: 1, tema: 2, leccion: 4 }];
      if (sql.startsWith('SELECT COUNT(DISTINCT q.studentId)')) return [{ n: trabajo }];
      if (sql.includes('FROM enrollments')) return [{ n: 2 }];
      return [{ n: 0 }];
    });
    const manager = { query, delete: deleteFn, transaction: jest.fn(async (fn: (m: unknown) => Promise<unknown>) => fn(manager)) };
    const clase = { id: 5, teacherId: 10, isActive: true };
    const classRepo = { findOne: jest.fn().mockResolvedValue(clase), manager };
    const auth = new AuthorizationService({ findOne: jest.fn().mockResolvedValue(clase) } as never, {} as never);
    const service = new ClassService(classRepo as never, {} as never, {} as never, {} as never, auth);
    jest.spyOn(service, 'findOne').mockResolvedValue(clase as never);
    return { service, consultas, deleteFn };
  }
  const dueno = { id: 10, role: UserRole.DOCENTE } as never;

  it('una clase creada por error (con módulos, sin trabajo de estudiantes) SÍ se elimina, con todo su contenido', async () => {
    const { service, consultas, deleteFn } = clasePorEliminar(0);
    await service.remove(5, dueno);
    expect(consultas.some((c) => c.includes('DELETE FROM learning_units'))).toBe(true);
    expect(consultas.some((c) => c.includes('DELETE FROM entregas WHERE classId'))).toBe(true);
    expect(consultas.some((c) => c.includes('DELETE FROM esquemas_calificacion'))).toBe(true);
    expect(deleteFn).toHaveBeenCalledWith(expect.anything(), { id: 5 });
  });

  it('una clase donde alguien trabajó: 409 y no borra nada', async () => {
    const { service, consultas, deleteFn } = clasePorEliminar(3);
    await expect(service.remove(5, dueno)).rejects.toThrow('3 estudiantes tienen avance aquí. Archiva la clase para no perder su trabajo.');
    expect(consultas.some((c) => c.startsWith('DELETE') || c.startsWith('UPDATE'))).toBe(false);
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it('el impacto de la clase cuenta módulos, lecciones y estudiantes matriculados (que perderán el acceso)', async () => {
    const { service } = clasePorEliminar(0);
    await expect(service.impacto(5, dueno)).resolves.toMatchObject({ modulos: 1, temas: 1, lecciones: 2, matriculados: 2, sePuedeEliminar: true });
  });

  it('el trabajo de estudiantes de la clase incluye proyectos, notas, asistencia, refuerzos y entregas', async () => {
    const { service, consultas } = clasePorEliminar(0);
    await service.impacto(5, dueno);
    const trabajo = consultas.find((c) => c.startsWith('SELECT COUNT(DISTINCT q.studentId)'))!;
    for (const tabla of ['learning_progress', 'submissions', 'proyecto_envios', 'notas_registradas', 'registros_asistencia', 'refuerzo_pasos_hechos', 'entrega_eventos']) {
      expect(trabajo).toContain(tabla);
    }
  });

  it('archivar y restaurar: solo el docente dueño', async () => {
    const { service } = servicio({ id: 5, teacherId: 10, isActive: true });
    await expect(service.archivar(5, { id: 10, role: UserRole.DOCENTE } as never)).resolves.toMatchObject({ isActive: false });
    await expect(service.restaurar(5, { id: 10, role: UserRole.DOCENTE } as never)).resolves.toMatchObject({ isActive: true });
    await expect(service.archivar(5, { id: 99, role: UserRole.DOCENTE } as never)).rejects.toThrow(ForbiddenException);
  });
});
