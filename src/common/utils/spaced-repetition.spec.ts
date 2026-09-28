import { calculateNextReview, calidadDeRepaso, INTERVALO_MAXIMO_DIAS } from './spaced-repetition';

const INICIAL = { repetitions: 0, intervalDays: 1, easeFactor: 2.5 };
const HOY = new Date(2026, 8, 27, 10, 0);

describe('calidadDeRepaso', () => {
  it('traduce el resultado como los botones de Anki', () => {
    expect(calidadDeRepaso({ aprobado: false, primerIntento: true, seSentiaSeguro: true })).toBe(1);
    expect(calidadDeRepaso({ aprobado: true, primerIntento: false, seSentiaSeguro: true })).toBe(3);
    expect(calidadDeRepaso({ aprobado: true, primerIntento: true, seSentiaSeguro: false })).toBe(4);
    expect(calidadDeRepaso({ aprobado: true, primerIntento: true, seSentiaSeguro: true })).toBe(5);
  });
});

describe('calculateNextReview (SM-2 con calidad del resultado)', () => {
  it('los intervalos crecen con cada repaso acertado: 1, 3 y luego ×factor', () => {
    const r1 = calculateNextReview(INICIAL, 4, HOY);
    const r2 = calculateNextReview(r1, 4, HOY);
    const r3 = calculateNextReview(r2, 4, HOY);
    expect([r1.intervalDays, r2.intervalDays, r3.intervalDays]).toEqual([1, 3, 8]);
    expect(r3.repetitions).toBe(3);
  });

  it('un repaso fallado reinicia el intervalo aunque viniera de muchos aciertos', () => {
    const avanzado = { repetitions: 5, intervalDays: 30, easeFactor: 2.6 };
    const r = calculateNextReview(avanzado, 1, HOY);
    expect(r).toEqual(expect.objectContaining({ repetitions: 0, intervalDays: 1, easeFactor: 2.6 }));
  });

  it('acertar con dificultad baja el factor de facilidad y acertar seguro lo sube', () => {
    const conDificultad = calculateNextReview({ repetitions: 2, intervalDays: 3, easeFactor: 2.5 }, 3, HOY);
    const seguro = calculateNextReview({ repetitions: 2, intervalDays: 3, easeFactor: 2.5 }, 5, HOY);
    expect(conDificultad.easeFactor).toBeLessThan(2.5);
    expect(seguro.easeFactor).toBeGreaterThan(2.5);
    expect(seguro.intervalDays).toBeGreaterThan(conDificultad.intervalDays);
  });

  it('el factor de facilidad nunca baja de 1.3', () => {
    let estado = { repetitions: 2, intervalDays: 3, easeFactor: 1.35 };
    for (let i = 0; i < 5; i++) estado = calculateNextReview(estado, 3, HOY);
    expect(estado.easeFactor).toBe(1.3);
  });

  it('el intervalo nunca pasa del máximo', () => {
    const r = calculateNextReview({ repetitions: 8, intervalDays: 50, easeFactor: 2.5 }, 5, HOY);
    expect(r.intervalDays).toBe(INTERVALO_MAXIMO_DIAS);
  });

  it('la fecha del próximo repaso es hoy + el intervalo', () => {
    const r = calculateNextReview({ repetitions: 1, intervalDays: 1, easeFactor: 2.5 }, 4, HOY);
    const esperado = new Date(HOY);
    esperado.setDate(esperado.getDate() + 3);
    expect(r.nextReviewDate.getTime()).toBe(esperado.getTime());
  });
});
