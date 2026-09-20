import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { User, UserRole } from '../user/entities/user.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { ExecutionResult } from '../judge-engine/entities/execution-result.entity';
import { TutorCredential } from '../tutor/entities/tutor-credential.entity';
import { TutorConversation } from '../tutor/entities/tutor-conversation.entity';
import { SANDBOX_LIMITS } from '../judge-engine/hardened-process-sandbox.adapter';
import { QUEUE_DRIVER } from '../judge-engine/judge-engine.module';
import { RequestMetricsService, RequestMetricsSnapshot } from './request-metrics.service';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SystemStatus {
  generatedAt: string;
  api: {
    version: string;
    nodeVersion: string;
    environment: string;
    uptimeSeconds: number;
    memory: { rssMb: number; heapUsedMb: number };
    requests: RequestMetricsSnapshot;
  };
  database: { ok: boolean; latencyMs: number | null };
  sandbox: {
    adapter: string;
    timeoutMs: number;
    maxHeapMb: number;
    maxOutputKb: number;
    executionsLast24h: number | null;
    avgExecutionMs: number | null;
  };
  judgeQueue: { driver: 'inline' | 'redis'; submissionsInProgress: number | null };
  tutor: {
    provider: string;
    model: string;
    studentsWithKey: number | null;
    studentMessagesLast24h: number | null;
  };
  users: { total: number; byRole: Record<string, number> } | null;
  submissionsLast24h: number | null;
}

/**
 * Estado real del sistema para el panel de administración. Cada bloque que consulta la base
 * de datos falla de forma independiente (queda en `null`): si la base se cae, el panel debe
 * poder mostrar precisamente eso, no dejar de responder.
 */
@Injectable()
export class SystemStatusService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly requestMetrics: RequestMetricsService,
  ) {}

  async getStatus(): Promise<SystemStatus> {
    const since = new Date(Date.now() - DAY_MS);
    const database = await this.pingDatabase();
    const memory = process.memoryUsage();

    const [execution, inProgress, studentsWithKey, studentMessages, users, submissions24h] = database.ok
      ? await Promise.all([
          this.safe(() => this.executionStats(since)),
          this.safe(() => this.dataSource.getRepository(Submission).count({ where: { status: SubmissionStatus.IN_PROGRESS } })),
          this.safe(() => this.dataSource.getRepository(TutorCredential).count()),
          this.safe(() => this.dataSource.getRepository(TutorConversation).count({ where: { role: 'user', createdAt: MoreThanOrEqual(since) } })),
          this.safe(() => this.userCounts()),
          this.safe(() => this.dataSource.getRepository(Submission).count({ where: { createdAt: MoreThanOrEqual(since) } })),
        ])
      : [null, null, null, null, null, null];

    return {
      generatedAt: new Date().toISOString(),
      api: {
        version: this.readVersion(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV ?? 'development',
        uptimeSeconds: Math.round(process.uptime()),
        memory: { rssMb: this.toMb(memory.rss), heapUsedMb: this.toMb(memory.heapUsed) },
        requests: this.requestMetrics.snapshot(),
      },
      database,
      sandbox: {
        adapter: this.configService.get<string>('SANDBOX_TYPE', 'hardened'),
        timeoutMs: SANDBOX_LIMITS.timeoutMs,
        maxHeapMb: SANDBOX_LIMITS.maxHeapMb,
        maxOutputKb: SANDBOX_LIMITS.maxOutputBytes / 1024,
        executionsLast24h: execution?.count ?? null,
        avgExecutionMs: execution?.avgMs ?? null,
      },
      judgeQueue: { driver: QUEUE_DRIVER, submissionsInProgress: inProgress },
      tutor: {
        provider: 'Google Gemini (clave de cada estudiante)',
        model: this.configService.get<string>('GEMINI_MODEL', 'gemini-flash-latest'),
        studentsWithKey: studentsWithKey,
        studentMessagesLast24h: studentMessages,
      },
      users,
      submissionsLast24h: submissions24h,
    };
  }

  private async pingDatabase(): Promise<{ ok: boolean; latencyMs: number | null }> {
    const start = process.hrtime.bigint();
    try {
      await this.dataSource.query('SELECT 1');
      return { ok: true, latencyMs: Math.round((Number(process.hrtime.bigint() - start) / 1e6) * 10) / 10 };
    } catch {
      return { ok: false, latencyMs: null };
    }
  }

  private async executionStats(since: Date): Promise<{ count: number; avgMs: number | null }> {
    const row = await this.dataSource
      .getRepository(ExecutionResult)
      .createQueryBuilder('e')
      .select('COUNT(*)', 'count')
      .addSelect('AVG(e.executionTimeMs)', 'avg')
      .where('e.createdAt >= :since', { since })
      .getRawOne<{ count: string; avg: string | null }>();
    const count = Number(row?.count ?? 0);
    return { count, avgMs: count > 0 && row?.avg != null ? Math.round(Number(row.avg)) : null };
  }

  private async userCounts(): Promise<{ total: number; byRole: Record<string, number> }> {
    const rows = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'total')
      .groupBy('u.role')
      .getRawMany<{ role: UserRole; total: string }>();
    const byRole: Record<string, number> = {};
    for (const r of rows) byRole[r.role] = Number(r.total);
    return { total: Object.values(byRole).reduce((a, b) => a + b, 0), byRole };
  }

  private async safe<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch {
      return null;
    }
  }

  private toMb(bytes: number): number {
    return Math.round(bytes / 1024 / 1024);
  }

  private readVersion(): string {
    try {
      // Tanto desde src/ como desde dist/ el package.json queda dos niveles arriba.
      return JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')).version ?? 'desconocida';
    } catch {
      return 'desconocida';
    }
  }
}
