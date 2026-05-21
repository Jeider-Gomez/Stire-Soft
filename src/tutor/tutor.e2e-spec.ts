import { ConfigService } from '@nestjs/config';
import { TutorService } from './tutor.service';
import { TutorContextService } from './tutor-context.service';

describe('TutorService E2E', () => {
  let service: TutorService;
  let convRepo: any;
  let contextService: TutorContextService;
  let configService: any;
  let openaiCreateSpy: jest.Mock;

  beforeEach(() => {
    convRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getRecentContext: jest.fn().mockResolvedValue([
        { role: 'user', content: '¿Cómo configuro una función?' },
        { role: 'assistant', content: 'Primero define los parámetros y luego llama a la función.' },
      ]),
    };

    const progressRepo = {
      find: jest.fn().mockResolvedValue([
        {
          studentId: 1,
          learningUnitId: 101,
          mastery: 90,
          successRate: 95,
          completedActivities: 5,
          updatedAt: new Date('2026-05-20T10:00:00Z'),
        },
        {
          studentId: 1,
          learningUnitId: 102,
          mastery: 75,
          successRate: 80,
          completedActivities: 4,
          updatedAt: new Date('2026-05-21T10:00:00Z'),
        },
        {
          studentId: 1,
          learningUnitId: 103,
          mastery: 60,
          successRate: 70,
          completedActivities: 3,
          updatedAt: new Date('2026-05-22T10:00:00Z'),
        },
      ]),
    };

    contextService = new TutorContextService(progressRepo as any);

    configService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'OPENAI_API_KEY') return 'fake-key';
        if (key === 'OPENAI_MODEL') return 'gpt-4o-mini';
        if (key === 'OPENAI_API_URL') return 'https://api.openai.com/v1';
        if (key === 'OPENAI_RETRY_COUNT') return 2;
        return defaultValue;
      }),
    };

    service = new TutorService(convRepo as any, contextService, configService as any);

    openaiCreateSpy = jest
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('429 Too Many Requests'), { status: 429 }))
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Este es tu consejo de tutor.' } }],
      });

    (service as any).openai = {
      chat: {
        completions: {
          create: openaiCreateSpy,
        },
      },
    };
  });

  it('should build a system prompt with RAG context, retry on 429, and return AI content', async () => {
    const response = await service.sendMessage(1, '¿Qué modelo debo usar para resolver esto?');

    expect(response).toBe('Este es tu consejo de tutor.');
    expect(openaiCreateSpy).toHaveBeenCalledTimes(2);

    const call = openaiCreateSpy.mock.calls[0][0];
    expect(call.model).toBe('gpt-4o-mini');
    expect(call.messages[0]).toEqual({ role: 'system', content: expect.any(String) });
    expect(call.messages[0].content).toContain('Eres el Tutor IA de STIRE');
    expect(call.messages[0].content).toContain('Mastery Global: 75%');
    expect(call.messages[0].content).toContain('ÚLTIMOS 3 PROGRESOS:');
    expect(call.messages).toContainEqual({ role: 'assistant', content: 'Primero define los parámetros y luego llama a la función.' });
    expect(call.messages[call.messages.length - 1]).toEqual({ role: 'user', content: '¿Qué modelo debo usar para resolver esto?' });
  });
});
