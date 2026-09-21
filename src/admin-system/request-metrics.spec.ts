import { CallHandler, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { RequestMetricsService } from './request-metrics.service';
import { RequestMetricsInterceptor } from './request-metrics.interceptor';

describe('RequestMetricsService', () => {
  it('sin peticiones no inventa números', () => {
    expect(new RequestMetricsService().snapshot()).toEqual({
      sampled: 0,
      windowSeconds: null,
      p50Ms: null,
      p95Ms: null,
      serverErrorRatePct: null,
    });
  });

  it('calcula percentiles sobre valores que sí ocurrieron', () => {
    const svc = new RequestMetricsService();
    for (let ms = 1; ms <= 100; ms++) svc.record(ms, 200);
    const snap = svc.snapshot();
    expect(snap.sampled).toBe(100);
    expect(snap.p50Ms).toBe(50);
    expect(snap.p95Ms).toBe(95);
  });

  it('cuenta como error solo las respuestas 5xx (no los 4xx del cliente)', () => {
    const svc = new RequestMetricsService();
    svc.record(10, 200);
    svc.record(10, 404);
    svc.record(10, 401);
    svc.record(10, 500);
    expect(svc.snapshot().serverErrorRatePct).toBe(25);
  });

  it('solo conserva las últimas 500 peticiones', () => {
    const svc = new RequestMetricsService();
    for (let i = 0; i < 600; i++) svc.record(i < 100 ? 9999 : 5, 200);
    const snap = svc.snapshot();
    expect(snap.sampled).toBe(500);
    expect(snap.p95Ms).toBe(5); // las 100 lentas más antiguas ya salieron de la ventana
  });
});

describe('RequestMetricsInterceptor', () => {
  const httpContext = (statusCode: number) =>
    ({
      getType: () => 'http',
      switchToHttp: () => ({ getResponse: () => ({ statusCode }) }),
    }) as unknown as ExecutionContext;

  it('registra una petición exitosa con su código', async () => {
    const metrics = new RequestMetricsService();
    const spy = jest.spyOn(metrics, 'record');
    const interceptor = new RequestMetricsInterceptor(metrics);
    const next: CallHandler = { handle: () => of({ ok: true }) };

    await lastValueFrom(interceptor.intercept(httpContext(201), next));

    expect(spy).toHaveBeenCalledWith(expect.any(Number), 201);
  });

  it('registra el código de una HttpException y un 500 para errores desconocidos', async () => {
    const metrics = new RequestMetricsService();
    const spy = jest.spyOn(metrics, 'record');
    const interceptor = new RequestMetricsInterceptor(metrics);

    await expect(
      lastValueFrom(interceptor.intercept(httpContext(200), { handle: () => throwError(() => new ForbiddenException()) })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      lastValueFrom(interceptor.intercept(httpContext(200), { handle: () => throwError(() => new Error('boom')) })),
    ).rejects.toThrow('boom');

    expect(spy.mock.calls.map((c) => c[1])).toEqual([403, 500]);
  });

  it('ignora contextos que no son HTTP', async () => {
    const metrics = new RequestMetricsService();
    const spy = jest.spyOn(metrics, 'record');
    const interceptor = new RequestMetricsInterceptor(metrics);
    const ctx = { getType: () => 'rpc' } as unknown as ExecutionContext;

    await lastValueFrom(interceptor.intercept(ctx, { handle: () => of(1) }));

    expect(spy).not.toHaveBeenCalled();
  });
});
