import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { applyHttpSecurity, isSwaggerEnabled } from './http-security';

@Controller('ping')
class PingController {
  @Get()
  ping() {
    return { ok: true };
  }
}

describe('isSwaggerEnabled', () => {
  it('se publica en desarrollo y pruebas', () => {
    expect(isSwaggerEnabled({ NODE_ENV: 'development' })).toBe(true);
    expect(isSwaggerEnabled({ NODE_ENV: 'test' })).toBe(true);
    expect(isSwaggerEnabled({})).toBe(true);
  });

  it('NO se publica en producción por defecto', () => {
    expect(isSwaggerEnabled({ NODE_ENV: 'production' })).toBe(false);
  });

  it('SWAGGER_ENABLED fuerza el valor en cualquier entorno', () => {
    expect(isSwaggerEnabled({ NODE_ENV: 'production', SWAGGER_ENABLED: 'true' })).toBe(true);
    expect(isSwaggerEnabled({ NODE_ENV: 'development', SWAGGER_ENABLED: 'false' })).toBe(false);
  });

  it('un valor desconocido de SWAGGER_ENABLED no cambia el comportamiento por defecto', () => {
    expect(isSwaggerEnabled({ NODE_ENV: 'production', SWAGGER_ENABLED: 'quizas' })).toBe(false);
    expect(isSwaggerEnabled({ NODE_ENV: 'development', SWAGGER_ENABLED: 'quizas' })).toBe(true);
  });
});

describe('applyHttpSecurity', () => {
  async function buildApp(swaggerEnabled: boolean): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({ controllers: [PingController] }).compile();
    const app = moduleRef.createNestApplication();
    applyHttpSecurity(app, swaggerEnabled);
    await app.init();
    return app;
  }

  it('agrega las cabeceras de seguridad y no revela el framework', async () => {
    const app = await buildApp(false);
    const res = await request(app.getHttpServer()).get('/ping').expect(200);

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['referrer-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
    await app.close();
  });

  it('con Swagger apagado mantiene la política de contenido; con Swagger publicado la quita', async () => {
    const sinSwagger = await buildApp(false);
    const conSwagger = await buildApp(true);

    const a = await request(sinSwagger.getHttpServer()).get('/ping');
    const b = await request(conSwagger.getHttpServer()).get('/ping');

    expect(a.headers['content-security-policy']).toBeDefined();
    expect(b.headers['content-security-policy']).toBeUndefined();
    // Las demás cabeceras siguen presentes aunque se relaje la política de contenido.
    expect(b.headers['x-content-type-options']).toBe('nosniff');
    await sinSwagger.close();
    await conSwagger.close();
  });
});
