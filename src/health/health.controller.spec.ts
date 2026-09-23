import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('base de datos viva → {status:"ok"}', async () => {
    const c = new HealthController({ query: jest.fn().mockResolvedValue([{ 1: 1 }]) } as any);
    await expect(c.check()).resolves.toEqual({ status: 'ok' });
  });

  it('base de datos caída → 503 sin detalles internos', async () => {
    const c = new HealthController({ query: jest.fn().mockRejectedValue(new Error('ECONNREFUSED 10.0.0.5')) } as any);
    await expect(c.check()).rejects.toThrow(ServiceUnavailableException);
    await expect(c.check()).rejects.toMatchObject({ response: { status: 'error' } });
  });
});
