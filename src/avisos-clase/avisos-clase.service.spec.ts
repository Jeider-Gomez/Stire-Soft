import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AvisosClaseService } from './avisos-clase.service';
import { AvisoInvalidoError, notificacionDeAviso, validarAviso } from './aviso-reglas';
import { User, UserRole } from '../user/entities/user.entity';
import { NotificationType } from '../common/enums/notification-type.enum';

type Deps = ConstructorParameters<typeof AvisosClaseService>;
const docente = { id: 9, role: UserRole.DOCENTE } as User;
const otroDocente = { id: 10, role: UserRole.DOCENTE } as User;
const estudiante = { id: 5, role: UserRole.ESTUDIANTE } as User;

function crear() {
  const guardados: Array<Record<string, unknown>> = [];
  const avisos = {
    create: jest.fn((d: Record<string, unknown>) => d),
    save: jest.fn(async (d: Record<string, unknown>) => { const a = { id: 77, createdAt: new Date(), ...d }; guardados.push(a); return a; }),
    find: jest.fn(async () => guardados),
    findOne: jest.fn(async ({ where }: { where: { id: number } }) => guardados.find((a) => a.id === where.id) ?? null),
    delete: jest.fn(),
  };
  const clases = {
    findOne: jest.fn(async () => ({ id: 3, name: 'Algoritmia G1', isActive: true })),
    find: jest.fn(async () => [{ id: 3, name: 'Algoritmia G1', isActive: true }]),
  };
  const matriculas = { find: jest.fn(async () => [{ studentId: 5, classId: 3 }, { studentId: 6, classId: 3 }]) };
  const autorizacion = {
    assertTeacherOwnsClass: jest.fn(async (u: User) => { if (u.id !== 9) throw new ForbiddenException(); }),
    assertEnrolledInClass: jest.fn(async (u: User) => { if (u.id !== 5) throw new ForbiddenException(); }),
  };
  const notificaciones = { createNotification: jest.fn() };
  const service = new AvisosClaseService(
    avisos as unknown as Deps[0], clases as unknown as Deps[1], matriculas as unknown as Deps[2],
    autorizacion as unknown as Deps[3], notificaciones as unknown as Deps[4],
  );
  return { service, avisos, notificaciones };
}

describe('avisos a la clase: reglas (07/10)', () => {
  it('una citación necesita día y hora; un aviso, título y texto', () => {
    expect(() => validarAviso({ tipo: 'citacion', titulo: 'Reunión', cuerpo: 'En el aula 3' })).toThrow(AvisoInvalidoError);
    expect(() => validarAviso({ titulo: 'Hi', cuerpo: 'x' })).toThrow('título');
    expect(() => validarAviso({ titulo: 'Recuerden', cuerpo: '  ' })).toThrow('Escribe');
    expect(() => validarAviso({ tipo: 'fiesta', titulo: 'Hola', cuerpo: 'x' })).toThrow('tipo');
    const v = validarAviso({ tipo: 'citacion', titulo: ' Reunión de padres ', cuerpo: 'Traer el carné', fechaEvento: '2026-10-15T08:00', lugar: 'Aula 3' });
    expect(v).toMatchObject({ tipo: 'citacion', titulo: 'Reunión de padres', cuerpo: 'Traer el carné', lugar: 'Aula 3' });
    expect(v.fechaEvento).toBeInstanceOf(Date);
  });

  it('la notificación dice el tipo, el título y la clase', () => {
    expect(notificacionDeAviso({ tipo: 'citacion', titulo: 'Reunión', cuerpo: 'Aula 3' }, 'Algoritmia G1')).toEqual({ titulo: 'Citación: Reunión', mensaje: 'Algoritmia G1. Aula 3' });
  });
});

describe('AvisosClaseService', () => {
  it('el docente publica un aviso y a cada estudiante activo le llega una notificación, una sola vez, que lleva a los avisos', async () => {
    const { service, notificaciones } = crear();
    const r = await service.crear(docente, 3, { tipo: 'aviso', titulo: 'No hay clase el lunes', cuerpo: 'Es festivo.' });
    expect(r).toMatchObject({ id: 77, clase: 'Algoritmia G1', titulo: 'No hay clase el lunes', avisados: 2 });
    expect(notificaciones.createNotification).toHaveBeenCalledTimes(2);
    expect(notificaciones.createNotification).toHaveBeenCalledWith(5, 'Aviso: No hay clase el lunes', 'Algoritmia G1. Es festivo.', NotificationType.AVISO,
      { enlace: '/estudiante/mensajes?ver=avisos', clave: 'aviso:77' });
  });

  it('un aviso inválido es un 400 y otro docente no publica en una clase ajena', async () => {
    await expect(crear().service.crear(docente, 3, { titulo: 'x' })).rejects.toThrow(BadRequestException);
    await expect(crear().service.crear(otroDocente, 3, { titulo: 'Aviso', cuerpo: 'x' })).rejects.toThrow(ForbiddenException);
  });

  it('si falla la notificación de un estudiante, los demás igual la reciben', async () => {
    const { service, notificaciones } = crear();
    notificaciones.createNotification.mockRejectedValueOnce(new Error('caída'));
    const r = await service.crear(docente, 3, { titulo: 'Recordatorio', cuerpo: 'Traer el portátil' });
    expect(r.avisados).toBe(1);
  });

  it('el estudiante ve los avisos de sus clases; uno que no está matriculado, no', async () => {
    const { service } = crear();
    await service.crear(docente, 3, { titulo: 'Aviso', cuerpo: 'Hola' });
    expect(await service.mios(estudiante)).toEqual([expect.objectContaining({ clase: 'Algoritmia G1', titulo: 'Aviso' })]);
    await expect(service.deClase({ id: 8, role: UserRole.ESTUDIANTE } as User, 3)).rejects.toThrow(ForbiddenException);
  });

  it('solo el docente de la clase borra un aviso', async () => {
    const { service, avisos } = crear();
    await service.crear(docente, 3, { titulo: 'Aviso', cuerpo: 'Hola' });
    await expect(service.eliminar(otroDocente, 77)).rejects.toThrow(ForbiddenException);
    await expect(service.eliminar(docente, 77)).resolves.toEqual({ eliminado: true });
    expect(avisos.delete).toHaveBeenCalledWith(77);
  });
});
