import { JudgeExecutionService } from './judge-execution.service';

describe('JudgeExecutionService.runPublicCases', () => {
  let service: JudgeExecutionService;
  let sandbox: any;
  let resultsRepo: any;
  let eventEmitter: any;

  const testCases = [
    { label: 'público', input: '5\n3', expected: '8', isPublic: true },
    { label: 'oculto', input: '10\n20', expected: '30', isPublic: false },
  ];

  beforeEach(() => {
    sandbox = { executeIsolated: jest.fn() };
    resultsRepo = { save: jest.fn() };
    eventEmitter = { emitAsync: jest.fn() };
    service = new JudgeExecutionService(sandbox, resultsRepo, eventEmitter);
  });

  it('ejecuta el sandbox solo para los casos públicos — el caso oculto nunca llega a él', async () => {
    sandbox.executeIsolated.mockResolvedValue({
      status: 'accepted', stdout: '8', stderr: '', timeMs: 5, memoryKb: 0,
    });

    const results = await service.runPublicCases('function f(){}', 'javascript', testCases);

    expect(sandbox.executeIsolated).toHaveBeenCalledTimes(1);
    expect(sandbox.executeIsolated).toHaveBeenCalledWith(
      'function f(){}', 'javascript', expect.objectContaining({ isPublic: true }),
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ label: 'público', passed: true, actualOutput: '8', expectedOutput: '8' });
  });

  it('no persiste en ExecutionResultsRepository ni emite judge.answer-graded — no es una calificación', async () => {
    sandbox.executeIsolated.mockResolvedValue({
      status: 'accepted', stdout: '8', stderr: '', timeMs: 5, memoryKb: 0,
    });

    await service.runPublicCases('code', 'javascript', testCases);

    expect(resultsRepo.save).not.toHaveBeenCalled();
    expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
  });

  it('marca passed:false cuando la salida no coincide con lo esperado', async () => {
    sandbox.executeIsolated.mockResolvedValue({
      status: 'wrong_answer', stdout: '7', stderr: '', timeMs: 5, memoryKb: 0,
    });

    const results = await service.runPublicCases('code', 'javascript', testCases);

    expect(results[0]).toEqual({ label: 'público', passed: false, actualOutput: '7', expectedOutput: '8' });
  });

  it('con cero casos públicos, retorna arreglo vacío sin tocar el sandbox', async () => {
    const results = await service.runPublicCases('code', 'javascript', [
      { label: 'oculto', input: '1', expected: '1', isPublic: false },
    ]);

    expect(results).toEqual([]);
    expect(sandbox.executeIsolated).not.toHaveBeenCalled();
  });
});
