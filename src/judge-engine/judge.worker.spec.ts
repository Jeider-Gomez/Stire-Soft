import { DataSource, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JudgeWorker } from './judge.worker';
import { JudgeExecutionService } from './judge-execution.service';
import { createTestDataSource } from '../test-data-source';

@Entity('execution_results')
class TestExecutionResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  submissionAnswerId: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  status: string;

  @Column({ type: 'text', nullable: true })
  stdout: string;

  @Column({ type: 'text', nullable: true })
  stderr: string;

  @Column({ type: 'int', default: 0 })
  executionTimeMs: number;

  @Column({ type: 'int', default: 0 })
  memoryUsedKB: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  testCaseLabel: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

class TestExecutionResultsRepository {
  constructor(private readonly dataSource: DataSource) {}

  save(entity: Partial<TestExecutionResult>) {
    return this.dataSource.manager.save(TestExecutionResult, entity);
  }
}

describe('JudgeWorker integration', () => {
  let dataSource: DataSource;
  let resultsRepo: TestExecutionResultsRepository;
  let worker: JudgeWorker;
  let emitAsync: jest.Mock;

  beforeAll(async () => {
    dataSource = createTestDataSource([TestExecutionResult]);
    await dataSource.initialize();

    resultsRepo = new TestExecutionResultsRepository(dataSource);

    const sandboxMock = {
      executeIsolated: jest.fn().mockResolvedValue({
        status: 'accepted',
        stdout: 'OK',
        stderr: '',
        timeMs: 25,
        memoryKb: 128,
      }),
    } as any;

    emitAsync = jest.fn().mockResolvedValue(undefined);

    const executionService = new JudgeExecutionService(
      sandboxMock,
      resultsRepo as any,
      { emitAsync } as any,
    );

    worker = new JudgeWorker(executionService);
    // Arrancar SQLite en memoria tarda más de los 5 s por defecto con el equipo cargado (falló 2 de 3 corridas completas); no es un defecto del worker.
  }, 30000);

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should persist ExecutionResult and call submission update flow', async () => {
    const job = {
      data: {
        submissionAnswerId: 1,
        code: 'console.log("OK")',
        language: 'javascript',
        testCases: [
          { label: 'Caso de prueba 1', expected: 'OK', weight: 10 },
        ],
      },
    } as any;

    const result = await worker.process(job);

    expect(result).toEqual({ success: true, score: 10 });

    const rows = await dataSource.query('SELECT * FROM execution_results');
    expect(rows).toHaveLength(1);
    expect(rows[0].submissionAnswerId).toBe(1);
    expect(rows[0].status).toBe('accepted');
    expect(rows[0].stdout).toBe('OK');

    expect(emitAsync).toHaveBeenCalledWith(
      'judge.answer-graded',
      expect.objectContaining({
        submissionAnswerId: 1,
        isCorrect: true,
        score: 10,
        feedback: expect.stringContaining('¡Excelente!'),
      }),
    );
  });
});
