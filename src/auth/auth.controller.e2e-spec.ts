import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Regresión de P1-03: /auth/login tiene @Throttle({limit:20, ttl:60000}).
// Prueba real contra el guard de throttling (sin mockear), no solo que el
// decorador exista.
describe('AuthController (e2e) — P1-03 rate limiting en /auth/login', () => {
  let app: INestApplication<App>;

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({ token: 'fake-token' }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('el POST /auth/login número 21 en la misma ventana devuelve 429 (límite real: 20/min)', async () => {
    const credentials = { email: 'x@x.com', password: 'x' };

    for (let i = 1; i <= 20; i++) {
      await request(app.getHttpServer()).post('/auth/login').send(credentials).expect(201);
    }

    await request(app.getHttpServer()).post('/auth/login').send(credentials).expect(429);
  });
});
