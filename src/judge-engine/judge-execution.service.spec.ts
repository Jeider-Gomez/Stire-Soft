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

// Simulación 23/09: la nota era la suma de pesos (10 por caso) y no se escalaba a los
// puntos de la pregunta: un ejercicio de 25 puntos con 2 casos valía como máximo 20.
describe('JudgeExecutionService.gradeAnswer — la nota se escala a los puntos de la pregunta', () => {
  const build = (statuses: string[]) => {
    const sandbox = { executeIsolated: jest.fn() };
    statuses.forEach((status) => sandbox.executeIsolated.mockResolvedValueOnce({ status, stdout: '', stderr: '', timeMs: 1, memoryKb: 0 }));
    const emitter = { emitAsync: jest.fn() };
    const service = new JudgeExecutionService(sandbox as any, { save: jest.fn() } as any, emitter as any);
    return { service, emitter };
  };
  const cases2 = [{ label: 'a', input: '1', expected: '1' }, { label: 'b', input: '2', expected: '2' }];
  const scoreEmitted = (emitter: any) => emitter.emitAsync.mock.calls[0][1].score;

  it('2 casos de igual peso y 25 puntos: los dos pasan → 25; uno pasa → 13 (redondeado)', async () => {
    let t = build(['accepted', 'accepted']);
    await t.service.gradeAnswer({ submissionAnswerId: 1, code: '', language: 'javascript', testCases: cases2, maxPoints: 25 });
    expect(scoreEmitted(t.emitter)).toBe(25);

    t = build(['accepted', 'wrong_answer']);
    await t.service.gradeAnswer({ submissionAnswerId: 1, code: '', language: 'javascript', testCases: cases2, maxPoints: 25 });
    expect(scoreEmitted(t.emitter)).toBe(13);
  });

  it('respeta pesos desiguales: peso 30 pasa y peso 10 falla, de 20 puntos → 15', async () => {
    const t = build(['accepted', 'wrong_answer']);
    await t.service.gradeAnswer({ submissionAnswerId: 1, code: '', language: 'javascript', maxPoints: 20, testCases: [{ ...cases2[0], weight: 30 }, { ...cases2[1], weight: 10 }] });
    expect(scoreEmitted(t.emitter)).toBe(15);
  });

  it('sin maxPoints conserva el comportamiento anterior (suma de pesos)', async () => {
    const t = build(['accepted', 'accepted']);
    await t.service.gradeAnswer({ submissionAnswerId: 1, code: '', language: 'javascript', testCases: cases2 });
    expect(scoreEmitted(t.emitter)).toBe(20);
  });
});
