import { ForbiddenException } from '@nestjs/common';
import { RecursoFallaService, avisoRecursoCaido, diaColombia } from './recurso-falla.service';
import { NotificationType } from '../common/enums/notification-type.enum';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof RecursoFallaService>;
const estudiante = { id: 7, role: UserRole.ESTUDIANTE } as User;

function armar(filas: unknown[] = [{ teacherId: 3, classId: 11, unidad: 'Algoritmos en la vida diaria' }]) {
  const dataSource = { query: jest.fn().mockResolvedValue(filas) };
  const lecciones = { findOne: jest.fn().mockResolvedValue({ id: 5 }) };
  const notificaciones = { createNotification: jest.fn().mockResolvedValue({ id: 1 }) };
  const service = new RecursoFallaService(dataSource as unknown as Deps[0], lecciones as unknown as Deps[1], notificaciones as unknown as Deps[2]);
  return { service, lecciones, notificaciones };
}

describe('RecursoFallaService: el docente sabe que un recurso no funciona (Jeider, 17/10)', () => {
  it('avisa al docente de la clase, con enlace para editar la lección y una sola vez por recurso y día', async () => {
    const { service, notificaciones } = armar();
    await expect(service.reportar(estudiante, 5, '¿Qué es un algoritmo?', 'no-se-puede-ver')).resolves.toEqual({ avisado: true });
    const [docente, titulo, mensaje, tipo, extra] = notificaciones.createNotification.mock.calls[0];
    expect(docente).toBe(3);
    expect(titulo).toBe('Revisa un recurso de «Algoritmos en la vida diaria»');
    expect(mensaje).toContain('YouTube avisó que el video no se puede ver');
    expect(mensaje).toContain('cámbialo por otro o agrega uno más');
    expect(tipo).toBe(NotificationType.AVISO);
    expect(extra.enlace).toBe('/docente/contenidos?classId=11&unitId=5');
    expect(extra.clave).toBe(`recurso-falla:5:¿qué es un algoritmo?:${diaColombia()}`);
  });

  it('si ya se avisó hoy de ese recurso, no repite', async () => {
    const { service, notificaciones } = armar();
    notificaciones.createNotification.mockResolvedValue(null);
    await expect(service.reportar(estudiante, 5, 'Video', 'no-carga')).resolves.toEqual({ avisado: false });
  });

  it('solo un estudiante de la clase puede reportar (la lección se busca con sus permisos)', async () => {
    const { service, lecciones, notificaciones } = armar();
    lecciones.findOne.mockRejectedValue(new ForbiddenException());
    await expect(service.reportar(estudiante, 5, 'Video', 'no-carga')).rejects.toThrow(ForbiddenException);
    expect(notificaciones.createNotification).not.toHaveBeenCalled();
  });

  it('el mensaje dice cómo se supo', () => {
    expect(avisoRecursoCaido('Video', 'L', 'no-carga').mensaje).toMatch(/^Un estudiante dijo que no le carga/);
    expect(diaColombia(new Date('2026-10-17T03:00:00Z'))).toBe('2026-10-16'); // 10 p. m. del 16 en Colombia
  });
});
