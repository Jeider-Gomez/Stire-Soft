import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRole } from '../user/entities/user.entity';

// Cobertura mínima de auth.service (Bloque 4, punto 5): antes de este spec,
// auth.service.ts estaba al 0% — el punto de entrada de todo el sistema
// (login/registro) no tenía ni una línea probada.
describe('AuthService', () => {
  let service: AuthService;
  const mockUserService = { findOneByEmail: jest.fn(), create: jest.fn() };
  const mockJwtService = { signAsync: jest.fn().mockResolvedValue('fake-jwt-token') };
  const mockRoleRequests = { create: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockUserService as any, mockJwtService as any, mockRoleRequests as any);
  });

  describe('login', () => {
    it('credenciales válidas devuelven token y el usuario sin password', async () => {
      const hashed = await bcrypt.hash('ClaveCorrecta1!', 10);
      mockUserService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: 'x@x.com',
        password: hashed,
        role: UserRole.ESTUDIANTE,
        isActive: true,
      });

      const result = await service.login({ email: 'x@x.com', password: 'ClaveCorrecta1!' } as any);

      expect(result.token).toBe('fake-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('contraseña incorrecta → 401 "Credenciales inválidas"', async () => {
      const hashed = await bcrypt.hash('ClaveCorrecta1!', 10);
      mockUserService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: 'x@x.com',
        password: hashed,
        role: UserRole.ESTUDIANTE,
        isActive: true,
      });

      await expect(
        service.login({ email: 'x@x.com', password: 'Incorrecta1!' } as any),
      ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
    });

    it('email inexistente → 401 con el MISMO mensaje que contraseña incorrecta (anti-enumeración)', async () => {
      mockUserService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no-existe@x.com', password: 'cualquiera' } as any),
      ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
    });

    it('usuario inactivo → 401, sin llegar a comparar la contraseña', async () => {
      const hashed = await bcrypt.hash('ClaveCorrecta1!', 10);
      mockUserService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: 'x@x.com',
        password: hashed,
        role: UserRole.ESTUDIANTE,
        isActive: false,
      });

      await expect(
        service.login({ email: 'x@x.com', password: 'ClaveCorrecta1!' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('registro exitoso devuelve token y el usuario sin password', async () => {
      mockUserService.create.mockResolvedValue({
        id: 1,
        email: 'nuevo@x.com',
        password: 'hash-interno',
        role: UserRole.ESTUDIANTE,
      });

      const result = await service.register({
        email: 'nuevo@x.com',
        password: 'Segura1!',
        fullName: 'Nuevo',
      } as any);

      expect(result.token).toBe('fake-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('sin pedir rol: no crea solicitud y la respuesta lo dice (roleRequest null)', async () => {
      mockUserService.create.mockResolvedValue({ id: 1, email: 'a@x.com', password: 'h', role: UserRole.ESTUDIANTE });

      const result = await service.register({ email: 'a@x.com', password: 'Segura1!', fullName: 'A' } as any);

      expect(result.roleRequest).toBeNull();
      expect(mockRoleRequests.create).not.toHaveBeenCalled();
    });

    it('pidiendo docente: la cuenta nace ESTUDIANTE (el rol no viaja a create) y queda una solicitud pendiente', async () => {
      mockUserService.create.mockResolvedValue({ id: 7, email: 'p@unicor.edu.co', password: 'h', role: UserRole.ESTUDIANTE });
      mockRoleRequests.create.mockResolvedValue({ id: 3, status: 'pending' });

      const result = await service.register({
        email: 'p@unicor.edu.co',
        password: 'Segura1!',
        fullName: 'Profe',
        requestedRole: 'docente',
        roleRequestReason: 'Cátedra de Algoritmos',
      } as any);

      const created = mockUserService.create.mock.calls[0][0];
      expect(created).not.toHaveProperty('requestedRole');
      expect(created).not.toHaveProperty('roleRequestReason');
      expect(mockRoleRequests.create).toHaveBeenCalledWith(7, 'Cátedra de Algoritmos');
      expect(result.roleRequest).toEqual({ id: 3, status: 'pending' });
      expect(result.user.role).toBe(UserRole.ESTUDIANTE);
    });

    it('pidiendo docente con cualquier correo (no solo institucional): la solicitud se crea igual', async () => {
      mockUserService.create.mockResolvedValue({ id: 8, email: 'x@gmail.com', password: 'h', role: UserRole.ESTUDIANTE });
      mockRoleRequests.create.mockResolvedValue({ id: 4, status: 'pending' });

      const result = await service.register({
        email: 'x@gmail.com',
        password: 'Segura1!',
        fullName: 'X',
        requestedRole: 'docente',
      } as any);

      expect(mockUserService.create).toHaveBeenCalled();
      expect(mockRoleRequests.create).toHaveBeenCalledWith(8, undefined);
      expect(result.roleRequest).toEqual({ id: 4, status: 'pending' });
    });

    it('email duplicado → 409 (propagado desde UserService.create)', async () => {
      mockUserService.create.mockRejectedValue(new ConflictException('El email ya está registrado'));

      await expect(
        service.register({ email: 'dup@x.com', password: 'Segura1!', fullName: 'Dup' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });
});
