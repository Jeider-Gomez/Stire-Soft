import { TutorService } from './tutor.service';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';
import { ConfigService } from '@nestjs/config';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';
import { TutorRecommendationService } from './tutor-recommendation.service';

describe('TutorService OpenAI integration', () => {
  let service: TutorService;
  let convRepo: Partial<TutorConversationsRepository>;
  let contextService: Partial<TutorContextService>;
  let configService: Partial<ConfigService>;
  let contentRenderingService: Partial<ContentRenderingService>;
  let recommendationService: Partial<TutorRecommendationService>;
  let createSpy: jest.Mock;

  beforeEach(() => {
    contentRenderingService = {
      escapePlainText: jest.fn((s: string) => s),
    } as any;

    convRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getRecentContext: jest.fn().mockResolvedValue([
        { role: 'user', content: 'Hola tutor' },
        { role: 'assistant', content: 'Respuesta previa' },
      ]),
    } as any;

    contextService = {
      buildSystemPrompt: jest.fn().mockResolvedValue('SYSTEM PROMPT'),
    } as any;

    configService = {
      get: jest.fn().mockImplementation((key: string) => (key === 'OPENAI_API_KEY' ? 'fake-key' : undefined)),
    } as any;

    recommendationService = {
      suggestForUnit: jest.fn().mockResolvedValue(null),
      suggestAmbient: jest.fn().mockResolvedValue(null),
    } as any;

    service = new TutorService(
      convRepo as any,
      contextService as any,
      configService as any,
      contentRenderingService as any,
      recommendationService as any,
    );

    createSpy = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Respuesta IA' } }],
    });

    (service as any).openai = {
      chat: {
        completions: {
          create: createSpy,
        },
      },
    };
  });

  it('should construct a coherent prompt and send it to OpenAI', async () => {
    const result = await service.sendMessage(1, '¿Cuál es la fórmula?');

    expect(result.message).toBe('Respuesta IA');
    expect(result.suggestedActivity).toBeNull();
    expect(createSpy).toHaveBeenCalledTimes(1);

    const callArgs = createSpy.mock.calls[0][0];
    expect(callArgs).toBeDefined();
    expect(callArgs.messages[0]).toEqual({ role: 'system', content: 'SYSTEM PROMPT' });
    expect(callArgs.messages).toContainEqual({ role: 'user', content: 'Hola tutor' });
    expect(callArgs.messages).toContainEqual({ role: 'assistant', content: 'Respuesta previa' });
    expect(callArgs.messages[callArgs.messages.length - 1]).toEqual({ role: 'user', content: '¿Cuál es la fórmula?' });
  });

  it('should fallback to mock inference when OPENAI_API_KEY is not configured', async () => {
    (configService as any).get = jest.fn().mockReturnValue(undefined);
    const serviceWithoutKey = new TutorService(
      convRepo as any,
      contextService as any,
      configService as any,
      contentRenderingService as any,
      recommendationService as any,
    );
    const response = await serviceWithoutKey.sendMessage(1, '¿Cómo lo resuelvo?');

    expect(response.message).toContain('Entiendo tu duda');
  });

  it('does not attach a suggestion when the message has no explicit practice intent', async () => {
    createSpy.mockResolvedValue({ choices: [{ message: { content: 'Piensa en el caso base de la recursión.' } }] });

    const result = await service.sendMessage(1, '¿Cómo funciona un for?', { learningUnitId: 7 });

    expect(result.message).toBe('Piensa en el caso base de la recursión.');
    expect(result.suggestedActivity).toBeNull();
    expect(recommendationService.suggestForUnit).not.toHaveBeenCalled();
  });

  it('attaches a suggestion for the active unit when the student explicitly asks to practice', async () => {
    createSpy.mockResolvedValue({ choices: [{ message: { content: 'Claro, practiquemos.' } }] });
    (recommendationService.suggestForUnit as jest.Mock).mockResolvedValue({
      activityId: 42,
      activityTitle: 'Ejercicio de bucles',
      learningUnitId: 7,
      learningUnitTitle: 'Bucles',
      reason: 'contexto_actual',
      reasonMessage: 'Aquí tienes el siguiente ejercicio de "Bucles".',
    });

    const result = await service.sendMessage(1, 'quiero practicar un ejercicio de esto', { learningUnitId: 7, unitTitle: 'Bucles' });

    expect(result.suggestedActivity?.activityId).toBe(42);
    expect(recommendationService.suggestForUnit).toHaveBeenCalledWith(1, 7, 'contexto_actual', expect.any(String));
  });

  it('detects an explicit practice-intent message and asks the ambient recommendation when there is no active unit', async () => {
    createSpy.mockResolvedValue({ choices: [{ message: { content: 'Claro, aquí tienes algo para practicar.' } }] });
    (recommendationService.suggestAmbient as jest.Mock).mockResolvedValue({
      activityId: 9,
      activityTitle: 'Repaso de variables',
      learningUnitId: 3,
      learningUnitTitle: 'Variables',
      reason: 'mastery_bajo',
      reasonMessage: 'Tu dominio en "Variables" es 40%, por debajo del 60% recomendado.',
    });

    const result = await service.sendMessage(1, 'quiero practicar un poco');

    expect(result.suggestedActivity?.activityId).toBe(9);
    expect(recommendationService.suggestAmbient).toHaveBeenCalledWith(1);
  });
});
