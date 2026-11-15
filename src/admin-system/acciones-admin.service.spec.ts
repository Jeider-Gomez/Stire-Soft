import { AccionesAdminService } from './acciones-admin.service';

describe('AccionesAdminService', () => {
  const repo = { create: jest.fn((x: unknown) => x), save: jest.fn(), find: jest.fn() };
  const service = new AccionesAdminService(repo as never);
  beforeEach(() => jest.clearAllMocks());

  it('anota quién, qué y sobre qué, con nulos donde no hay dato', async () => {
    await service.registrar({ adminId: 1, accion: 'cambiar_rol', objetivoTipo: 'usuario', objetivoId: 7 });
    expect(repo.save).toHaveBeenCalledWith({ adminId: 1, accion: 'cambiar_rol', objetivoTipo: 'usuario', objetivoId: 7, detalle: null });
  });

  it('recorta el detalle a 300 caracteres', async () => {
    await service.registrar({ adminId: 1, accion: 'x', detalle: 'a'.repeat(400) });
    expect(repo.save.mock.calls[0][0].detalle).toHaveLength(300);
  });

  it('si la base falla, no rompe la acción del administrador', async () => {
    repo.save.mockRejectedValueOnce(new Error('caída'));
    await expect(service.registrar({ adminId: 1, accion: 'x' })).resolves.toBeUndefined();
  });

  it('recientes acota el límite entre 1 y 200, lo más nuevo primero', async () => {
    await service.recientes(9999);
    expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC', id: 'DESC' }, take: 200 });
  });
});
