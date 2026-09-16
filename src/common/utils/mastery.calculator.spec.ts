import { calculateUnitMastery } from './mastery.calculator';
import { Difficulty } from '../enums/difficulty.enum';

describe('calculateUnitMastery', () => {
  it('no penaliza actividades sin difficulty definida (compatibilidad con fixtures existentes)', () => {
    const activities = [{ id: 1, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } }];
    const submissions = [
      { activityId: 1, score: 60 },
      { activityId: 1, score: 60 },
      { activityId: 1, score: 60 },
      { activityId: 1, score: 100 },
      { activityId: 1, score: 100 },
    ];

    expect(calculateUnitMastery(submissions, activities)).toBe(100);
  });

  it('no penaliza repetir una actividad BASICO dentro de los intentos libres (<=2)', () => {
    const activities = [{ id: 1, difficulty: Difficulty.BASICO, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } }];
    const submissions = [
      { activityId: 1, score: 50 },
      { activityId: 1, score: 100 },
    ];

    expect(calculateUnitMastery(submissions, activities)).toBe(100);
  });

  it('penaliza el mejor score de una actividad BASICO resuelta tras muchos intentos', () => {
    const activities = [{ id: 1, difficulty: Difficulty.BASICO, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } }];
    // 5 intentos: 2 libres + 3 de exceso -> factor = 1 - 3*0.15 = 0.55
    const submissions = [
      { activityId: 1, score: 20 },
      { activityId: 1, score: 30 },
      { activityId: 1, score: 40 },
      { activityId: 1, score: 60 },
      { activityId: 1, score: 100 },
    ];

    expect(calculateUnitMastery(submissions, activities)).toBe(55);
  });

  it('el factor de penalización nunca baja del piso mínimo (0.5) sin importar cuántos intentos', () => {
    const activities = [{ id: 1, difficulty: Difficulty.BASICO, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } }];
    const submissions = Array.from({ length: 20 }, () => ({ activityId: 1, score: 100 }));

    expect(calculateUnitMastery(submissions, activities)).toBe(50);
  });

  it('no penaliza actividades INTERMEDIO o AVANZADO sin importar el número de intentos', () => {
    const activities = [
      { id: 1, difficulty: Difficulty.INTERMEDIO, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
      { id: 2, difficulty: Difficulty.AVANZADO, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
    ];
    const submissions = [
      ...Array.from({ length: 10 }, () => ({ activityId: 1, score: 100 })),
      ...Array.from({ length: 10 }, () => ({ activityId: 2, score: 100 })),
    ];

    expect(calculateUnitMastery(submissions, activities)).toBe(100);
  });

  it('la penalización solo afecta la actividad repetida, no arrastra a las demás actividades de la unidad', () => {
    const activities = [
      { id: 1, difficulty: Difficulty.BASICO, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
      { id: 2, difficulty: Difficulty.AVANZADO, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
    ];
    // Actividad 1 (BASICO): 20 intentos -> factor 0.5 -> aporta (100/100)*1*0.5 = 0.5
    // Actividad 2 (AVANZADO): 1 intento -> factor 1 -> aporta (100/100)*1*1 = 1
    // Mastery = round((0.5 + 1) / (1 + 1) * 100) = 75
    const submissions = [
      ...Array.from({ length: 20 }, () => ({ activityId: 1, score: 100 })),
      { activityId: 2, score: 100 },
    ];

    expect(calculateUnitMastery(submissions, activities)).toBe(75);
  });
});
