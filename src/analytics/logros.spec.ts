import { evaluarLogros, siguienteLogro, type EntregaParaLogros, type LeccionParaLogros } from './logros';

// Logros y medallas (logros.ts; BT-29). Días y semanas en hora de Colombia.
const col = (dia: string, hora = '10:00') => new Date(`${dia}T${hora}:00-05:00`);
const entrega = (activityId: number, fecha: Date, extra: Partial<EntregaParaLogros> = {}): EntregaParaLogros => ({
  activityId, learningUnitId: 1, aprobada: true, avanzado: false, intento: 1, fecha, ...extra,
});
const leccion = (id: number, modulo: number, mastery: number, fecha: Date | null = col('2026-09-30')): LeccionParaLogros => ({
  learningUnitId: id, moduloId: modulo, moduloTitulo: `Módulo ${modulo}`, mastery, fecha,
});
const buscar = (logros: ReturnType<typeof evaluarLogros>, clave: string) => logros.find((l) => l.clave === clave)!;

describe('Constancia: «Semana de estudio» = 3 días distintos en una misma semana, sin exigir semanas seguidas', () => {
  it('3 días en la semana del 28/09 dan la medalla de bronce, con la fecha del tercer día', () => {
    const dias = [col('2026-09-28'), col('2026-09-30'), col('2026-09-30', '18:00'), col('2026-10-02')];
    const l = buscar(evaluarLogros([], [], [], dias), 'constancia-bronce');
    expect(l.obtenido).toBe(col('2026-10-02').toISOString());
    expect(l.titulo).toBe('Semana de estudio');
  });
  it('dos días en una semana no alcanzan; el avance lo dice', () => {
    const l = buscar(evaluarLogros([], [], [], [col('2026-09-28'), col('2026-09-29')]), 'constancia-bronce');
    expect(l.obtenido).toBeNull();
    expect(l.progreso).toEqual({ actual: 0, meta: 1 });
  });
  it('4 semanas de estudio, aunque no sean seguidas, dan la de plata', () => {
    const semanas = ['2026-08-03', '2026-08-17', '2026-09-07', '2026-09-28'];
    const dias = semanas.flatMap((lunes) => [0, 1, 2].map((d) => new Date(new Date(`${lunes}T15:00:00Z`).getTime() + d * 86_400_000)));
    const logros = evaluarLogros([], [], [], dias);
    expect(buscar(logros, 'constancia-plata').obtenido).not.toBeNull();
    expect(buscar(logros, 'constancia-oro').progreso).toEqual({ actual: 4, meta: 12 });
  });
});

describe('Práctica: ejercicios DISTINTOS aprobados en un mismo día', () => {
  it('3 ejercicios distintos aprobados el mismo día dan bronce', () => {
    const e = [entrega(1, col('2026-10-01', '08:00')), entrega(2, col('2026-10-01', '09:00')), entrega(3, col('2026-10-01', '20:00'))];
    expect(buscar(evaluarLogros(e, [], [], []), 'practica-bronce').obtenido).toBe(col('2026-10-01', '20:00').toISOString());
  });
  it('repetir el mismo ejercicio o fallar no suma (no se premia la cantidad vacía)', () => {
    const e = [entrega(1, col('2026-10-01')), entrega(1, col('2026-10-01', '11:00')), entrega(2, col('2026-10-01', '12:00'), { aprobada: false })];
    const l = buscar(evaluarLogros(e, [], [], []), 'practica-bronce');
    expect(l.obtenido).toBeNull();
    expect(l.progreso).toEqual({ actual: 1, meta: 3 });
  });
  it('a las 9 p. m. en Colombia sigue siendo el mismo día, aunque en UTC ya sea el siguiente', () => {
    const e = [entrega(1, col('2026-10-01', '08:00')), entrega(2, col('2026-10-01', '12:00')), entrega(3, col('2026-10-01', '21:00'))];
    expect(buscar(evaluarLogros(e, [], [], []), 'practica-bronce').obtenido).not.toBeNull();
  });
});

describe('Dominio, desafío, persistencia y memoria', () => {
  it('lecciones dominadas por niveles y un logro por módulo completo', () => {
    const logros = evaluarLogros([], [leccion(1, 10, 90), leccion(2, 10, 86), leccion(3, 11, 40)], [], []);
    expect(buscar(logros, 'lecciones-bronce').obtenido).not.toBeNull();
    expect(buscar(logros, 'lecciones-plata').progreso).toEqual({ actual: 2, meta: 5 });
    expect(buscar(logros, 'modulo-10')).toMatchObject({ titulo: 'Dominaste «Módulo 10»', progreso: { actual: 2, meta: 2 } });
    expect(buscar(logros, 'modulo-11').obtenido).toBeNull();
  });
  it('«Módulo en una semana»: dominado dentro de los 7 días siguientes a la primera entrega en él', () => {
    const lecciones = [leccion(1, 10, 90, col('2026-09-25')), leccion(2, 10, 88, col('2026-09-27'))];
    const rapido = evaluarLogros([entrega(5, col('2026-09-22'), { learningUnitId: 1 })], lecciones, [], []);
    expect(buscar(rapido, 'modulo-en-una-semana').obtenido).toBe(col('2026-09-27').toISOString());
    const lento = evaluarLogros([entrega(5, col('2026-09-10'), { learningUnitId: 1 })], lecciones, [], []);
    expect(buscar(lento, 'modulo-en-una-semana').obtenido).toBeNull();
  });
  it('ejercicios avanzados distintos; la persistencia cuenta el tercer intento o después', () => {
    const e = [
      entrega(1, col('2026-09-20'), { avanzado: true }),
      entrega(1, col('2026-09-21'), { avanzado: true }), // el mismo: no suma
      entrega(2, col('2026-09-22'), { intento: 3 }),
      entrega(3, col('2026-09-23'), { intento: 2 }),
    ];
    const logros = evaluarLogros(e, [], [], []);
    expect(buscar(logros, 'avanzados-bronce').obtenido).toBe(col('2026-09-20').toISOString());
    expect(buscar(logros, 'avanzados-plata').progreso).toEqual({ actual: 1, meta: 5 });
    expect(buscar(logros, 'persistencia-bronce').obtenido).toBe(col('2026-09-22').toISOString());
  });
  it('10 repasos dan la medalla de memoria de bronce', () => {
    const repasos = Array.from({ length: 10 }, (_, i) => col(`2026-09-${String(10 + i).padStart(2, '0')}`));
    expect(buscar(evaluarLogros([], [], repasos, []), 'repasos-bronce').obtenido).toBe(repasos[9].toISOString());
  });
  it('cada categoría tiene bronce, plata y oro, con claves únicas', () => {
    const logros = evaluarLogros([], [leccion(1, 10, 10)], [], []);
    const claves = logros.map((l) => l.clave);
    expect(new Set(claves).size).toBe(claves.length);
    for (const base of ['constancia', 'practica', 'lecciones', 'avanzados', 'persistencia', 'repasos']) {
      expect(['bronce', 'plata', 'oro'].every((n) => claves.includes(`${base}-${n}`))).toBe(true);
    }
  });
});

describe('siguienteLogro — una sola meta, la más cercana', () => {
  it('elige la de mayor avance proporcional entre las empezadas', () => {
    const e = [entrega(1, col('2026-10-01', '08:00')), entrega(2, col('2026-10-01', '09:00'))]; // 2 de 3 en un día
    const logros = evaluarLogros(e, [leccion(1, 10, 90), leccion(2, 10, 20), leccion(3, 10, 30)], [], []);
    const s = siguienteLogro(logros)!;
    expect(s.clave).toBe('practica-bronce');
    expect(s.progreso).toEqual({ actual: 2, meta: 3 });
  });
  it('sin nada empezado, propone una de bronce', () => {
    expect(siguienteLogro(evaluarLogros([], [], [], []))?.nivel).toBe('bronce');
  });
});
