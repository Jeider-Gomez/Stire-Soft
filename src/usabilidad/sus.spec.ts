import { aceptabilidadSus, debeInvitar, puedeResponder, puntajeSus, resumirSus, type RespuestaSus } from './sus';
import { UsabilidadService } from './usabilidad.service';
import type { User } from '../user/entities/user.entity';

describe('puntajeSus (Brooke, 1996)', () => {
  it('todo «muy de acuerdo» en las positivas y «muy en desacuerdo» en las negativas da 100', () => {
    expect(puntajeSus([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
  });

  it('lo contrario da 0, y todo en el medio da 50', () => {
    expect(puntajeSus([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0);
    expect(puntajeSus([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  });

  it('un caso mixto: (4+3+4+3+4) impares − 5 y (5×5 − (2+1+2+2+1)) pares, × 2,5', () => {
    // impares 5,4,5,4,5 → 4+3+4+3+4 = 18; pares 2,1,2,2,1 → 3+4+3+3+4 = 17; (18 + 17) × 2,5 = 87,5
    expect(puntajeSus([5, 2, 4, 1, 5, 2, 4, 2, 5, 1])).toBe(87.5);
  });

  it('rechaza respuestas incompletas o fuera de 1 a 5', () => {
    expect(() => puntajeSus([5, 1, 5])).toThrow();
    expect(() => puntajeSus([0, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toThrow();
    expect(() => puntajeSus([5, 1, 5, 1, 5, 1, 5, 1, 5, 1.5])).toThrow();
  });
});

describe('aceptabilidadSus (Bangor, Kortum y Miller, 2008)', () => {
  it('menos de 50 no es aceptable; de 50 a 70, marginal; 70 o más, aceptable', () => {
    expect(aceptabilidadSus(49.9)).toBe('no-aceptable');
    expect(aceptabilidadSus(50)).toBe('marginal');
    expect(aceptabilidadSus(69.9)).toBe('marginal');
    expect(aceptabilidadSus(70)).toBe('aceptable');
  });
});

describe('resumirSus: lo que ve el admin, sin nombres', () => {
  const r = (rol: string, puntaje: number, respuestas: number[], comentario: string | null, dia: number): RespuestaSus => ({
    rol, puntaje, respuestas, comentario, fecha: new Date(2026, 9, dia),
  });
  const res = resumirSus([
    r('estudiante', 80, [5, 1, 4, 2, 4, 2, 4, 2, 4, 2], 'Más ejemplos', 4),
    r('estudiante', 60, [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], '  ', 5),
    r('docente', 90, [5, 1, 5, 1, 5, 1, 5, 1, 4, 2], 'El editor', 6),
  ]);

  it('promedio general, por rol y por afirmación', () => {
    expect(res.n).toBe(3);
    expect(res.promedio).toBe(76.7);
    expect(res.aceptabilidad).toBe('aceptable');
    expect(res.porRol).toEqual({ estudiante: { n: 2, promedio: 70 }, docente: { n: 1, promedio: 90 } });
    expect(res.porPregunta[0]).toBe(4.3);
    expect(res.porPregunta).toHaveLength(10);
  });

  it('los comentarios vacíos no cuentan y van del más reciente al más viejo, solo con el rol', () => {
    expect(res.comentarios.map((c) => c.texto)).toEqual(['El editor', 'Más ejemplos']);
    expect(Object.keys(res.comentarios[0]).sort()).toEqual(['fecha', 'rol', 'texto']);
  });

  it('sin respuestas no inventa un promedio', () => {
    expect(resumirSus([])).toMatchObject({ n: 0, promedio: null, aceptabilidad: null });
  });
});

describe('cuándo responder y cuándo invitar', () => {
  const ahora = new Date(2026, 9, 20);
  const haceDias = (d: number) => new Date(ahora.getTime() - d * 86_400_000);

  it('se puede volver a responder a los 90 días', () => {
    expect(puedeResponder(null, ahora)).toBe(true);
    expect(puedeResponder(haceDias(89), ahora)).toBe(false);
    expect(puedeResponder(haceDias(90), ahora)).toBe(true);
  });

  it('no se invita a quien acaba de llegar (menos de 3 días) ni a quien ya respondió', () => {
    expect(debeInvitar(haceDias(1), null, ahora)).toBe(false);
    expect(debeInvitar(haceDias(3), null, ahora)).toBe(true);
    expect(debeInvitar(haceDias(30), haceDias(10), ahora)).toBe(false);
  });
});

describe('UsabilidadService', () => {
  type Repo = ConstructorParameters<typeof UsabilidadService>[0];
  const guardadas: Array<Record<string, unknown>> = [];
  let ultima: { createdAt: Date; puntaje: number } | null = null;
  const repo = {
    findOne: jest.fn(() => Promise.resolve(ultima)),
    create: jest.fn((x: Record<string, unknown>) => x),
    save: jest.fn((x: Record<string, unknown>) => { guardadas.push(x); return Promise.resolve(x); }),
    find: jest.fn(() => Promise.resolve([
      { userId: 1, rol: 'estudiante', respuestas: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], puntaje: 50, comentario: null, createdAt: new Date(2026, 9, 10) },
      { userId: 1, rol: 'estudiante', respuestas: [5, 1, 5, 1, 5, 1, 5, 1, 5, 1], puntaje: 100, comentario: null, createdAt: new Date(2026, 6, 1) },
    ])),
  };
  const service = new UsabilidadService(repo as unknown as Repo);
  const user = { id: 1, role: 'estudiante', createdAt: new Date(2026, 8, 1) } as User;

  it('guarda el puntaje calculado en el servidor (no el que mande la pantalla) y el comentario sin espacios', async () => {
    ultima = null;
    const r = await service.responder(user, { respuestas: [5, 1, 5, 1, 5, 1, 5, 1, 5, 1], comentario: '  Me gusta  ' }, new Date(2026, 9, 20));
    expect(r.puntaje).toBe(100);
    expect(guardadas[0]).toMatchObject({ userId: 1, rol: 'estudiante', puntaje: 100, comentario: 'Me gusta' });
  });

  it('no deja responder dos veces en 90 días', async () => {
    ultima = { createdAt: new Date(2026, 9, 1), puntaje: 80 };
    await expect(service.responder(user, { respuestas: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3] }, new Date(2026, 9, 20))).rejects.toThrow('Ya respondiste');
  });

  it('en los resultados cuenta solo la última respuesta de cada persona', async () => {
    const r = await service.resultados();
    expect(r.n).toBe(1);
    expect(r.promedio).toBe(50);
  });
});
