import { ForbiddenException } from '@nestjs/common';
import { ActivityLogController } from './activity-log.controller';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';

// Regresión de la simulación del 23/09: GET /activity-log/student/:id solo
// pedía rol docente/admin — un docente leía el historial de CUALQUIER
// estudiante de la institución (mismo patrón que P1-R5 en analytics).
describe('ActivityLogController.getStudentHistory', () => {
  const logService = { getStudentHistory: jest.fn().mockResolvedValue([{ id: 'a' }]) };
  const enrollmentRepo = { createQueryBuilder: jest.fn() };
  const build = (sharedClasses: number) => {
    enrollmentRepo.createQueryBuilder.mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(sharedClasses),
    });
    return new ActivityLogController(logService as any, new AuthorizationService({} as any, enrollmentRepo as any));
  };

  beforeEach(() => jest.clearAllMocks());

  it('docente sin clase en común con el estudiante → 403 y no se consulta el historial', async () => {
    await expect(build(0).getStudentHistory(2, { id: 99, role: UserRole.DOCENTE } as any)).rejects.toThrow(ForbiddenException);
    expect(logService.getStudentHistory).not.toHaveBeenCalled();
  });

  it('docente con clase en común sí lo ve', async () => {
    await expect(build(1).getStudentHistory(2, { id: 10, role: UserRole.DOCENTE } as any)).resolves.toEqual([{ id: 'a' }]);
  });

  it('admin siempre pasa', async () => {
    await expect(build(0).getStudentHistory(2, { id: 1, role: UserRole.ADMIN } as any)).resolves.toEqual([{ id: 'a' }]);
  });
});
