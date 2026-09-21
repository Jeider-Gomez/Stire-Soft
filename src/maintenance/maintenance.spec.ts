import { InternalServerErrorException } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { SubmissionStatus } from '../common/enums/submission-status.enum';

/** QueryBuilder mínimo: cualquier método encadenable devuelve el mismo objeto; getMany entrega `rows`. */
function queryBuilder(rows: any[] | Error) {
  const qb: any = {};
  for (const m of ['innerJoinAndSelect', 'leftJoinAndSelect', 'where', 'andWhere']) {
    qb[m] = jest.fn().mockReturnValue(qb);
  }
  qb.getMany = rows instanceof Error ? jest.fn().mockRejectedValue(rows) : jest.fn().mockResolvedValue(rows);
  return qb;
}

describe('MaintenanceService', () => {
  let answersRepo: any;
  let submissionsRepo: any;
  let executionResultRepo: any;
  let service: MaintenanceService;

  function build(orphans: any[] | Error, stale: any[] | Error) {
    answersRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder(orphans)),
      save: jest.fn().mockImplementation(async (row: any) => row),
    };
    submissionsRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder(stale)),
      save: jest.fn().mockImplementation(async (row: any) => row),
    };
    executionResultRepo = { save: jest.fn().mockImplementation(async (row: any) => row) };
    service = new MaintenanceService(answersRepo, submissionsRepo, executionResultRepo);
    jest.spyOn((service as any).logger, 'log').mockImplementation(() => undefined);
    jest.spyOn((service as any).logger, 'warn').mockImplementation(() => undefined);
    jest.spyOn((service as any).logger, 'error').mockImplementation(() => undefined);
  }

  it('devuelve cuántas respuestas huérfanas corrigió y cuántas entregas atascadas cerró', async () => {
    const orphan = { id: 1, submission: { id: 10 }, isCorrect: null, score: null, feedback: null };
    const stuck = { id: 20, status: SubmissionStatus.SUBMITTED, answers: [{ id: 2 }, { id: 3 }] };
    build([orphan], [stuck]);

    const summary = await service.runCleanup();

    expect(summary).toEqual({ orphanedAnswersFixed: 1, staleSubmissionsClosed: 1 });
    expect(orphan.isCorrect).toBe(false);
    expect(orphan.score).toBe(0);
    expect(stuck.status).toBe(SubmissionStatus.GRADED);
    expect(executionResultRepo.save).toHaveBeenCalledTimes(2);
  });

  it('con la base sin nada atascado devuelve ceros y no escribe', async () => {
    build([], []);

    await expect(service.runCleanup()).resolves.toEqual({ orphanedAnswersFixed: 0, staleSubmissionsClosed: 0 });
    expect(answersRepo.save).not.toHaveBeenCalled();
    expect(submissionsRepo.save).not.toHaveBeenCalled();
  });

  it('si una consulta falla, runCleanup lo registra y vuelve a lanzar el error', async () => {
    build(new Error('ECONNREFUSED'), []);

    await expect(service.runCleanup()).rejects.toThrow('ECONNREFUSED');
    expect((service as any).logger.error).toHaveBeenCalled();
  });

  it('el cron (handleDeadlockCleanup) nunca propaga el error: no debe tumbar el planificador', async () => {
    build([], new Error('deadlock'));

    await expect(service.handleDeadlockCleanup()).resolves.toBeUndefined();
    expect((service as any).logger.error).toHaveBeenCalled();
  });
});

describe('MaintenanceController', () => {
  it('informa los conteos reales en el mensaje y en el cuerpo', async () => {
    const service = { runCleanup: jest.fn().mockResolvedValue({ orphanedAnswersFixed: 3, staleSubmissionsClosed: 2 }) };
    const controller = new MaintenanceController(service as any);

    const res = await controller.triggerCleanup();

    expect(res.orphanedAnswersFixed).toBe(3);
    expect(res.staleSubmissionsClosed).toBe(2);
    expect(res.message).toContain('3 respuestas');
    expect(res.message).toContain('2 entregas');
  });

  it('si la limpieza falla responde 500 y NO dice que se ejecutó exitosamente ni filtra el error interno', async () => {
    const service = { runCleanup: jest.fn().mockRejectedValue(new Error('ER_LOCK_DEADLOCK secreto-interno')) };
    const controller = new MaintenanceController(service as any);

    const error: any = await controller.triggerCleanup().catch((e) => e);

    expect(error).toBeInstanceOf(InternalServerErrorException);
    expect(error.message).not.toMatch(/exitosamente/i);
    expect(error.message).not.toContain('secreto-interno');
  });
});
