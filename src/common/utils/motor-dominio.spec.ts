import { Difficulty } from '../enums/difficulty.enum';
import {
  ActividadDominio,
  IntentoDominio,
  REGLAS,
  calcularDominio,
  casillasDeDominio,
  gananciaSiLoResuelve,
  intentosDisponibles,
} from './motor-dominio';

// docs/DISENO_DOMINIO.md. Las fechas van después del corte (reglas nuevas) salvo donde se prueba el corte.
const DIA = 86_400_000;
const t0 = new Date('2026-10-12T15:00:00Z').getTime();
const act = (
  id: number,
  questionType = 'mcq',
  difficulty = Difficulty.BASICO,
  extra: Partial<ActividadDominio> = {},
): ActividadDominio => ({
  id,
  questionType,
  difficulty,
  totalPoints: 10,
  passingScore: 60,
  adaptiveWeight: 1,
  activityType: { baseWeight: 1 },
  ...extra,
});
let reloj = t0;
const intento = (
  activityId: number,
  score: number,
  extra: Partial<IntentoDominio> = {},
): IntentoDominio => {
  reloj += 60_000;
  return { activityId, score, submittedAt: new Date(reloj), ...extra };
};
beforeEach(() => {
  reloj = t0;
});

describe('motor del dominio: sube y baja con evidencia', () => {
  const una = [act(1), act(2)]; // una casilla (opción múltiple básico) con dos parecidos

  it('quien ya sabe avanza rápido: un ejercicio nuevo aprobado a la primera llena su casilla', () => {
    expect(calcularDominio([intento(1, 10)], una)).toBe(100);
  });

  it('aprobar tras fallar sube menos, y repetir el mismo sube cada vez menos', () => {
    const a = calcularDominio([intento(1, 0), intento(1, 10)], una);
    const b = calcularDominio(
      [intento(1, 0), intento(1, 0), intento(1, 10)],
      una,
    );
    expect(a).toBe(60);
    expect(b).toBeLessThan(a);
    // Un parecido NUEVO sí la completa: variar es la forma de subir rápido.
    expect(
      calcularDominio([intento(1, 0), intento(1, 10), intento(2, 10)], una),
    ).toBe(100);
  });

  it('volver a aprobar uno ya aprobado suma poco, pero suma', () => {
    const h = [intento(1, 0), intento(1, 10)]; // 60
    const otraVez = calcularDominio([...h, intento(1, 10)], una);
    expect(otraVez).toBe(70); // 60 + 0,25 × 40
  });

  it('un error baja poco, nunca toda la lección', () => {
    const h = [intento(1, 10)]; // 100
    expect(calcularDominio([...h, intento(2, 0)], una)).toBe(90);
    expect(
      calcularDominio([...h, intento(2, 0, { isReview: true })], una),
    ).toBe(75); // olvidó: baja más
    expect(
      calcularDominio([...h, intento(2, 0), intento(2, 0), intento(2, 0)], una),
    ).toBeGreaterThan(70);
  });

  it('lo que sí sabe cuenta un poco aunque no apruebe (3 de 10 casos)', () => {
    expect(calcularDominio([intento(1, 3)], una)).toBe(8); // 0,25 × 0,3
  });

  it('los niveles pueden pesar distinto (desactivado durante la prueba: todos pesan 1)', () => {
    const acts = [act(1), act(2, 'mcq', Difficulty.AVANZADO)];
    expect(calcularDominio([intento(2, 10)], acts)).toBe(50);
    const pesoNivel = {
      [Difficulty.BASICO]: 1,
      [Difficulty.INTERMEDIO]: 1.5,
      [Difficulty.AVANZADO]: 2,
    };
    expect(calcularDominio([intento(1, 10)], acts, { pesoNivel })).toBe(33); // 1 de 3
    expect(calcularDominio([intento(2, 10)], acts, { pesoNivel })).toBe(67); // 2 de 3
  });

  it('el reto de salto: las casillas de abajo que nunca intentó no cuentan', () => {
    const acts = [act(1), act(2, 'mcq', Difficulty.INTERMEDIO)];
    expect(
      calcularDominio([intento(2, 10)], acts, { nivelSaltadoHasta: 1 }),
    ).toBe(100);
  });

  it('antes del corte rigen las reglas de antes: a nadie se le quita lo que ganó', () => {
    const viejo = new Date('2026-10-05T12:00:00Z');
    const h: IntentoDominio[] = [
      { activityId: 1, score: 0, submittedAt: viejo },
      {
        activityId: 1,
        score: 10,
        submittedAt: new Date(viejo.getTime() + 60_000),
      },
    ];
    expect(calcularDominio(h, una)).toBe(100); // antes, 2 intentos eran «libres»
  });

  it('una actividad sin puntos no se puede calificar: no forma casilla (no deja la lección sin salida)', () => {
    expect(
      casillasDeDominio(
        [],
        [act(1, 'mcq', Difficulty.BASICO, { totalPoints: 0 })],
      ),
    ).toEqual([]);
  });
});

describe('cuánto sube si lo resuelve (la lista usa las mismas reglas que el dominio)', () => {
  it('el caso de Valentina (09/10): 3 intentos en un básico dejaban la casilla en 85 y la lista decía «no sube»', () => {
    const viejo = new Date('2026-10-05T12:00:00Z').getTime();
    const acts = [
      act(85, 'ordering'),
      act(180, 'ordering'),
      act(82),
      act(84, 'fill_code'),
    ];
    const h: IntentoDominio[] = [
      { activityId: 85, score: 0, submittedAt: new Date(viejo) },
      { activityId: 85, score: 0, submittedAt: new Date(viejo + 1) },
      { activityId: 85, score: 10, submittedAt: new Date(viejo + 2) },
      { activityId: 82, score: 10, submittedAt: new Date(viejo + 3) },
      { activityId: 84, score: 10, submittedAt: new Date(viejo + 4) },
    ];
    expect(calcularDominio(h, acts)).toBe(95);
    expect(gananciaSiLoResuelve(h, acts, 180)).toBe(5); // el parecido sí sube: la lista lo dirá
    expect(gananciaSiLoResuelve(h, acts, 82)).toBe(0); // su casilla ya está completa
  });
});

describe('los intentos se reabren: ningún ejercicio queda cerrado para siempre', () => {
  const ahora = new Date(t0);
  it('quedan los que no ha usado; sin límite, infinitos', () => {
    expect(intentosDisponibles(3, [new Date(t0 - 1000)], ahora)).toEqual({
      quedan: 2,
      reabreEn: null,
    });
    expect(intentosDisponibles(0, [new Date(t0)], ahora).quedan).toBe(
      Number.POSITIVE_INFINITY,
    );
  });
  it('con el límite usado, se reabre uno a las 24 horas del último', () => {
    const ultimo = new Date(t0 - 3_600_000);
    expect(intentosDisponibles(1, [ultimo], ahora)).toEqual({
      quedan: 0,
      reabreEn: new Date(ultimo.getTime() + DIA),
    });
    expect(intentosDisponibles(1, [new Date(t0 - DIA)], ahora)).toEqual({
      quedan: 1,
      reabreEn: null,
    });
  });
});

describe('GARANTÍA: desde cualquier historial, aprobar lleva la lección al 100 %', () => {
  // Generador determinista: la prueba falla igual en cualquier máquina.
  let semilla = 7;
  const azar = () =>
    (semilla = (semilla * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const elegir = <T>(xs: T[]) => xs[Math.floor(azar() * xs.length)];
  const TIPOS = ['mcq', 'ordering', 'matching', 'fill_code', 'coding', null];
  const NIVELES = [
    Difficulty.BASICO,
    Difficulty.INTERMEDIO,
    Difficulty.AVANZADO,
  ];

  it('500 lecciones al azar (1 a 8 ejercicios, cualquier límite de intentos) y 0 a 30 intentos al azar', () => {
    for (let caso = 0; caso < 500; caso++) {
      const n = 1 + Math.floor(azar() * 8);
      const acts = Array.from({ length: n }, (_, i) =>
        act(i + 1, elegir(TIPOS) as string, elegir(NIVELES), {
          totalPoints: elegir([5, 10, 20, 100]),
          passingScore: elegir([50, 60, 70, 100]),
          adaptiveWeight: elegir([0.4, 1, 2]),
        }),
      );
      const historial: IntentoDominio[] = [];
      const m = Math.floor(azar() * 31);
      for (let i = 0; i < m; i++) {
        const a = elegir(acts);
        historial.push(
          intento(a.id, Math.round(azar() * a.totalPoints), {
            isReview: azar() < 0.2,
          }),
        );
      }
      // Estrategia mínima del estudiante: resolver bien, una y otra vez, el primer ejercicio de cada casilla que no esté
      // completa (los intentos se reabren con el tiempo, así que siempre hay uno). Debe llegar al 100 % en pocos pasos.
      let pasos = 0;
      while (calcularDominio(historial, acts) < 100 && pasos < 200) {
        const pendiente = casillasDeDominio(historial, acts).find(
          (c) => c.estimacion < 1,
        )!;
        const a = acts.find((x) => x.id === pendiente.actividades[0])!;
        reloj += DIA;
        historial.push(intento(a.id, a.totalPoints));
        pasos++;
      }
      expect(calcularDominio(historial, acts)).toBe(100);
      // Con REGLAS.repetirResuelto como piso, cada casilla se completa en pocos aciertos, aunque repita el mismo ejercicio.
      expect(pasos).toBeLessThanOrEqual(
        acts.length *
          Math.ceil(
            Math.log(1 - REGLAS.completo) /
              Math.log(1 - REGLAS.repetirResuelto),
          ),
      );
    }
  });
});
