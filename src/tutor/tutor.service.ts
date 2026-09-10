import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);
  private readonly openai?: OpenAI;
  private readonly apiKey: string;
  private readonly openAiModel: string;
  private readonly openAiRetryCount: number;
  private readonly isGemini: boolean;

  constructor(
    private readonly convRepo: TutorConversationsRepository,
    private readonly contextService: TutorContextService,
    private readonly configService: ConfigService,
    private readonly contentRenderingService: ContentRenderingService,
  ) {
    const rawApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.apiKey = rawApiKey ? rawApiKey.trim() : '';
    this.openAiModel = this.configService.get<string>('OPENAI_MODEL', 'gemini-flash-latest');
    this.openAiRetryCount = this.configService.get<number>('OPENAI_RETRY_COUNT', 3);
    const rawBaseURL = this.configService.get<string>('OPENAI_API_URL', '');

    this.isGemini =
      this.apiKey.startsWith('AQ.') ||
      this.apiKey.startsWith('AIza') ||
      (typeof rawBaseURL === 'string' && rawBaseURL.includes('generativelanguage.googleapis.com'));

    if (this.apiKey && !this.isGemini) {
      const baseURL = (rawBaseURL || 'https://api.openai.com/v1')
        .trim()
        .replace(/\/chat\/completions\/?$/, '');
      this.openai = new OpenAI({ apiKey: this.apiKey, baseURL });
      this.logger.log(`Tutor IA inicializado con LLM (${this.openAiModel}) en ${baseURL}`);
    } else if (this.apiKey && this.isGemini) {
      this.logger.log(`Tutor IA inicializado con Google Gemini AI Studio (${this.openAiModel})`);
    }
  }

  async sendMessage(studentId: number, message: string, context?: any): Promise<string> {
    // ADR 07, perfil PLAIN: texto de estudiante, sin HTML.
    await this.convRepo.save({
      studentId,
      role: 'user',
      content: this.contentRenderingService.escapePlainText(message),
    });

    const systemPrompt = await this.contextService.buildSystemPrompt(studentId, context);
    const history = await this.convRepo.getRecentContext(studentId, 6);
    const payload = this.buildMessages(systemPrompt, history, message);

    this.logger.log(`LLM Payload preparado con ${payload.length} mensajes. Ejecutando inferencia...`);

    let aiResponseContent: string;

    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY no configurada. Usando inferencia local mock.');
      aiResponseContent = this.mockLlmInference(message, context);
    } else if (this.isGemini) {
      try {
        aiResponseContent = await this.callWithRetry(
          () => this.callGeminiApi(systemPrompt, history, message),
          this.openAiRetryCount,
        );
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error en Google Gemini: ${errorMessage}`);
        aiResponseContent = this.mockLlmInference(message, context);
      }
    } else if (this.openai) {
      const client = this.openai;
      try {
        const response = await this.callWithRetry(() =>
          client.chat.completions.create({
            model: this.openAiModel,
            messages: payload,
            max_tokens: 500,
            temperature: 0.7,
          }),
          this.openAiRetryCount,
        );

        aiResponseContent = response.choices?.[0]?.message?.content?.trim() ?? '';
        if (!aiResponseContent) {
          throw new Error('OpenAI returned empty response content');
        }
      } catch (err: any) {
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
    } else {
      aiResponseContent = this.mockLlmInference(message);
    }

    // ADR 07, perfil PLAIN: la salida del LLM no es HTML de confianza aunque
    // no venga de un usuario humano — se guarda saneada.
    const sanitizedAiResponse = this.contentRenderingService.escapePlainText(aiResponseContent);
    await this.convRepo.save({
      studentId,
      role: 'assistant',
      content: sanitizedAiResponse,
    });

    return sanitizedAiResponse;
  }

  private async callGeminiApi(
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    userMessage: string,
  ): Promise<string> {
    const primaryModel = this.openAiModel || 'gemini-flash-latest';
    const fallbackModels = [
      primaryModel,
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
    ].map(m => m.replace(/^models\//, ''));
    // Desduplicar manteniendo orden
    const candidateModels = Array.from(new Set(fallbackModels));

    const contents = [
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    };

    let lastError: Error | null = null;
    for (const cleanModel of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${this.apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(4000),
        });

        if (!res.ok) {
          const errText = await res.text();
          this.logger.warn(`Modelo ${cleanModel} devolvió ${res.status}: ${errText.slice(0, 100)}... Probando siguiente candidato.`);
          lastError = new Error(`Google Gemini Error ${res.status}: ${errText}`);
          continue;
        }

        const data: any = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidateText) {
          this.logger.log(`Inferencia exitosa con Google Gemini (${cleanModel})`);
          return candidateText;
        }
      } catch (err: any) {
        lastError = err;
        this.logger.warn(`Fallo al llamar a ${cleanModel}: ${err.message}. Probando siguiente modelo.`);
      }
    }

    throw lastError || new Error('Google Gemini: ningún modelo candidato estuvo disponible');
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

  private normalizeRole(role: string): 'system' | 'user' | 'assistant' {
    return role === 'system' || role === 'assistant' ? role : 'user';
  }

  private buildMessages(
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    userMessage: string,
  ): ChatCompletionMessageParam[] {
    return [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: this.normalizeRole(msg.role),
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];
  }

  private mockLlmInference(userMessage: string, context?: any): string {
    const text = userMessage.toLowerCase().trim();

    // 1. Saludos contextuales
    if (/^(hola|buenas|buen[oa]s d[ií]as|buenas tardes|buenas noches|saludos|hi|hello|hey)/i.test(text)) {
      if (context?.activityTitle) {
        return `¡Hola! Soy tu Tutor Inteligente de STIRE. Veo que estás trabajando en la actividad "${context.activityTitle}". ¿Qué parte del planteamiento o lógica quisieras que examinemos juntos?`;
      }
      return '¡Hola! Soy tu Tutor Inteligente de STIRE. Estoy aquí para acompañarte en tu aprendizaje de Algoritmos Web con HTML5, CSS y JavaScript. ¿Qué concepto, ejercicio o duda te gustaría que analicemos juntos hoy?';
    }

    // 2. Bloques de código explícito o código en el editor
    const isCode = userMessage.includes('{') || userMessage.includes('}') || userMessage.includes('function') || userMessage.includes('def ') || userMessage.includes('return ') || userMessage.includes('console.log');
    if (isCode || context?.currentCode) {
      if (context?.activityTitle) {
        return `Observo tu avance en "${context.activityTitle}". Revisa con cuidado cómo estás leyendo los valores de entrada y la condición de decisión. ¿Qué resultado esperas obtener frente al que observas en la consola?`;
      }
      return 'Veo que estás analizando código. Recuerda revisar la condición de parada de tu bucle y los tipos de tus variables. ¿Qué resultado esperas obtener y qué salida estás observando actualmente?';
    }

    // 3. Variables y tipos de datos
    if (text.includes('variable') || text.includes('tipo de dato') || text.includes('declarar') || text.includes('string') || text.includes('int') || text.includes('boolean')) {
      return 'En algoritmia, una variable es un contenedor con nombre que almacena un dato en memoria. Dependiendo de lo que guardes (números, texto, booleanos), cambia su tipo. ¿Qué tipo de información necesitas guardar en tu algoritmo y cómo planeas nombrarla?';
    }

    // 4. Condicionales (if / else / switch)
    if (text.includes('condicional') || text.includes(' if') || text.includes('else') || text.includes('switch') || text.includes('decisi')) {
      return 'Las estructuras condicionales permiten que tu algoritmo tome caminos diferentes según se cumpla o no una condición booleana. ¿Cuál es la condición lógica exacta (verdadero o falso) que debe evaluarse en este paso?';
    }

    // 5. Bucles / Ciclos (for / while)
    if (text.includes('bucle') || text.includes('ciclo') || text.includes(' for') || text.includes('while') || text.includes('iterar') || text.includes('repetir')) {
      return 'Un ciclo te ayuda a ejecutar un bloque de instrucciones múltiples veces. Todo bucle requiere: (1) un punto de inicio, (2) una condición de parada y (3) un paso o incremento. ¿Cuál de estos tres elementos crees que requiere atención en tu ejercicio?';
    }

    // 6. Funciones / Métodos
    if (text.includes('funcion') || text.includes('función') || text.includes('metodo') || text.includes('método') || text.includes('parametro') || text.includes('parámetro')) {
      return 'Una función es una subrutina reutilizable que resuelve una tarea específica. Recibe parámetros de entrada y puede retornar un resultado. ¿Qué datos de entrada necesita tu función y qué valor debería devolver?';
    }

    // 7. Arreglos / Vectores / Matrices
    if (text.includes('arreglo') || text.includes('vector') || text.includes('array') || text.includes('matriz') || text.includes('lista') || text.includes('indice') || text.includes('índice')) {
      return 'Un arreglo es una estructura de datos secuencial donde cada elemento se accede por su índice (comenzando en 0). ¿Cómo estás pensando recorrer las posiciones del arreglo para acceder o modificar los datos?';
    }

    // 8. Recursividad
    if (text.includes('recursiv') || text.includes('recursión') || text.includes('recursivo')) {
      return 'La recursividad ocurre cuando una función se invoca a sí misma para resolver un subproblema más pequeño. Todo algoritmo recursivo necesita un caso base para no caer en un bucle infinito. ¿Identificas cuál es el caso base de tu problema?';
    }

    // 9. Fallback socrático general (mantiene "Entiendo tu duda" para compatibilidad de tests)
    return 'Entiendo tu duda. Piensa en esto descomponiendo el problema en partes más simples: ¿cuál es el estado inicial, qué transformación paso a paso debes realizar y cuál es el resultado esperado?';
  }
}
