import { TutorService } from './tutor.service';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';
import { ConfigService } from '@nestjs/config';

describe('TutorService OpenAI integration', () => {
  let service: TutorService;
  let convRepo: Partial<TutorConversationsRepository>;
  let contextService: Partial<TutorContextService>;
  let configService: Partial<ConfigService>;
  let createSpy: jest.Mock;

  beforeEach(() => {
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

    service = new TutorService(convRepo as any, contextService as any, configService as any);

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

    expect(result).toBe('Respuesta IA');
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
    const serviceWithoutKey = new TutorService(convRepo as any, contextService as any, configService as any);
    const response = await serviceWithoutKey.sendMessage(1, '¿Cómo lo resuelvo?');

    expect(response).toContain('Entiendo tu duda');
  });
});
