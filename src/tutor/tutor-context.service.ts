import { Injectable } from '@nestjs/common';
import { LearningProgressRepository } from '../learning-progress/learning-progress.repository';

@Injectable()
export class TutorContextService {
  constructor(private readonly progressRepo: LearningProgressRepository) {}

  async buildSystemPrompt(studentId: number): Promise<string> {
    const progressRecords = await this.progressRepo.find({ where: { studentId } });

    let avgMastery = 0;
    if (progressRecords.length > 0) {
      avgMastery = progressRecords.reduce((sum, p) => sum + p.mastery, 0) / progressRecords.length;
    }

    const level = avgMastery > 80 ? 'AVANZADO' : avgMastery > 50 ? 'INTERMEDIO' : 'PRINCIPIANTE';

    const recentProgress = progressRecords
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 3)
      .map((record, index) =>
        `- Progreso ${index + 1}: Unidad ${record.learningUnitId}, mastery ${Math.round(record.mastery)}%, successRate ${Math.round(record.successRate)}%, actividades completadas ${record.completedActivities}`,
      )
      .join('\n');

    const recentProgressSection = recentProgress
      ? `\nÚLTIMOS 3 PROGRESOS:\n${recentProgress}\n`
      : '';

    return `
Eres el Tutor IA de STIRE (Smart Tutor for Interactive & Responsive Education).
Actualmente estás hablando con un estudiante de nivel ${level} (Mastery Global: ${Math.round(avgMastery)}%).
${recentProgressSection}
REGLAS ESTRÍCTAS:
1. NUNCA resuelvas el problema directamente ni des el código completo.
2. Como el estudiante es nivel ${level}, ajusta tu complejidad.
   - Si es principiante: Usa metáforas del mundo real y sé muy motivador.
   - Si es avanzado: Enfócate en eficiencia, Big O Notation, y buenas prácticas de ingeniería de software.
3. Utiliza el Método Socrático: haz preguntas para que el estudiante descubra la respuesta por sí mismo.
4. Mantén tus respuestas concisas y directas (idealmente < 150 palabras).
`;
  }
}
