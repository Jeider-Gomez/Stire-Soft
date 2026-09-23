import { ForbiddenException } from '@nestjs/common';
import { AuthController } from '../../auth/auth.controller';
import { EnrollmentController } from '../../enrollment/enrollment.controller';
import { MessageController } from '../../message/message.controller';
import { NotificationsController } from '../../notifications/notifications.controller';
import { UserController } from '../../user/user.controller';
import { AnalyticsController } from '../../analytics/analytics.controller';
import { AnalyticsService } from '../../analytics/analytics.service';
import { LearningProgressController } from '../../learning-progress/learning-progress.controller';
import { AuthorizationService } from './authorization.service';
import { UserRole } from '../../user/entities/user.entity';

/**
 * OLA 3 - PUNTO 2: respaldo real (`testFile`) para cada entrada de
 * `JUSTIFIED_GET_EXCEPTIONS` en route-role-metadata.spec.ts. No son mocks
 * huecos "se llamó a algo" — cada caso verifica el argumento REAL que llega
 * al service (siempre `user.id`/`user`, nunca un id ajeno tomado de la URL),
 * o, en el caso de `getClassMetrics`, que el 403 de propiedad realmente
 * ocurre para un docente ajeno.
 */
describe('Excepciones GET justificadas (Ola 3, Punto 2) — respaldo real', () => {
  it('AuthController.getProfile: devuelve el propio usuario del JWT, nunca uno consultado por id', () => {
    const controller = new AuthController({} as any);
    const user = { id: 7, role: UserRole.ESTUDIANTE } as any;

    expect(controller.getProfile(user)).toEqual({ user });
  });

  it('EnrollmentController.findMy: consulta siempre con el propio user.id', () => {
    const mockService = { findByStudent: jest.fn().mockReturnValue(['ok']) };
    const controller = new EnrollmentController(mockService as any);
    const user = { id: 20, role: UserRole.ESTUDIANTE } as any;

    controller.findMy(user);

    expect(mockService.findByStudent).toHaveBeenCalledWith(20);
  });

  it('MessageController: inbox/sent/unread-count/conversation siempre parten del propio user.id', () => {
    const mockService = {
      getInbox: jest.fn(),
      getSent: jest.fn(),
      getUnreadCount: jest.fn(),
      getConversation: jest.fn(),
    };
    const controller = new MessageController(mockService as any);
    const user = { id: 5, role: UserRole.DOCENTE } as any;

    controller.getInbox(user);
    controller.getSent(user);
    controller.getUnreadCount(user);
    controller.getConversation(user, 99);

    expect(mockService.getInbox).toHaveBeenCalledWith(5);
    expect(mockService.getSent).toHaveBeenCalledWith(5);
    expect(mockService.getUnreadCount).toHaveBeenCalledWith(5);
    // getConversation acota AMBOS lados de la conversación al propio user.id
    // + el otro participante — nunca deja que el propio id sea sustituido.
    expect(mockService.getConversation).toHaveBeenCalledWith(5, 99);
  });

  it('NotificationsController: findMyNotifications/findAllMyNotifications siempre parten del propio user.id', () => {
    const mockService = { findForUser: jest.fn() };
    const controller = new NotificationsController(mockService as any);
    const user = { id: 11, role: UserRole.ESTUDIANTE } as any;

    controller.findMyNotifications(user);
    controller.findAllMyNotifications(user);

    expect(mockService.findForUser).toHaveBeenCalledWith(11, true);
    expect(mockService.findForUser).toHaveBeenCalledWith(11, false);
  });

  it('UserController.findOne: un usuario NO admin no puede leer un id ajeno → 403', async () => {
    const mockService = { findOne: jest.fn() };
    const controller = new UserController(mockService as any);
    const requester = { id: 3, role: UserRole.ESTUDIANTE } as any;

    await expect(controller.findOne(999, requester)).rejects.toThrow(ForbiddenException);
    expect(mockService.findOne).not.toHaveBeenCalled();
  });

  it('UserController.findOne: un usuario SÍ puede leer su propio id', async () => {
    const mockService = { findOne: jest.fn().mockResolvedValue({ id: 3, email: 'a@a.com', role: UserRole.ESTUDIANTE }) };
    const controller = new UserController(mockService as any);
    const requester = { id: 3, role: UserRole.ESTUDIANTE } as any;

    await expect(controller.findOne(3, requester)).resolves.toBeDefined();
    expect(mockService.findOne).toHaveBeenCalledWith(3);
  });

  it('UserController.findOne: admin puede leer cualquier id', async () => {
    const mockService = { findOne: jest.fn().mockResolvedValue({ id: 999, email: 'b@b.com', role: UserRole.ESTUDIANTE }) };
    const controller = new UserController(mockService as any);
    const admin = { id: 1, role: UserRole.ADMIN } as any;

    await expect(controller.findOne(999, admin)).resolves.toBeDefined();
  });

  it('AnalyticsController.getClassMetrics: docente ajeno → 403 (verificado en el service real)', async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockImplementation((entity: any) => {
        if (entity.name === 'Class') {
          return { findOne: jest.fn().mockResolvedValue({ id: 5, teacherId: 10, name: 'X', code: 'X' }) };
        }
        return { find: jest.fn().mockResolvedValue([]), createQueryBuilder: jest.fn() };
      }),
    };
    const service = new AnalyticsService(mockDataSource as any, {} as any);
    const controller = new AnalyticsController(service);

    const docenteAjeno = { id: 99, role: UserRole.DOCENTE };
    await expect(
      controller.getClassMetrics('5', { user: docenteAjeno } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // OLA 3 - PUNTO 2/3 (P1-R5): AnalyticsController.getStudentDashboard y
  // LearningProgressController.findByStudent(AndUnit) comparten el mismo
  // hallazgo (docente sin relación con el estudiante) y la misma
  // remediación (AuthorizationService.assertTeacherSharesClassWithStudent).
  describe('AnalyticsController.getStudentDashboard / LearningProgressController — P1-R5', () => {
    const mockClassRepo = { findOne: jest.fn() };
    const mockEnrollmentRepo = { findOne: jest.fn(), createQueryBuilder: jest.fn() };
    let authService: AuthorizationService;

    beforeEach(() => {
      jest.clearAllMocks();
      authService = new AuthorizationService(mockClassRepo as any, mockEnrollmentRepo as any);
    });

    function mockSharedClassesCount(count: number) {
      mockEnrollmentRepo.createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(count),
      });
    }

    it('getStudentDashboard: docente SIN clase en común con el estudiante → 403', async () => {
      mockSharedClassesCount(0);
      const mockDataSource = {
        getRepository: jest.fn().mockReturnValue({ find: jest.fn().mockResolvedValue([]) }),
      };
      const service = new AnalyticsService(mockDataSource as any, authService);
      const docenteAjeno = { id: 99, role: UserRole.DOCENTE };

      await expect(service.getStudentDashboard(20, docenteAjeno)).rejects.toThrow(ForbiddenException);
    });

    it('getStudentDashboard: docente CON clase en común → pasa', async () => {
      mockSharedClassesCount(1);
      const mockDataSource = {
        getRepository: jest.fn().mockReturnValue({
          find: jest.fn().mockResolvedValue([]),
        }),
      };
      const service = new AnalyticsService(mockDataSource as any, authService);
      const docenteConClase = { id: 10, role: UserRole.DOCENTE };

      await expect(service.getStudentDashboard(20, docenteConClase)).resolves.toBeDefined();
    });

    it('LearningProgressController.findByStudent: docente sin clase en común → 403, no consulta el repo', async () => {
      mockSharedClassesCount(0);
      const mockProgressRepo = { find: jest.fn() };
      const controller = new LearningProgressController(mockProgressRepo as any, authService);
      const req = { user: { id: 99, role: UserRole.DOCENTE } };

      await expect(controller.findByStudent(20, req as any)).rejects.toThrow(ForbiddenException);
      expect(mockProgressRepo.find).not.toHaveBeenCalled();
    });

    it('LearningProgressController.findByStudent: estudiante viendo su propio progreso → pasa sin consultar clases compartidas', async () => {
      const mockProgressRepo = { find: jest.fn().mockResolvedValue([]) };
      const controller = new LearningProgressController(mockProgressRepo as any, authService);
      const req = { user: { id: 20, role: UserRole.ESTUDIANTE } };

      await controller.findByStudent(20, req as any);
      expect(mockEnrollmentRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(mockProgressRepo.find).toHaveBeenCalled();
    });
  });
});
