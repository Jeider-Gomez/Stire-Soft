import { ForbiddenException } from '@nestjs/common';
import { LearningProgressController } from './learning-progress.controller';

// PUT /learning-progress/unit/:unitId/confidence: el estudiante solo guarda su propia confianza, y solo en una unidad
// de una clase donde está matriculado.
describe('LearningProgressController.setConfidence', () => {
  const estudiante = { id: 42, role: 'estudiante' };
  let authorizationService: any;
  let service: any;
  let controller: LearningProgressController;

  beforeEach(() => {
    authorizationService = { assertEnrolledInClass: jest.fn().mockResolvedValue(undefined) };
    service = {
      resolveClassId: jest.fn().mockResolvedValue(7),
      setEntryConfidence: jest.fn().mockResolvedValue({ entryConfidence: 2 }),
    };
    controller = new LearningProgressController({} as never, authorizationService, service);
  });

  it('guarda la confianza del propio estudiante tras comprobar la matrícula en la clase de la unidad', async () => {
    const r = await controller.setConfidence(10, 2, { user: estudiante });

    expect(authorizationService.assertEnrolledInClass).toHaveBeenCalledWith(estudiante, 7);
    expect(service.setEntryConfidence).toHaveBeenCalledWith(42, 10, 2);
    expect(r).toEqual({ learningUnitId: 10, entryConfidence: 2 });
  });

  it('sin matrícula en esa clase no guarda nada', async () => {
    authorizationService.assertEnrolledInClass.mockRejectedValue(new ForbiddenException());

    await expect(controller.setConfidence(10, 2, { user: estudiante })).rejects.toThrow(ForbiddenException);
    expect(service.setEntryConfidence).not.toHaveBeenCalled();
  });
});

describe('LearningProgressController.getNextActivity', () => {
  it('un estudiante no ve la recomendación de una unidad de una clase donde no está matriculado', async () => {
    const authorizationService: any = {
      assertTeacherSharesClassWithStudent: jest.fn().mockResolvedValue(undefined),
      assertEnrolledInClass: jest.fn().mockRejectedValue(new ForbiddenException()),
    };
    const service: any = { resolveClassId: jest.fn().mockResolvedValue(9), getNextActivity: jest.fn() };
    const controller = new LearningProgressController({} as never, authorizationService, service);

    await expect(controller.getNextActivity(42, 8, { user: { id: 42, role: 'estudiante' } })).rejects.toThrow(ForbiddenException);
    expect(authorizationService.assertEnrolledInClass).toHaveBeenCalledWith({ id: 42, role: 'estudiante' }, 9);
    expect(service.getNextActivity).not.toHaveBeenCalled();
  });

  it('matriculado, recibe la recomendación', async () => {
    const authorizationService: any = {
      assertTeacherSharesClassWithStudent: jest.fn().mockResolvedValue(undefined),
      assertEnrolledInClass: jest.fn().mockResolvedValue(undefined),
    };
    const service: any = { resolveClassId: jest.fn().mockResolvedValue(9), getNextActivity: jest.fn().mockResolvedValue({ activityId: 1 }) };
    const controller = new LearningProgressController({} as never, authorizationService, service);

    await expect(controller.getNextActivity(42, 8, { user: { id: 42, role: 'estudiante' } })).resolves.toEqual({ activityId: 1 });
  });
});

describe('LearningProgressController.estadisticas', () => {
  const crear = (comparte = true) => {
    const authorizationService: any = {
      assertTeacherSharesClassWithStudent: comparte ? jest.fn().mockResolvedValue(undefined) : jest.fn().mockRejectedValue(new ForbiddenException()),
    };
    const service: any = { estadisticas: jest.fn().mockResolvedValue({ hoy: '2026-10-01' }) };
    return { controller: new LearningProgressController({} as never, authorizationService, service), service };
  };

  it('un estudiante solo ve sus propias estadísticas', async () => {
    const { controller, service } = crear();
    await expect(controller.estadisticas(43, '5', { user: { id: 42, role: 'estudiante' } })).rejects.toThrow(ForbiddenException);
    await controller.estadisticas(42, '5', { user: { id: 42, role: 'estudiante' } });
    expect(service.estadisticas).toHaveBeenCalledWith(42, 5);
  });

  it('un docente solo ve las de un estudiante con quien comparte clase', async () => {
    const { controller, service } = crear(false);
    await expect(controller.estadisticas(42, undefined, { user: { id: 9, role: 'docente' } })).rejects.toThrow(ForbiddenException);
    expect(service.estadisticas).not.toHaveBeenCalled();
  });
});
