import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProgressService } from '../progress/progress.service';
import { UserService } from '../user/user.service';

@Injectable()
export class TutorService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly progressService: ProgressService,
    private readonly userService: UserService,
  ) {
    // Configuración del LLM (OpenAI por defecto)
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('OPENAI_API_URL') || 'https://api.openai.com/v1/chat/completions';
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  /**
   * Construir el prompt del sistema con contexto del estudiante
   * El tutor NO modifica el progreso, solo lo lee
   */
  private buildSystemPrompt(progressSummary: string, studentName: string): string {
    return `Eres un tutor inteligente de la asignatura "Fundamentos de Algoritmia" (nivel universitario, 3er semestre).

Tu nombre es STIRE Tutor y tu rol es:
- Actuar como un docente paciente y pedagógico
- Explicar conceptos de algoritmia de manera clara y progresiva
- Usar ejemplos simples en pseudocódigo o diagramas de flujo
- Adaptar tu nivel al progreso del estudiante
- Recomendar qué estudiar basándote en los datos del sistema
- Motivar al estudiante

REGLAS IMPORTANTES:
- NO generes evaluaciones complejas ni exámenes
- NO inventes datos de progreso, usa solo los que se te proporcionan
- Sé conciso pero completo en tus explicaciones
- Usa ejemplos prácticos y cotidianos
- Si el estudiante pregunta algo fuera de algoritmia, redirige amablemente
- NO modifiques el progreso del estudiante, eso lo hace el sistema automáticamente

REGLAS DE RECOMENDACIÓN BASADAS EN MASTERY:
- Si mastery < 40% → Recomienda al estudiante que practique las EVALUACIONES disponibles de esa unidad
- Si mastery 40-70% → Sugiere seguir practicando para consolidar
- Si mastery > 70% → Sugiere avanzar a la siguiente unidad
- Si una unidad tiene urgencia alta (🔴) → Prioriza esa unidad

DATOS DEL ESTUDIANTE:
Nombre: ${studentName}

${progressSummary}

Responde al estudiante basándote en este contexto. Si tiene bajo dominio en un tema, enfócate en explicar desde lo básico. Si ya domina un tema, puedes ser más avanzado.`;
  }

  /**
   * Enviar mensaje al tutor y obtener respuesta
   * El tutor SOLO lee datos, nunca modifica el progreso
   */
  async chat(studentId: number, userMessage: string): Promise<{ response: string }> {
    // Obtener datos del estudiante
    const student = await this.userService.findOne(studentId);
    const progressSummary = await this.progressService.getProgressSummaryForTutor(studentId);

    // Construir el prompt con contexto
    const systemPrompt = this.buildSystemPrompt(progressSummary, student.fullName);

    // Si no hay API key, usar respuesta simulada
    if (!this.apiKey) {
      return this.getSimulatedResponse(userMessage, progressSummary, student.fullName);
    }

    try {
      // Llamar al LLM (OpenAI API)
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
        return {
          response: data.choices[0].message.content,
        };
      }

      return {
        response: 'Lo siento, no pude procesar tu solicitud. Intenta de nuevo.',
      };
    } catch (error) {
      console.error('Error al comunicarse con el LLM:', error);
      // Fallback a respuesta simulada
      return this.getSimulatedResponse(userMessage, progressSummary, student.fullName);
    }
  }

  /**
   * Respuesta simulada cuando no hay API key configurada
   * Útil para desarrollo y pruebas
   */
  private getSimulatedResponse(
    userMessage: string,
    progressSummary: string,
    studentName: string,
  ): { response: string } {
    const lowerMessage = userMessage.toLowerCase();

    // Respuestas básicas contextuales
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos')) {
      return {
        response: `¡Hola ${studentName}! 👋 Soy tu tutor STIRE. Estoy aquí para ayudarte con Fundamentos de Algoritmia. ¿En qué tema te gustaría trabajar hoy?\n\n📊 ${progressSummary}`,
      };
    }

    if (lowerMessage.includes('variable')) {
      return {
        response: `¡Buena pregunta sobre variables! 📝\n\nUna **variable** es como una "caja" donde guardamos datos. Imagina una caja con una etiqueta (nombre) y algo adentro (valor).\n\n**Ejemplo en pseudocódigo:**\n\`\`\`\nentero edad = 20\ncadena nombre = "Juan"\nreal promedio = 4.5\n\`\`\`\n\nCada variable tiene:\n1. **Nombre**: cómo la identificamos (edad, nombre)\n2. **Tipo**: qué puede guardar (entero, cadena, real)\n3. **Valor**: lo que contiene (20, "Juan", 4.5)\n\n💡 **Recomendación**: Si aún no has completado las evaluaciones de esta unidad, te sugiero practicarlas para reforzar el concepto.\n\n¿Quieres que profundicemos en los tipos de datos?`,
      };
    }

    if (lowerMessage.includes('if') || lowerMessage.includes('condicional')) {
      return {
        response: `¡Vamos a ver los condicionales IF! 🔀\n\nEl **IF** nos permite tomar decisiones en nuestro programa. Es como preguntar algo y actuar según la respuesta.\n\n**Ejemplo en pseudocódigo:**\n\`\`\`\nentero edad = 18\n\nSI (edad >= 18) ENTONCES\n    escribir("Eres mayor de edad")\nSINO\n    escribir("Eres menor de edad")\nFIN SI\n\`\`\`\n\n**Clave**: La condición dentro del SI siempre se evalúa como VERDADERO o FALSO.\n\n💡 **Tip**: Practica las evaluaciones disponibles de esta unidad para subir tu dominio.\n\n¿Te gustaría ver un ejemplo más complejo con IF anidados?`,
      };
    }

    if (lowerMessage.includes('for') || lowerMessage.includes('ciclo') || lowerMessage.includes('bucle')) {
      return {
        response: `¡Hablemos de ciclos FOR! 🔄\n\nEl **FOR** nos permite repetir instrucciones un número conocido de veces.\n\n**Ejemplo en pseudocódigo:**\n\`\`\`\n// Imprimir números del 1 al 5\nPARA i = 1 HASTA 5 HACER\n    escribir(i)\nFIN PARA\n\`\`\`\n\n**Salida:** 1, 2, 3, 4, 5\n\n**Partes del FOR:**\n1. **Inicio**: i = 1 (dónde empezamos)\n2. **Condición**: HASTA 5 (cuándo paramos)\n3. **Incremento**: automático (+1)\n\n¿Quieres practicar con un ejercicio?`,
      };
    }

    if (lowerMessage.includes('recomienda') || lowerMessage.includes('estudiar') || lowerMessage.includes('qué debo')) {
      return {
        response: `📋 Basándome en tu progreso, te recomiendo:\n\n${progressSummary}\n\n🎯 **Acción sugerida**: Enfócate en las unidades con urgencia alta (🔴) y completa las evaluaciones pendientes. Cada evaluación que completes actualiza tu progreso automáticamente.\n\n¿Quieres que empecemos con alguno de esos temas?`,
      };
    }

    // Respuesta genérica
    return {
      response: `Entiendo tu pregunta, ${studentName}. 🤔\n\nEn Fundamentos de Algoritmia, ese tema está relacionado con la lógica de programación. Déjame darte una explicación:\n\nLos conceptos fundamentales incluyen:\n1. **Variables y tipos de datos** — Almacenamiento de información\n2. **Estructuras condicionales** (IF/ELSE) — Toma de decisiones\n3. **Ciclos** (FOR/WHILE) — Repetición de instrucciones\n4. **Funciones** — Modularización del código\n\n💡 **Recuerda**: Completar las evaluaciones de cada unidad actualiza tu progreso automáticamente.\n\n¿Podrías especificar un poco más tu duda? Así puedo darte una explicación más precisa y útil.\n\n*Tip: Puedes preguntarme sobre cualquiera de estos temas*`,
    };
  }
}
