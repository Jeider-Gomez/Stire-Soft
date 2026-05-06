import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LearningStateService } from '../learning-state/learning-state.service';
import { UserService } from '../user/user.service';
import { LearningUnitService } from '../learning-unit/learning-unit.service';
import { EvaluationService } from '../evaluation/evaluation.service';

@Injectable()
export class TutorService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly learningStateService: LearningStateService,
    private readonly userService: UserService,
    private readonly learningUnitService: LearningUnitService,
    private readonly evaluationService: EvaluationService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('OPENAI_API_URL') || 'https://api.openai.com/v1/chat/completions';
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  // 1. Detección de la unidad
  private async detectUnit(message: string, studentId: number) {
    const units = await this.learningUnitService.findAll();
    const lowerMessage = message.toLowerCase();

    let bestMatch: any = null;
    let maxMatches = 0;

    for (const unit of units) {
      const words = unit.title.toLowerCase().split(' ').filter(w => w.length > 3);
      let matches = 0;
      for (const word of words) {
        if (lowerMessage.includes(word)) matches++;
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = unit;
      }
    }

    if (bestMatch && maxMatches > 0) {
      // Return unit info + learning state if available (it will be loaded by context builder)
      return { unit: bestMatch };
    }
    return null;
  }

  // 2. Clasificar el nivel del estudiante
  private classifyStudentLevel(mastery: number | null): string {
    if (mastery === null) return 'general';
    if (mastery < 30) return 'principiante';
    if (mastery < 60) return 'intermedio';
    if (mastery < 85) return 'avanzado';
    return 'experto';
  }

  // 3. Activar práctica si es necesario
  private async suggestPractice(studentId: number, unitId: number, mastery: number, successRate: number, message: string) {
    const practiceKeywords = ['ejercicio', 'practicar', 'ejemplo', 'ayuda'];
    const wantsPractice = practiceKeywords.some(kw => message.toLowerCase().includes(kw));

    if (mastery < 60 || successRate < 50 || wantsPractice) {
      const evaluations = await this.evaluationService.findActiveByUnit(unitId);
      if (evaluations.length > 0) {
        return {
          shouldPractice: true,
          reason: mastery < 60 ? 'mastery bajo' : (successRate < 50 ? 'tasa de éxito baja' : 'solicitud explícita'),
          exercises: evaluations.map(e => ({
            id: e.id,
            title: e.title,
            type: e.type,
            difficulty: e.difficulty
          }))
        };
      }
    }
    return null;
  }

  private buildSystemPrompt(context: any, studentName: string, level: string, practice: any): string {
    let prompt = `Eres un tutor inteligente de "Fundamentos de Algoritmia".
Estudiante: ${studentName}
Nivel estimado para la consulta actual: ${level.toUpperCase()}

REGLAS IMPORTANTES:
- Actuar como docente paciente y pedagógico.
- Adaptar tu respuesta al nivel:
  * PRINCIPIANTE: explica desde cero, usa analogías simples.
  * INTERMEDIO: refuerza con ejemplos paso a paso.
  * AVANZADO: sugiere optimizaciones o retos.
  * EXPERTO: solo responde dudas muy puntuales.
- NO generes exámenes ni inventes progreso.
- NO modifiques el progreso.

CONTEXTO ACTUAL:\n`;
    
    if (context.currentUnit) {
      prompt += `Unidad en discusión: ${context.currentUnit.title}\nEstado: ${context.currentUnit.state}\nDominio (mastery): ${context.currentUnit.mastery}%\nTasa de éxito: ${context.currentUnit.successRate}%\nUrgencia: ${context.currentUnit.urgencyLevel}\n\n`;
    }

    if (context.priorities && context.priorities.length > 0) {
      prompt += `Prioridades del estudiante:\n`;
      context.priorities.forEach(p => {
        prompt += `- ${p.title} (${p.state}, ${p.mastery}%)\n`;
      });
    }

    if (practice) {
      prompt += `\nINSTRUCCIÓN ADICIONAL:\nRecomienda al estudiante que practique con estos ejercicios disponibles en el sistema:\n`;
      practice.exercises.forEach(e => {
        prompt += `- [${e.difficulty.toUpperCase()}] ${e.title}\n`;
      });
    }

    prompt += `\nResponde amigablemente a la siguiente consulta del estudiante.`;
    return prompt;
  }

  async chat(studentId: number, userMessage: string) {
    const student = await this.userService.findOne(studentId);
    
    // 1. Detect unit
    const detected = await this.detectUnit(userMessage, studentId);
    const unitId = detected ? detected.unit.id : undefined;

    // 2. Build context
    const context = await this.learningStateService.getProgressSummaryForTutor(studentId, unitId);
    
    // 3. Classify level
    const mastery = context?.currentUnit ? context.currentUnit.mastery : null;
    const level = this.classifyStudentLevel(mastery);

    // 4. Check practice activation
    let practice: any = null;
    if (detected && context?.currentUnit) {
      practice = await this.suggestPractice(studentId, detected.unit.id, context.currentUnit.mastery, context.currentUnit.successRate, userMessage);
    }

    const systemPrompt = this.buildSystemPrompt(context || {}, student.fullName, level, practice);

    let llmResponse = '';

    if (!this.apiKey) {
      llmResponse = this.getSimulatedResponse(userMessage, context || {}, student.fullName, level, practice);
    } else {
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });
        const data = await response.json() as any;
        if (data.choices && data.choices.length > 0) {
          llmResponse = data.choices[0].message.content;
        } else {
          llmResponse = 'Lo siento, no pude procesar tu solicitud.';
        }
      } catch (error) {
        console.error('Error LLM:', error);
        llmResponse = this.getSimulatedResponse(userMessage, context || {}, student.fullName, level, practice);
      }
    }

    return {
      response: llmResponse,
      detectedUnit: detected?.unit.title || null,
      studentLevel: level,
      suggestedPractice: practice?.exercises || []
    };
  }

  private getSimulatedResponse(userMessage: string, context: any, studentName: string, level: string, practice: any): string {
    const lowerMessage = userMessage.toLowerCase();
    let res = '';

    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos')) {
      res = `¡Hola ${studentName}! 👋 Soy tu tutor STIRE. Veo que tienes ${context.stats?.totalUnits || 0} unidades asignadas. ¿En qué tema te gustaría trabajar hoy?`;
    } else if (context.currentUnit) {
      res = `Entiendo que estás preguntando sobre **${context.currentUnit.title}**.\n`;
      if (level === 'principiante') {
        res += `Como estás empezando (Dominio: ${context.currentUnit.mastery}%), te explico desde lo más básico. Imagina que es como seguir una receta paso a paso...`;
      } else if (level === 'intermedio') {
        res += `Tienes un buen avance (Dominio: ${context.currentUnit.mastery}%). Vamos a revisar un ejemplo más específico...`;
      } else {
        res += `¡Excelente nivel! (Dominio: ${context.currentUnit.mastery}%). Aquí tienes la respuesta precisa a tu duda...`;
      }
    } else {
      res = `Entiendo tu pregunta, ${studentName}. ¿Podrías especificar a qué tema te refieres para ayudarte mejor?`;
    }

    if (practice) {
      res += `\n\n📝 **Te recomiendo practicar:**\n`;
      practice.exercises.forEach(e => {
        res += `- [${e.difficulty.toUpperCase()}] ${e.title}\n`;
      });
    }

    return res;
  }
}
