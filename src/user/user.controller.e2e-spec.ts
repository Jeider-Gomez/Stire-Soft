import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext, CanActivate } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';

// Regresión de P0-02 (escalada de privilegios vía mass assignment).
// Usa los guards REALES (JwtAuthGuard sustituido por uno que simula un JWT ya
// validado, RolesGuard real) y el ValidationPipe global REAL, exactamente
// como está configurado en main.ts, para probar la cadena completa
// DTO + Guard + Ruta sin depender de una base de datos real.
describe('UserController (e2e) — P0-02 escalada de privilegios', () => {
  let app: INestApplication<App>;
  let currentUser: { id: number; email: string; role: UserRole };

  const mockUserService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn().mockResolvedValue({ id: 999, role: UserRole.ESTUDIANTE }),
    updateProfile: jest
      .fn()
      .mockImplementation((id: number, dto: { fullName?: string }) =>
        Promise.resolve({ id, fullName: dto.fullName, role: UserRole.ESTUDIANTE }),
      ),
    changePassword: jest.fn(),
    remove: jest.fn(),
    updateRole: jest.fn(),
    addAffiliation: jest.fn(),
  };

  // Simula un JwtAuthGuard que ya validó el token y adjuntó req.user —
  // el valor real lo controla cada test vía `currentUser`.
  class FakeJwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      req.user = currentUser;
      return true;
    }
  }

  beforeEach(async () => {
    currentUser = { id: 1, email: 'estudiante@stire.local', role: UserRole.ESTUDIANTE };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: APP_GUARD, useClass: FakeJwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Misma configuración exacta que src/main.ts.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('PATCH /users/me con {"role":"admin"} es rechazado con 400 y el servicio NUNCA se invoca con ese campo', async () => {
    await request(app.getHttpServer())
      .patch('/users/me')
      .send({ role: 'admin' })
      .expect(400);

    expect(mockUserService.updateProfile).not.toHaveBeenCalled();
  });

  it('PATCH /users/me con {"password":"nueva"} sobre un tercero también es rechazado con 400 (campo no declarado en UpdateProfileDto)', async () => {
    await request(app.getHttpServer())
      .patch('/users/me')
      .send({ password: 'NuevaClave123' })
      .expect(400);

    expect(mockUserService.updateProfile).not.toHaveBeenCalled();
  });

  it('PATCH /users/me con {"fullName":"Nuevo Nombre"} SÍ funciona y usa el id del token, no uno del body', async () => {
    await request(app.getHttpServer())
      .patch('/users/me')
      .send({ fullName: 'Nuevo Nombre' })
      .expect(200);

    expect(mockUserService.updateProfile).toHaveBeenCalledWith(1, { fullName: 'Nuevo Nombre' });
  });

  it('PATCH /users/:id (id ajeno) con token de estudiante devuelve 403 — RolesGuard exige admin', async () => {
    await request(app.getHttpServer())
      .patch('/users/999')
      .send({ fullName: 'Intento de edicion ajena' })
      .expect(403);

    expect(mockUserService.update).not.toHaveBeenCalled();
  });

  it('PATCH /users/:id con {"role":"admin"} como estudiante también devuelve 403 antes de llegar al DTO admin', async () => {
    await request(app.getHttpServer())
      .patch('/users/1')
      .send({ role: 'admin' })
      .expect(403);

    expect(mockUserService.update).not.toHaveBeenCalled();
  });

  it('PATCH /users/:id como admin SÍ puede cambiar el rol de un tercero (ruta administrativa correcta)', async () => {
    currentUser = { id: 5, email: 'admin@stire.local', role: UserRole.ADMIN };

    await request(app.getHttpServer())
      .patch('/users/999')
      .send({ role: 'docente' })
      .expect(200);

    // El tercer argumento es quién lo pide: el servicio lo usa para impedir que un admin se cambie a sí mismo.
    expect(mockUserService.update).toHaveBeenCalledWith(999, { role: 'docente' }, 5);
  });

  it('PATCH /users/:id/role valida el rol: un valor inventado devuelve 400 y no llega al servicio', async () => {
    currentUser = { id: 5, email: 'admin@stire.local', role: UserRole.ADMIN };

    await request(app.getHttpServer()).patch('/users/999/role').send({ role: 'superadmin' }).expect(400);
    await request(app.getHttpServer()).patch('/users/999/role').send({}).expect(400);

    expect(mockUserService.updateRole).not.toHaveBeenCalled();
  });

  it('PATCH /users/:id/role con un rol válido pasa el id del admin que lo pide', async () => {
    currentUser = { id: 5, email: 'admin@stire.local', role: UserRole.ADMIN };

    await request(app.getHttpServer()).patch('/users/999/role').send({ role: 'docente' }).expect(200);

    expect(mockUserService.updateRole).toHaveBeenCalledWith(999, 'docente', 5);
  });

  it('PATCH /users/:id como docente también devuelve 403 — la ruta es exclusiva de admin', async () => {
    currentUser = { id: 2, email: 'docente@stire.local', role: UserRole.DOCENTE };

    await request(app.getHttpServer())
      .patch('/users/999')
      .send({ fullName: 'Intento docente' })
      .expect(403);

    expect(mockUserService.update).not.toHaveBeenCalled();
  });

  // B1 — POST /users pasa a ser exclusivo de admin.
  describe('B1 — POST /users', () => {
    it('estudiante autenticado NO puede crear usuarios (403)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'nuevo@stire.local', password: 'Segura1!', fullName: 'Nuevo' })
        .expect(403);

      expect(mockUserService.create).not.toHaveBeenCalled();
    });

    it('admin SÍ puede crear usuarios (201/200 según el controller)', async () => {
      currentUser = { id: 5, email: 'admin@stire.local', role: UserRole.ADMIN };
      mockUserService.create.mockResolvedValue({ id: 42 });

      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'nuevo@stire.local', password: 'Segura1!', fullName: 'Nuevo' })
        .expect(201);

      expect(mockUserService.create).toHaveBeenCalled();
    });
  });

  // B3 — GET /users y GET /users/:id dejan de ser enumeración libre.
  describe('B3 — GET /users y GET /users/:id', () => {
    const rawUsers = [
      {
        id: 1,
        email: 'estudiante@stire.local',
        fullName: 'Estudiante Uno',
        role: UserRole.ESTUDIANTE,
        isActive: true,
        createdAt: new Date('2026-01-01'),
      },
    ];

    it('estudiante NO puede listar todos los usuarios (403)', async () => {
      await request(app.getHttpServer()).get('/users').expect(403);
      expect(mockUserService.findAll).not.toHaveBeenCalled();
    });

    it('docente SÍ puede listar, y la respuesta usa el DTO de salida (sin password)', async () => {
      currentUser = { id: 2, email: 'docente@stire.local', role: UserRole.DOCENTE };
      mockUserService.findAll.mockResolvedValue(rawUsers);

      const res = await request(app.getHttpServer()).get('/users').expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).not.toHaveProperty('password');
      expect(res.body[0].email).toBe('estudiante@stire.local');
    });

    it('un estudiante SÍ puede leer su propio perfil por id', async () => {
      mockUserService.findOne.mockResolvedValue(rawUsers[0]);

      await request(app.getHttpServer()).get('/users/1').expect(200);
    });

    it('un estudiante NO puede leer el perfil de otro usuario por id (403)', async () => {
      await request(app.getHttpServer()).get('/users/999').expect(403);
      expect(mockUserService.findOne).not.toHaveBeenCalled();
    });

    it('un admin SÍ puede leer el perfil de cualquier usuario', async () => {
      currentUser = { id: 5, email: 'admin@stire.local', role: UserRole.ADMIN };
      mockUserService.findOne.mockResolvedValue(rawUsers[0]);

      await request(app.getHttpServer()).get('/users/1').expect(200);
    });
  });

  // B4 — POST /users/me/affiliations exige CreateAffiliationDto tipado.
  describe('B4 — POST /users/me/affiliations', () => {
    it('roleType fuera del enum es rechazado con 400', async () => {
      await request(app.getHttpServer())
        .post('/users/me/affiliations')
        .send({ programId: 1, roleType: 'super-admin' })
        .expect(400);

      expect(mockUserService.addAffiliation).not.toHaveBeenCalled();
    });

    it('programId no numérico es rechazado con 400', async () => {
      await request(app.getHttpServer())
        .post('/users/me/affiliations')
        .send({ programId: 'no-es-un-id', roleType: 'estudiante' })
        .expect(400);

      expect(mockUserService.addAffiliation).not.toHaveBeenCalled();
    });

    it('un cuerpo válido sí pasa al service, tipado', async () => {
      mockUserService.addAffiliation.mockResolvedValue({ id: 1 });

      await request(app.getHttpServer())
        .post('/users/me/affiliations')
        .send({ programId: 1, roleType: 'estudiante' })
        .expect(201);

      expect(mockUserService.addAffiliation).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ programId: 1, roleType: 'estudiante' }),
      );
    });
  });
});
