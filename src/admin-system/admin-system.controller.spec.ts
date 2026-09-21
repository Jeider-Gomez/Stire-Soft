import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { AdminSystemController } from './admin-system.controller';
import { SystemStatusService } from './system-status.service';
import { logBuffer } from './log-buffer';

describe('AdminSystemController', () => {
  const status = { generatedAt: 'ahora' };
  const service = { getStatus: jest.fn().mockResolvedValue(status) } as unknown as SystemStatusService;
  const controller = new AdminSystemController(service);

  beforeEach(() => logBuffer.clear());

  it('es solo para administradores (a nivel de clase, cubre todas sus rutas)', () => {
    expect(new Reflector().get('roles', AdminSystemController)).toEqual(['admin']);
  });

  it('status devuelve lo que calcula el servicio', async () => {
    await expect(controller.status()).resolves.toBe(status);
  });

  it('logs devuelve los más recientes primero, con su capacidad y la advertencia de que es en memoria', () => {
    logBuffer.push('log', 'uno');
    logBuffer.push('error', 'dos');

    const res = controller.logs({});

    expect(res.entries.map((e) => e.message)).toEqual(['dos', 'uno']);
    expect(res.capacity).toBe(500);
    expect(res.note).toMatch(/reinicia/);
  });

  it('logs filtra por nivel: error incluye fatal; info es el nivel log', () => {
    logBuffer.push('log', 'info');
    logBuffer.push('warn', 'aviso');
    logBuffer.push('error', 'error');
    logBuffer.push('fatal', 'fatal');

    expect(controller.logs({ level: 'error' }).entries.map((e) => e.message)).toEqual(['fatal', 'error']);
    expect(controller.logs({ level: 'warn' }).entries.map((e) => e.message)).toEqual(['aviso']);
    expect(controller.logs({ level: 'info' }).entries.map((e) => e.message)).toEqual(['info']);
  });

  it('logs respeta el límite pedido', () => {
    for (let i = 0; i < 10; i++) logBuffer.push('log', `m${i}`);
    expect(controller.logs({ limit: 3 }).entries).toHaveLength(3);
  });
});
