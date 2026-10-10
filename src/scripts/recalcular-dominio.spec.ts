import { debeGuardarse, resumenCambios } from './recalcular-dominio';

describe('recalcular el dominio con el motor nuevo (una vez, después de desplegar)', () => {
  it('dice cuántas lecciones suben, cuántas llegan al 100 % y cuáles se conservan', () => {
    const r = resumenCambios([
      { studentId: 10, learningUnitId: 22, antes: 96, despues: 100 },
      { studentId: 10, learningUnitId: 4, antes: 100, despues: 100 },
      { studentId: 11, learningUnitId: 5, antes: 80, despues: 75 },
    ]);
    expect(r).toContain(
      '3 lecciones revisadas: 1 suben (1 llegan al 100 %), 1 quedan igual y 1 se conservan (bajarían, pero no se baja nada: 0 bajan).',
    );
    expect(r).toContain('sube: estudiante 10, lección 22: 96 % → 100 %');
    expect(r).toContain(
      'se conserva: estudiante 11, lección 5: queda en 80 % (el cálculo da 75 %)',
    );
  });

  it('nunca baja un dominio ya ganado: solo se guarda lo que sube (10/10, Jeider; el estudiante 4 bajaba de 100 a 29)', () => {
    expect(
      debeGuardarse({
        studentId: 10,
        learningUnitId: 22,
        antes: 96,
        despues: 100,
      }),
    ).toBe(true);
    expect(
      debeGuardarse({
        studentId: 4,
        learningUnitId: 1,
        antes: 100,
        despues: 29,
      }),
    ).toBe(false);
    expect(
      debeGuardarse({
        studentId: 1,
        learningUnitId: 1,
        antes: 50,
        despues: 50,
      }),
    ).toBe(false);
  });
});
