import { ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { TutorCredentialService } from './tutor-credential.service';
import { TutorKeyCryptoService } from './tutor-key-crypto.service';

const KEY = 'AIzaSyFAKE-KEY_1234567890abcdefghijklmnoZ9x2';

describe('TutorCredentialService', () => {
  let service: TutorCredentialService;
  let repo: any;
  let crypto: TutorKeyCryptoService;
  let fetchMock: jest.Mock;
  const realFetch = global.fetch;

  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation(async (row: any) => row),
      create: jest.fn((row: any) => row),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    crypto = new TutorKeyCryptoService({ get: () => 'c'.repeat(64) } as any);
    service = new TutorCredentialService(repo, crypto);
    fetchMock = jest.fn().mockResolvedValue({ status: 200 });
    (global as any).fetch = fetchMock;
  });

  afterEach(() => {
    (global as any).fetch = realFetch;
  });

  it('verifica la clave con Google (cabecera, no URL) y la guarda cifrada con solo los últimos 4 caracteres visibles', async () => {
    const status = await service.save(7, `  ${KEY}  `);

    expect(status).toEqual({ hasKey: true, last4: KEY.slice(-4) });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).not.toContain(KEY);
    expect(init.headers['x-goog-api-key']).toBe(KEY);

    const saved = repo.save.mock.calls[0][0];
    expect(saved.studentId).toBe(7);
    expect(saved.encryptedKey).not.toContain(KEY);
    expect(crypto.decrypt(saved.encryptedKey)).toBe(KEY);
    expect(saved.keyLast4).toBe(KEY.slice(-4));
  });

  it('reemplaza la clave existente en vez de crear una segunda fila', async () => {
    repo.findOne.mockResolvedValue({ id: 3, studentId: 7, encryptedKey: 'vieja', keyLast4: 'old!' });

    await service.save(7, KEY);

    expect(repo.create).not.toHaveBeenCalled();
    const saved = repo.save.mock.calls[0][0];
    expect(saved.id).toBe(3);
    expect(crypto.decrypt(saved.encryptedKey)).toBe(KEY);
  });

  it.each([400, 401, 403])('rechaza con 422 y no guarda nada si Google responde %i', async status => {
    fetchMock.mockResolvedValue({ status });

    await expect(service.save(7, KEY)).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('acepta una clave válida aunque su cuota gratuita esté agotada (429)', async () => {
    fetchMock.mockResolvedValue({ status: 429 });

    await expect(service.save(7, KEY)).resolves.toMatchObject({ hasKey: true });
  });

  it('responde 503 y no guarda nada si no se puede contactar a Google', async () => {
    fetchMock.mockRejectedValue(new Error('timeout'));

    await expect(service.save(7, KEY)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('getStatus nunca expone la clave, solo si existe y sus últimos 4 caracteres', async () => {
    repo.findOne.mockResolvedValue({ studentId: 7, encryptedKey: crypto.encrypt(KEY), keyLast4: KEY.slice(-4) });

    await expect(service.getStatus(7)).resolves.toEqual({ hasKey: true, last4: KEY.slice(-4) });
    repo.findOne.mockResolvedValue(null);
    await expect(service.getStatus(7)).resolves.toEqual({ hasKey: false, last4: null });
  });

  it('getDecryptedKey devuelve la clave original o null si no hay', async () => {
    repo.findOne.mockResolvedValue({ studentId: 7, encryptedKey: crypto.encrypt(KEY), keyLast4: 'Z9x2' });
    await expect(service.getDecryptedKey(7)).resolves.toBe(KEY);

    repo.findOne.mockResolvedValue(null);
    await expect(service.getDecryptedKey(7)).resolves.toBeNull();
  });

  it('remove borra por estudiante', async () => {
    await service.remove(7);
    expect(repo.delete).toHaveBeenCalledWith({ studentId: 7 });
  });
});
