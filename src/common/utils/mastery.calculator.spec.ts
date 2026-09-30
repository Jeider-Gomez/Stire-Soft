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

  describe('casillas y repasos (práctica adaptativa)', () => {
    const base = { totalPoints: 100, passingScore: 60, adaptiveWeight: 1, activityType: { baseWeight: 1 } };
    const mcq = (id: number) => ({ id, difficulty: Difficulty.INTERMEDIO, questionType: 'mcq', ...base });
    const ordenar = (id: number) => ({ id, difficulty: Difficulty.INTERMEDIO, questionType: 'ordering', ...base });

    it('agregar hermanas sin hacer no baja el dominio: la casilla cuenta con la mejor', () => {
      const sinVariantes = calculateUnitMastery([{ activityId: 1, score: 100 }], [mcq(1)]);
      const conVariantes = calculateUnitMastery([{ activityId: 1, score: 100 }], [mcq(1), mcq(2), mcq(3)]);
      expect(sinVariantes).toBe(100);
      expect(conVariantes).toBe(100);
    });

    it('resolver varias hermanas no infla el dominio más allá de su casilla', () => {
      const submissions = [{ activityId: 1, score: 100 }, { activityId: 2, score: 100 }];
      expect(calculateUnitMastery(submissions, [mcq(1), mcq(2), ordenar(3)])).toBe(50);
    });

    it('un repaso fallado, si es lo último de la casilla, baja el dominio', () => {
      const submissions = [
        { activityId: 1, score: 100, submittedAt: new Date(2026, 8, 1) },
        { activityId: 2, score: 20, isReview: true, submittedAt: new Date(2026, 8, 10) },
      ];
      expect(calculateUnitMastery(submissions, [mcq(1), mcq(2)])).toBe(20);
    });

    it('recuperarse en un repaso posterior devuelve el dominio', () => {
      const submissions = [
        { activityId: 1, score: 100, submittedAt: new Date(2026, 8, 1) },
        { activityId: 2, score: 20, isReview: true, submittedAt: new Date(2026, 8, 10) },
        { activityId: 2, score: 90, isReview: true, submittedAt: new Date(2026, 8, 11) },
      ];
      expect(calculateUnitMastery(submissions, [mcq(1), mcq(2)])).toBe(100);
    });

    it('un fallo que no es repaso (práctica normal) no baja el dominio ya ganado', () => {
      const submissions = [
        { activityId: 1, score: 100, submittedAt: new Date(2026, 8, 1) },
        { activityId: 2, score: 20, submittedAt: new Date(2026, 8, 2) },
      ];
      expect(calculateUnitMastery(submissions, [mcq(1), mcq(2)])).toBe(100);
    });

    it('un repaso fallado solo afecta su casilla', () => {
      const submissions = [
        { activityId: 1, score: 100, submittedAt: new Date(2026, 8, 1) },
        { activityId: 3, score: 100, submittedAt: new Date(2026, 8, 1) },
        { activityId: 1, score: 0, isReview: true, submittedAt: new Date(2026, 8, 10) },
      ];
      expect(calculateUnitMastery(submissions, [mcq(1), ordenar(3)])).toBe(50);
    });
  });

  // Reto de salto (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.3). En la simulación del segundo salón (30/09), Julián dijo
  // «Me siento seguro», acertó el reto intermedio y el recomendador dio la unidad por completa; el dominio quedó en 30 %
  // porque contaba como pendientes las tres casillas básicas que ya no se le exigían.
  describe('reto de salto', () => {
    const base = { totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } };
    const basico = (id: number, questionType: string) => ({ id, difficulty: Difficulty.BASICO, questionType, ...base });
    const intermedio = (id: number) => ({ id, difficulty: Difficulty.INTERMEDIO, questionType: 'coding', ...base });
    const unidad = [basico(1, 'mcq'), basico(2, 'matching'), basico(3, 'coding'), intermedio(4)];

    it('sin salto, las casillas básicas sin hacer cuentan como pendientes', () => {
      expect(calculateUnitMastery([{ activityId: 4, score: 100 }], unidad)).toBe(25);
    });

    it('con el nivel básico saltado, las casillas básicas que nunca intentó no cuentan', () => {
      expect(calculateUnitMastery([{ activityId: 4, score: 100 }], unidad, 1)).toBe(100);
    });

    it('una casilla saltada que sí intentó cuenta con su nota: el salto no borra evidencia', () => {
      const submissions = [{ activityId: 4, score: 100 }, { activityId: 1, score: 0 }];
      expect(calculateUnitMastery(submissions, unidad, 1)).toBe(50);
    });
  });
});
