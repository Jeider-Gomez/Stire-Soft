import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);
  private readonly openai?: OpenAI;
  private readonly openAiModel: string;
  private readonly openAiRetryCount: number;

  constructor(
    private readonly convRepo: TutorConversationsRepository,
    private readonly contextService: TutorContextService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openAiModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
    this.openAiRetryCount = this.configService.get<number>('OPENAI_RETRY_COUNT', 3);

    if (apiKey) {
      const baseURL = this.configService.get<string>('OPENAI_API_URL', 'https://api.openai.com/v1');
      this.openai = new OpenAI({ apiKey, baseURL });
    }
  }

  async sendMessage(studentId: number, message: string): Promise<string> {
    await this.convRepo.save({
      studentId,
      role: 'user',
      content: message,
    });

    const systemPrompt = await this.contextService.buildSystemPrompt(studentId);
    const history = await this.convRepo.getRecentContext(studentId, 6);
    const payload = this.buildMessages(systemPrompt, history, message);

    this.logger.log(`LLM Payload preparado con ${payload.length} mensajes. Ejecutando inferencia...`);

    let aiResponseContent: string;

    if (!this.openai) {
      this.logger.warn('OPENAI_API_KEY no configurada. Usando inferencia local mock.');
      aiResponseContent = this.mockLlmInference(message);
    } else {
      try {
        const response = await this.callWithRetry(() =>
          this.openai.chat.completions.create({
            model: this.openAiModel,
            messages: payload,
            max_tokens: 300,
            temperature: 0.7,
          }),
          this.openAiRetryCount,
        );

        aiResponseContent = response.choices?.[0]?.message?.content?.trim() ?? '';
        if (!aiResponseContent) {
          throw new Error('OpenAI returned empty response content');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        if (errorMessage.includes('429')) {
          this.logger.warn('OpenAI rate limit exceeded.');
          throw new Error('OpenAI rate limit exceeded. Por favor intenta de nuevo en unos segundos.');
        }

        if (/timeout|timed out|ETIMEDOUT/i.test(errorMessage)) {
          this.logger.warn('OpenAI request timed out.');
          throw new Error('OpenAI request timeout. Intenta de nuevo.');
        }

        this.logger.error(`Error en OpenAI: ${errorMessage}`);
        aiResponseContent = this.mockLlmInference(message);
      }
    }

    await this.convRepo.save({
      studentId,
      role: 'assistant',
      content: aiResponseContent,
    });

    return aiResponseContent;
  }

  private async callWithRetry<T>(fn: () => Promise<T>, retries: number, attempt = 1): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = (error as any)?.status ?? (error as any)?.statusCode;
      const isRetryable =
        status === 429 ||
        status === 503 ||
        /timeout|timed out|ETIMEDOUT|ECONNRESET|EAI_AGAIN/i.test(errorMessage);

      if (retries > 0 && isRetryable) {
        const delayMs = 2000 * Math.pow(2, attempt - 1);
        this.logger.warn(`Retry ${attempt} para OpenAI (${status ?? errorMessage}), esperando ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return this.callWithRetry(fn, retries - 1, attempt + 1);
      }

      throw error;
    }
  }

  private buildMessages(systemPrompt: string, history: Array<{ role: string; content: string }>, userMessage: string) {
    return [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: userMessage },
    ];
  }

  private mockLlmInference(userMessage: string): string {
    const isCode = userMessage.includes('{') || userMessage.includes('function');
    if (isCode) {
      return 'Veo que estás intentando escribir código. Recuerda revisar la condición de parada de tu bucle. ¿Qué crees que pasaría si la variable "i" nunca alcanza el límite?';
    }
    return 'Entiendo tu duda. Piensa en esto como si estuvieras organizando libros en un estante. ¿Cómo aplicarías ese concepto aquí?';
  }
}
