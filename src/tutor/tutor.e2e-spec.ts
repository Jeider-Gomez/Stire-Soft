import { TutorService } from './tutor.service';
import { TutorContextService } from './tutor-context.service';

describe('TutorService E2E', () => {
  let service: TutorService;
  let fetchMock: jest.Mock;
  const realFetch = global.fetch;

  beforeEach(() => {
    const convRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getRecentContext: jest.fn().mockResolvedValue([
        { role: 'user', content: '¿Cómo configuro una función?' },
        { role: 'assistant', content: 'Primero define los parámetros y luego llama a la función.' },
      ]),
    };

    const progressRepo = {
      find: jest.fn().mockResolvedValue([
        { studentId: 1, learningUnitId: 101, mastery: 90, successRate: 95, completedActivities: 5, updatedAt: new Date('2026-05-20T10:00:00Z') },
        { studentId: 1, learningUnitId: 102, mastery: 75, successRate: 80, completedActivities: 4, updatedAt: new Date('2026-05-21T10:00:00Z') },
        { studentId: 1, learningUnitId: 103, mastery: 60, successRate: 70, completedActivities: 3, updatedAt: new Date('2026-05-22T10:00:00Z') },
      ]),
    };

    const configService = { get: jest.fn((key: string, def?: any) => (key === 'GEMINI_MODEL' ? 'gemini-flash-latest' : def)) };
    const contentRenderingService = { escapePlainText: jest.fn((s: string) => s) };
    const recommendationService = {
      suggestForUnit: jest.fn().mockResolvedValue(null),
      suggestAmbient: jest.fn().mockResolvedValue(null),
    };
    const credentialService = { getDecryptedKey: jest.fn().mockResolvedValue('AIzaFAKEKEYFORTESTS1234567890abcdefgh') };
    const learningUnitService = { findOne: jest.fn() };

    service = new TutorService(
      convRepo as any,
      new TutorContextService(progressRepo as any),
      configService as any,
      contentRenderingService as any,
      recommendationService as any,
      credentialService as any,
      learningUnitService as any,
      { countFailedAttempts: jest.fn().mockResolvedValue(0) } as any,
      { resolveForStudent: jest.fn().mockResolvedValue({ enabled: true, maxGuideLevel: 3, style: 'equilibrado' }) } as any,
    );

    fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}), text: async () => '' })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: 'Este es tu consejo de tutor.' }] } }] }),
        text: async () => '',
      });
    (global as any).fetch = fetchMock;
  });

  afterEach(() => {
    (global as any).fetch = realFetch;
  });

  it('arma el system prompt con contexto real del estudiante, salta al siguiente modelo ante un 429 y devuelve el contenido de la IA', async () => {
    const response = await service.sendMessage({ id: 1, role: 'estudiante' } as any, '¿Qué modelo debo usar para resolver esto?');

    expect(response.message).toBe('Este es tu consejo de tutor.');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    const systemPrompt = body.system_instruction.parts[0].text;
    expect(systemPrompt).toContain('Eres el Tutor Inteligente de STIRE');
    expect(systemPrompt).toContain('Maestría Global: 75%');
    expect(systemPrompt).toContain('ÚLTIMOS PROGRESOS DEL ESTUDIANTE:');
    expect(body.contents).toContainEqual({
      role: 'model',
      parts: [{ text: 'Primero define los parámetros y luego llama a la función.' }],
    });
    expect(body.contents[body.contents.length - 1]).toEqual({
      role: 'user',
      parts: [{ text: '¿Qué modelo debo usar para resolver esto?' }],
    });
  });
});
