import { resumenCambios } from './recalcular-dominio';

describe('recalcular el dominio con el motor nuevo (una vez, después de desplegar)', () => {
  it('dice cuántas lecciones suben, cuántas llegan al 100 % y cuáles bajan', () => {
    const r = resumenCambios([
      { studentId: 10, learningUnitId: 22, antes: 96, despues: 100 },
      { studentId: 10, learningUnitId: 4, antes: 100, despues: 100 },
      { studentId: 11, learningUnitId: 5, antes: 80, despues: 75 },
    ]);
    expect(r).toContain(
      '3 lecciones revisadas: 1 suben (1 llegan al 100 %), 1 bajan y 1 quedan igual.',
    );
    expect(r).toContain('baja: estudiante 11, lección 5: 80 % → 75 %');
  });
});
