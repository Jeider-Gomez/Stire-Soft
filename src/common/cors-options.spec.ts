import { Controller, Get, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { applyCors, parseAllowedOrigins } from './cors-options';

@Controller('ping')
class PingController {
  static posts = 0;

  @Get()
  ping() {
    return { ok: true };
  }

  @Post()
  write() {
    PingController.posts += 1;
    return { ok: true };
  }
}

const FRONTEND = 'https://stire-soft.vercel.app';

describe('parseAllowedOrigins', () => {
  it('separa CORS_ORIGIN por comas y quita espacios y vacíos', () => {
    expect(parseAllowedOrigins(' https://a.app , https://b.app ,')).toEqual(['https://a.app', 'https://b.app']);
  });

  it('sin CORS_ORIGIN usa los orígenes del frontend local', () => {
    expect(parseAllowedOrigins(undefined)).toEqual(['http://localhost:5173', 'http://localhost:3000']);
    expect(parseAllowedOrigins('  ')).toEqual(['http://localhost:5173', 'http://localhost:3000']);
  });
});

describe('applyCors (HTTP real)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [PingController] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    applyCors(app, [FRONTEND]);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('el frontend permitido pasa la verificación previa y recibe la cabecera', async () => {
    const res = await request(app.getHttpServer())
      .options('/ping')
      .set('Origin', FRONTEND)
      .set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(FRONTEND);
  });

  it('un origen ajeno recibe 403 (no 500) y sin cabecera CORS', async () => {
    const res = await request(app.getHttpServer())
      .options('/ping')
      .set('Origin', 'https://pagina-ajena.com')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBe(403);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('un POST directo desde un origen ajeno no llega al controlador', async () => {
    const before = PingController.posts;
    const res = await request(app.getHttpServer()).post('/ping').set('Origin', 'https://pagina-ajena.com');
    expect(res.status).toBe(403);
    expect(PingController.posts).toBe(before);
  });

  it('sin cabecera Origin (curl, el propio servidor) la petición pasa', async () => {
    const res = await request(app.getHttpServer()).get('/ping');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
