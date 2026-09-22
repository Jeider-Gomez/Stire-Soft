import { ConflictException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserRole } from '../user/entities/user.entity';
import { DecideRoleRequestDto, RoleRequestsQueryDto } from './dto/role-request.dto';
import { RoleRequestsController } from './role-requests.controller';
import { RoleRequestsService } from './role-requests.service';
import { RegisterDto } from '../auth/dto/register.dto';

function build() {
  const store: any = { request: null, saved: [] as any[], savedUsers: [] as any[] };
  const manager = {
    findOne: jest.fn().mockImplementation(async () => store.request),
    save: jest.fn().mockImplementation(async (entity: any, row?: any) => {
      (row?.email !== undefined ? store.savedUsers : store.saved).push(row ?? entity);
      return row ?? entity;
    }),
  };
  const repo: any = {
    findOne: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((row: any) => ({ id: 1, createdAt: new Date(), reviewedAt: null, reviewNote: null, ...row })),
    save: jest.fn(async (row: any) => row),
    manager: { transaction: (fn: any) => fn(manager) },
  };
  const service = new RoleRequestsService(repo);
  jest.spyOn((service as any).logger, 'log').mockImplementation(() => undefined);
  return { service, repo, manager, store };
}

const pendingRequest = (role: UserRole = UserRole.ESTUDIANTE) => ({
  id: 5,
  status: 'pending',
  requestedRole: 'docente',
  reason: null,
  createdAt: new Date(),
  reviewedAt: null,
  reviewNote: null,
  user: { id: 9, email: 'a@unicor.edu.co', fullName: 'A', role },
});

describe('RoleRequestsService', () => {
  describe('create', () => {
    it('crea la solicitud pendiente con el motivo recortado', async () => {
      const { service, repo } = build();
      const view = await service.create(9, '  Docente de Algoritmos  ');
      expect(view).toMatchObject({ status: 'pending', requestedRole: 'docente', reason: 'Docente de Algoritmos' });
      expect(repo.save).toHaveBeenCalled();
    });

    it('si ya tiene una pendiente responde 409 y no crea otra', async () => {
      const { service, repo } = build();
      repo.findOne.mockResolvedValue({ id: 1, status: 'pending' });
      await expect(service.create(9)).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('cualquier correo puede pedir el rol docente, sin restricción de dominio', async () => {
      const { service } = build();
      await expect(service.create(9)).resolves.toMatchObject({ status: 'pending' });
    });
  });

  describe('decide', () => {
    it('aprobar convierte a un estudiante en docente y deja constancia de quién y cuándo', async () => {
      const { service, store } = build();
      store.request = pendingRequest();

      const view = await service.decide(5, { decision: 'approve', note: '  ok  ' }, 1);

      expect(store.request.user.role).toBe(UserRole.DOCENTE);
      expect(view).toMatchObject({ status: 'approved', reviewNote: 'ok' });
      expect(store.request.reviewedById).toBe(1);
      expect(store.request.reviewedAt).toBeInstanceOf(Date);
    });

    it('rechazar NO cambia el rol', async () => {
      const { service, store } = build();
      store.request = pendingRequest();

      await service.decide(5, { decision: 'reject' }, 1);

      expect(store.request.user.role).toBe(UserRole.ESTUDIANTE);
      expect(store.request.status).toBe('rejected');
    });

    it('aprobar a alguien que ya es admin no lo degrada a docente', async () => {
      const { service, store } = build();
      store.request = pendingRequest(UserRole.ADMIN);

      await service.decide(5, { decision: 'approve' }, 1);

      expect(store.request.user.role).toBe(UserRole.ADMIN);
    });

    it('una solicitud ya resuelta responde 409 y no se vuelve a decidir', async () => {
      const { service, store } = build();
      store.request = { ...pendingRequest(), status: 'approved' };
      await expect(service.decide(5, { decision: 'reject' }, 1)).rejects.toThrow(ConflictException);
      expect(store.request.status).toBe('approved');
    });

    it('una solicitud inexistente responde 404', async () => {
      const { service, store } = build();
      store.request = null;
      await expect(service.decide(99, { decision: 'approve' }, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('filtra por estado y devuelve el solicitante SIN contraseña ni campos de más', async () => {
      const { service, repo } = build();
      repo.find.mockResolvedValue([{ ...pendingRequest(), user: { id: 9, email: 'a@x.com', fullName: 'A', role: 'estudiante', password: 'hash' } }]);

      const rows = await service.list('pending');

      expect(repo.find.mock.calls[0][0].where).toEqual({ status: 'pending' });
      expect(rows[0].user).toEqual({ id: 9, email: 'a@x.com', fullName: 'A', role: 'estudiante' });
      expect(JSON.stringify(rows)).not.toContain('hash');
    });
  });
});

describe('RoleRequestsController', () => {
  it('«mis solicitudes» usa el id del JWT, nunca uno de la URL', async () => {
    const service: any = { findMine: jest.fn().mockResolvedValue(null) };
    const controller = new RoleRequestsController(service);
    await expect(controller.findMine({ id: 42 } as any)).resolves.toEqual({ request: null });
    expect(service.findMine).toHaveBeenCalledWith(42);
  });

  it('quién decide queda registrado con el id del admin autenticado', async () => {
    const service: any = { decide: jest.fn().mockResolvedValue({}) };
    const controller = new RoleRequestsController(service);
    await controller.decide(5, { decision: 'approve' }, { id: 1 } as any);
    expect(service.decide).toHaveBeenCalledWith(5, { decision: 'approve' }, 1);
  });
});

describe('validación de entrada', () => {
  const errors = async (cls: any, plain: object) => (await validate(plainToInstance(cls, plain))).flatMap((e) => Object.keys(e.constraints ?? {}));

  it('decision solo acepta approve o reject', async () => {
    expect(await errors(DecideRoleRequestDto, { decision: 'approve' })).toEqual([]);
    expect(await errors(DecideRoleRequestDto, { decision: 'delete' })).not.toEqual([]);
    expect(await errors(DecideRoleRequestDto, { decision: 'approve', note: 'x'.repeat(301) })).not.toEqual([]);
  });

  it('el filtro de estado solo acepta los tres estados', async () => {
    expect(await errors(RoleRequestsQueryDto, { status: 'pending' })).toEqual([]);
    expect(await errors(RoleRequestsQueryDto, { status: 'todos' })).not.toEqual([]);
    expect(await errors(RoleRequestsQueryDto, {})).toEqual([]);
  });

  it('el registro acepta requestedRole estudiante/docente y rechaza cualquier otro, incluido admin', async () => {
    const base = { email: 'a@x.com', password: 'Clave1234!', fullName: 'Ana' };
    expect(await errors(RegisterDto, { ...base, requestedRole: 'docente' })).toEqual([]);
    expect(await errors(RegisterDto, { ...base, requestedRole: 'estudiante' })).toEqual([]);
    expect(await errors(RegisterDto, { ...base })).toEqual([]);
    expect(await errors(RegisterDto, { ...base, requestedRole: 'admin' })).not.toEqual([]);
  });
});
