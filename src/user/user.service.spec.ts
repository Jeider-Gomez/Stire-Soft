import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';
import { UserAffiliation } from './entities/user-affiliation.entity';
import { InstitutionService } from '../institution/institution.service';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockUserAffiliationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockInstitutionService = {
    findProgramById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserAffiliation),
          useValue: mockUserAffiliationRepository,
        },
        {
          provide: InstitutionService,
          useValue: mockInstitutionService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cambio de rol por un admin — nadie se cambia a sí mismo', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUserRepository.findOne.mockImplementation(async ({ where }: any) => ({ id: where.id, role: UserRole.ESTUDIANTE, isActive: true }));
      mockUserRepository.save.mockImplementation(async (u: any) => u);
    });

    it('updateRole sobre otro usuario cambia el rol', async () => {
      await service.updateRole(5, UserRole.DOCENTE, 1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 5, role: UserRole.DOCENTE }));
    });

    it('updateRole sobre la propia cuenta responde 403 y no guarda', async () => {
      await expect(service.updateRole(1, UserRole.ESTUDIANTE, 1)).rejects.toThrow(ForbiddenException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('PATCH /users/:id con role o isActive=false sobre uno mismo también se bloquea', async () => {
      await expect(service.update(1, { role: UserRole.ESTUDIANTE } as any, 1)).rejects.toThrow(ForbiddenException);
      await expect(service.update(1, { isActive: false } as any, 1)).rejects.toThrow(ForbiddenException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('editar el nombre de uno mismo (sin tocar rol ni estado) sigue permitido', async () => {
      await expect(service.update(1, { fullName: 'Nuevo Nombre' } as any, 1)).resolves.toBeDefined();
    });

    it('un admin no puede eliminar su propia cuenta, pero sí la de otro', async () => {
      mockUserRepository.softRemove.mockResolvedValue(undefined);
      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(2, 1)).resolves.toBeUndefined();
    });
  });

  describe('changePassword — regresion bloqueante de la revision del Sub-bloque 2.1', () => {
    afterEach(() => jest.clearAllMocks());

    it('rechaza el cambio si la contraseña actual no coincide, y NO guarda nada', async () => {
      const hashedOld = await bcrypt.hash('ViejaClave1!', 10);
      mockUserRepository.findOne.mockResolvedValue({ id: 1, password: hashedOld });

      await expect(
        service.changePassword(1, {
          currentPassword: 'Incorrecta1!',
          newPassword: 'NuevaClave1!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('la contraseña nueva se persiste hasheada con bcrypt, nunca en texto plano', async () => {
      const hashedOld = await bcrypt.hash('ViejaClave1!', 10);
      mockUserRepository.findOne.mockResolvedValue({ id: 1, password: hashedOld });
      mockUserRepository.save.mockImplementation((u: unknown) => Promise.resolve(u));

      await service.changePassword(1, {
        currentPassword: 'ViejaClave1!',
        newPassword: 'NuevaClave1!',
      });

      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      const savedUser = mockUserRepository.save.mock.calls[0][0];

      expect(savedUser.password).not.toBe('NuevaClave1!');
      expect(savedUser.password).toMatch(/^\$2[aby]\$/);
      expect(await bcrypt.compare('NuevaClave1!', savedUser.password)).toBe(true);
    });
  });
});
