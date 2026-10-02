import { BadRequestException, ConflictException } from '@nestjs/common';
import { ClassService } from './class.service';
import { normalizarCodigo, problemaDelCodigo } from './codigo-clase';

describe('Código de clase: único sin importar cómo se escriba', () => {
  it('«algo web», «ALGO-WEB» y « Algo_Wéb » son el mismo código', () => {
    for (const t of ['algo web', 'ALGO-WEB', ' Algo_Wéb ', 'algo--web', '-algo web-']) expect(normalizarCodigo(t)).toBe('ALGO-WEB');
    expect(normalizarCodigo(undefined)).toBe('');
  });

  it('solo letras sin ñ, números y guiones, de 3 a 30 caracteres', () => {
    expect(problemaDelCodigo('ALGO-203413-G2')).toBeNull();
    expect(problemaDelCodigo('AB')).toMatch('al menos 3');
    expect(problemaDelCodigo('A'.repeat(31))).toMatch('hasta 30');
    expect(problemaDelCodigo(normalizarCodigo('AÑO#1'))).toMatch('solo letras');
  });

  describe('ClassService', () => {
    const repo = { findOne: jest.fn(), create: jest.fn((x: object) => x), save: jest.fn(async (x: object) => ({ id: 7, ...x })) };
    const service = new ClassService(repo as never, {} as never, {} as never, {} as never, {} as never);
    beforeEach(() => jest.clearAllMocks());

    it('guarda el código normalizado y rechaza uno que ya existe con otra escritura', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.create({ name: 'A', code: ' algo web ' }, 9)).resolves.toMatchObject({ code: 'ALGO-WEB', teacherId: 9 });
      repo.findOne.mockResolvedValueOnce({ id: 1, code: 'ALGO-WEB' });
      await expect(service.create({ name: 'B', code: 'Algo_Web' }, 9)).rejects.toThrow(ConflictException);
      expect(repo.findOne).toHaveBeenLastCalledWith({ where: { code: 'ALGO-WEB' } });
    });

    it('dos docentes con el mismo código a la vez: el índice único responde 409, no 500', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      repo.save.mockRejectedValueOnce(Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' }));
      await expect(service.create({ name: 'A', code: 'ALGO-WEB' }, 9)).rejects.toThrow(ConflictException);
    });

    it('un código que no sirve se rechaza con el motivo (400)', async () => {
      await expect(service.create({ name: 'A', code: '##' }, 9)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('codigoDisponible dice si está libre, sin decir de qué clase es', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 3 });
      await expect(service.codigoDisponible('algo web')).resolves.toEqual({ codigo: 'ALGO-WEB', disponible: false, motivo: 'Ya existe una clase con ese código.' });
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.codigoDisponible('PENSAR-7KQ2')).resolves.toEqual({ codigo: 'PENSAR-7KQ2', disponible: true, motivo: null });
      await expect(service.codigoDisponible('x')).resolves.toMatchObject({ disponible: false, motivo: expect.stringMatching('al menos 3') });
    });

    it('el estudiante entra escribiendo el código en minúsculas o con espacios', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 5, code: 'SIM-6V738W' });
      await service.findByCode(' sim-6v738w ');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { code: 'SIM-6V738W' } });
      await expect(service.findByCode('  ')).resolves.toBeNull();
    });
  });
});
