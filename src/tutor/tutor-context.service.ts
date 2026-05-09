import { Injectable } from '@nestjs/common';
import { LearningProgressRepository } from '../learning-progress/learning-progress.repository';

@Injectable()
export class TutorContextService {
  constructor(private readonly progressRepo: LearningProgressRepository) {}

  async buildSystemPrompt(studentId: number): Promise<string> {
    // Buscar el progreso general del estudiante
    const progressRecords = await this.progressRepo.find({ where: { studentId } });
    
    let avgMastery = 0;
    if (progressRecords.length > 0) {
      avgMastery = progressRecords.reduce((sum, p) => sum + p.mastery, 0) / progressRecords.length;
    }

    const level = avgMastery > 80 ? 'AVANZADO' : avgMastery > 50 ? 'INTERMEDIO' : 'PRINCIPIANTE';
    
    // RAG Dinámico (Retrieval-Augmented Generation) basado en métricas
    return `
Eres el Tutor IA de STIRE (Smart Tutor for Interactive & Responsive Education).
Actualmente estás hablando con un estudiante de nivel ${level} (Mastery Global: ${Math.round(avgMastery)}%).

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
