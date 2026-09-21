import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { SystemStatusService } from './system-status.service';
import { RequestMetricsService } from './request-metrics.service';
import { SANDBOX_LIMITS } from '../judge-engine/hardened-process-sandbox.adapter';
import { Submission } from '../submissions/entities/submission.entity';
import { ExecutionResult } from '../judge-engine/entities/execution-result.entity';
import { TutorCredential } from '../tutor/entities/tutor-credential.entity';
import { TutorConversation } from '../tutor/entities/tutor-conversation.entity';
import { User } from '../user/entities/user.entity';

type Overrides = Partial<{
  query: jest.Mock;
  submissionCount: jest.Mock;
  credentialCount: jest.Mock;
  executionRaw: jest.Mock;
}>;

function buildService(o: Overrides = {}) {
  const submissionCount = o.submissionCount ?? jest.fn().mockResolvedValue(7);
  const credentialCount = o.credentialCount ?? jest.fn().mockResolvedValue(4);
  const conversationCount = jest.fn().mockResolvedValue(12);
  const executionRaw = o.executionRaw ?? jest.fn().mockResolvedValue({ count: '30', avg: '112.6' });
  const userRaw = jest.fn().mockResolvedValue([
    { role: 'estudiante', total: '10' },
    { role: 'docente', total: '3' },
    { role: 'admin', total: '1' },
  ]);
  const qb = (getRawOne?: jest.Mock, getRawMany?: jest.Mock) => {
    const chain: Record<string, jest.Mock> = {};
    for (const m of ['select', 'addSelect', 'where', 'groupBy']) chain[m] = jest.fn().mockReturnValue(chain);
    chain.getRawOne = getRawOne ?? jest.fn();
    chain.getRawMany = getRawMany ?? jest.fn();
    return chain;
  };
  const repos = new Map<unknown, unknown>([
    [Submission, { count: submissionCount }],
    [TutorCredential, { count: credentialCount }],
    [TutorConversation, { count: conversationCount }],
    [ExecutionResult, { createQueryBuilder: () => qb(executionRaw) }],
    [User, { createQueryBuilder: () => qb(undefined, userRaw) }],
  ]);
  const dataSource = {
    query: o.query ?? jest.fn().mockResolvedValue([{ '1': 1 }]),
    getRepository: (entity: unknown) => repos.get(entity),
  } as unknown as DataSource;
  const config = { get: (key: string, fallback?: string) => ({ GEMINI_MODEL: 'gemini-flash-latest' })[key] ?? fallback } as unknown as ConfigService;
  const metrics = new RequestMetricsService();
  metrics.record(20, 200);
  return { service: new SystemStatusService(dataSource, config, metrics), submissionCount };
}

describe('SystemStatusService', () => {
  it('reúne valores reales: límites del sandbox, modelo, conteos y métricas de peticiones', async () => {
    const { service } = buildService();

    const status = await service.getStatus();

    expect(status.database.ok).toBe(true);
    expect(status.database.latencyMs).toEqual(expect.any(Number));
    expect(status.sandbox.timeoutMs).toBe(SANDBOX_LIMITS.timeoutMs);
    expect(status.sandbox.maxHeapMb).toBe(SANDBOX_LIMITS.maxHeapMb);
    expect(status.sandbox.executionsLast24h).toBe(30);
    expect(status.sandbox.avgExecutionMs).toBe(113);
    expect(status.tutor.model).toBe('gemini-flash-latest');
    expect(status.tutor.studentsWithKey).toBe(4);
    expect(status.tutor.studentMessagesLast24h).toBe(12);
    expect(status.users).toEqual({ total: 14, byRole: { estudiante: 10, docente: 3, admin: 1 } });
    expect(status.submissionsLast24h).toBe(7);
    expect(status.api.requests.sampled).toBe(1);
    expect(status.api.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(status.api.memory.rssMb).toBeGreaterThan(0);
  });

  it('con la base de datos caída responde igual: database.ok=false y los bloques de BD en null', async () => {
    const { service, submissionCount } = buildService({ query: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')) });

    const status = await service.getStatus();

    expect(status.database).toEqual({ ok: false, latencyMs: null });
    expect(status.users).toBeNull();
    expect(status.submissionsLast24h).toBeNull();
    expect(status.sandbox.executionsLast24h).toBeNull();
    expect(status.tutor.studentsWithKey).toBeNull();
    expect(submissionCount).not.toHaveBeenCalled();
    // Lo que no depende de la base sigue disponible.
    expect(status.sandbox.timeoutMs).toBe(SANDBOX_LIMITS.timeoutMs);
    expect(status.api.nodeVersion).toBe(process.version);
  });

  it('si falla un solo bloque, ese queda en null y los demás siguen con datos', async () => {
    const { service } = buildService({ credentialCount: jest.fn().mockRejectedValue(new Error('tabla ausente')) });

    const status = await service.getStatus();

    expect(status.tutor.studentsWithKey).toBeNull();
    expect(status.tutor.studentMessagesLast24h).toBe(12);
    expect(status.users?.total).toBe(14);
  });

  it('sin ejecuciones en 24 h el promedio es null, no 0', async () => {
    const { service } = buildService({ executionRaw: jest.fn().mockResolvedValue({ count: '0', avg: null }) });

    const status = await service.getStatus();

    expect(status.sandbox.executionsLast24h).toBe(0);
    expect(status.sandbox.avgExecutionMs).toBeNull();
  });
});
