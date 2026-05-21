import { DataSource, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JudgeWorker } from './judge.worker';
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
  let updateAnswerScore: jest.Mock;
  let consolidateSubmission: jest.Mock;

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

    updateAnswerScore = jest.fn().mockResolvedValue({ submissionId: 'submission-123' });
    consolidateSubmission = jest.fn().mockResolvedValue(undefined);

    worker = new JudgeWorker(
      sandboxMock,
      resultsRepo as any,
      {
        updateAnswerScore,
        consolidateSubmission,
      } as any,
    );
  });

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

    expect(updateAnswerScore).toHaveBeenCalledWith(1, true, 10, expect.stringContaining('¡Excelente!'));
    expect(consolidateSubmission).toHaveBeenCalledWith('submission-123');
  });
});
