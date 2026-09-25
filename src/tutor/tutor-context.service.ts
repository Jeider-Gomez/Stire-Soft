import { Injectable } from '@nestjs/common';
import { LearningProgressRepository } from '../learning-progress/learning-progress.repository';
import { GuidanceLevel, guidanceInstruction } from './tutor-guidance';
import { TutorStyle, styleInstruction } from './tutor-settings';
import { isHighlightLanguage } from '../common/code-languages';

@Injectable()
export class TutorContextService {
  constructor(private readonly progressRepo: LearningProgressRepository) {}

  async buildSystemPrompt(
    studentId: number,
    context?: any,
    guidanceLevel?: GuidanceLevel | null,
    style?: TutorStyle,
  ): Promise<string> {
    const progressRecords = await this.progressRepo.find({ where: { studentId } });

    let avgMastery = 0;
    if (progressRecords.length > 0) {
      avgMastery = progressRecords.reduce((sum, p) => sum + p.mastery, 0) / progressRecords.length;
    }

    const level = avgMastery > 80 ? 'AVANZADO' : avgMastery > 50 ? 'INTERMEDIO' : 'PRINCIPIANTE';

    let locationContext = '';
    if (context && typeof context === 'object') {
      const parts: string[] = [];
      if (context.currentRoute) parts.push(`Ubicación en la plataforma: ${context.currentRoute}`);
      if (context.unitTitle) parts.push(`Unidad actual: "${context.unitTitle}" (ID: ${context.learningUnitId || 'N/A'})`);
      if (context.activityTitle) parts.push(`Actividad / Ejercicio actual: "${context.activityTitle}" (ID: ${context.activityId || 'N/A'})`);
      if (context.currentCode && typeof context.currentCode === 'string' && context.currentCode.trim()) {
        const truncatedCode = context.currentCode.trim().slice(0, 1500);
        // Fase 26: en un ejercicio de HTML y CSS el código es HTML/CSS, no JavaScript (lista blanca: el cliente no puede colar texto en la valla).
        const codeLanguage = isHighlightLanguage(context.codeLanguage) ? context.codeLanguage : 'javascript';
        parts.push(`Código actual en el editor del estudiante:\n\`\`\`${codeLanguage}\n${truncatedCode}\n\`\`\``);
      }
      if (parts.length > 0) {
        locationContext = `\nCONTEXTO ACTIVO DEL ESTUDIANTE EN PANTALLA:\n${parts.join('\n')}\n`;
      }
    }

    const recentProgress = progressRecords
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 3)
      .map((record, index) =>
        `- Progreso ${index + 1}: Unidad ${record.learningUnitId}, mastery ${Math.round(record.mastery)}%, successRate ${Math.round(record.successRate)}%, actividades completadas ${record.completedActivities}`,
      )
      .join('\n');

    const recentProgressSection = recentProgress
      ? `\nÚLTIMOS PROGRESOS DEL ESTUDIANTE:\n${recentProgress}\n`
      : '';

    const guidanceSection = guidanceLevel
      ? `
NIVEL DE AYUDA ACTUAL (sube solo con los intentos fallidos del estudiante en esta actividad; no lo menciones como número):
${guidanceInstruction(guidanceLevel)}
`
      : '';

    const styleLine = style ? styleInstruction(style) : null;
    const styleSection = styleLine ? `\n${styleLine}\n` : '';

    return `
Eres el Tutor Inteligente de STIRE (Smart Tutor for Interactive & Responsive Education), para el curso de Algoritmos Básicos con HTML5, CSS y JavaScript para Desarrollo Web.
Actualmente estás orientando a un estudiante de nivel ${level} (Maestría Global: ${Math.round(avgMastery)}%).
${locationContext}
${recentProgressSection}${guidanceSection}${styleSection}
REGLAS PEDAGÓGICAS ESTRICTAS:
1. NUNCA resuelvas el ejercicio directamente ni des la respuesta o el código completo.
2. Utiliza el Método Socrático: responde con una pregunta orientadora, pista conceptual o metáfora según su código.
3. Como el estudiante es nivel ${level}, ajusta tu complejidad:
   - Si es principiante: usa metáforas del mundo real y sé muy motivador.
   - Si es avanzado: enfócate en eficiencia, Big O Notation, y buenas prácticas de ingeniería de software.
4. Si el estudiante te consulta sobre su ejercicio o código, apóyate en el contexto activo de pantalla que tienes arriba.
5. Mantén tus respuestas claras, motivadoras y concisas (menos de 130 palabras).
6. Cuando sientas que un concepto ya quedó claro, puedes preguntarle de forma natural y con tus propias palabras si quiere practicarlo con un ejercicio o si prefiere repasar primero el contenido teórico de la unidad — es una sugerencia conversacional tuya, no un formulario: no la ofrezcas en cada respuesta, solo cuando de verdad aporte.
`;
  }
}
