import { Injectable, Logger } from '@nestjs/common';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);

  constructor(
    private readonly convRepo: TutorConversationsRepository,
    private readonly contextService: TutorContextService,
  ) {}

  async sendMessage(studentId: number, message: string): Promise<string> {
    // 1. Guardar mensaje del usuario
    await this.convRepo.save({
      studentId,
      role: 'user',
      content: message,
    });

    // 2. Construir Contexto (RAG + Historial)
    const systemPrompt = await this.contextService.buildSystemPrompt(studentId);
    const history = await this.convRepo.getRecentContext(studentId, 6);

    // Formatear payload para OpenAI / Anthropic
    const payload = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    this.logger.log(`LLM Payload preparado con ${payload.length} mensajes. Ejecutando inferencia...`);

    // 3. Mock de llamada a la API del LLM
    // const response = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: payload });
    const aiResponseContent = this.mockLlmInference(message);

    // 4. Guardar respuesta del asistente
    await this.convRepo.save({
      studentId,
      role: 'assistant',
      content: aiResponseContent,
    });

    return aiResponseContent;
  }

  private mockLlmInference(userMessage: string): string {
    const isCode = userMessage.includes('{') || userMessage.includes('function');
    if (isCode) {
      return 'Veo que estás intentando escribir código. Recuerda revisar la condición de parada de tu bucle. ¿Qué crees que pasaría si la variable "i" nunca alcanza el límite?';
    }
    return 'Entiendo tu duda. Piensa en esto como si estuvieras organizando libros en un estante. ¿Cómo aplicarías ese concepto aquí?';
  }
}
