import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 08/10, Jeider: el inicio mostraba un porcentaje estático y él tenía que calcular cuánto había avanzado. Ahora dice
// cuánto subió hoy (o esta semana, si hoy no practicó) y el curso por estados de las lecciones.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

interface Cambio { fecha: string; learningUnitId: number; titulo: string; antes: number; despues: number }
interface Avance { periodo: 'hoy' | 'semana'; resumen: { puntos: number; entregas: number; lecciones: Array<{ titulo: string; puntos: number }> } }
const u = cargar<{
  avanceReciente: (c: Cambio[], ahora: Date, unidades?: Set<number>) => Avance | null;
  textoAvance: (a: Avance | null) => { titulo: string; detalle: string; tono: string };
  diaColombia: (d: Date) => string;
  lunesDe: (dia: string) => string;
}>('avanceReciente');

// Jueves 08/10/2026, 3 p. m. en Colombia (20:00 UTC).
const ahora = new Date('2026-10-08T20:00:00Z');
const c = (fecha: string, unidad: number, antes: number, despues: number): Cambio => ({ fecha, learningUnitId: unidad, titulo: `Lección ${unidad}`, antes, despues });

describe('cuánto subiste hoy o esta semana', () => {
  it('los días son de Colombia: las 9 p. m. del miércoles (02:00 UTC del jueves) siguen siendo miércoles', () => {
    expect(u.diaColombia(new Date('2026-10-08T02:00:00Z'))).toBe('2026-10-07');
    expect(u.lunesDe('2026-10-08')).toBe('2026-10-05');
    expect(u.lunesDe('2026-10-05')).toBe('2026-10-05');
    expect(u.lunesDe('2026-10-11')).toBe('2026-10-05');
  });

  it('si practicó hoy, muestra hoy, sumado por lección y de la que más subió a la que menos', () => {
    const a = u.avanceReciente([c('2026-10-08T14:00:00Z', 1, 0, 20), c('2026-10-08T15:00:00Z', 1, 20, 25), c('2026-10-08T16:00:00Z', 2, 10, 40), c('2026-10-06T15:00:00Z', 3, 0, 50)], ahora);
    expect(a?.periodo).toBe('hoy');
    expect(a?.resumen).toEqual({ puntos: 55, entregas: 3, lecciones: [{ learningUnitId: 2, titulo: 'Lección 2', puntos: 30 }, { learningUnitId: 1, titulo: 'Lección 1', puntos: 25 }] });
    expect(u.textoAvance(a)).toMatchObject({ titulo: '+55 puntos de dominio hoy', detalle: 'Subiste en 2 lecciones.', tono: 'sube' });
  });

  it('si hoy no practicó, muestra la semana (desde el lunes), nunca un «0 hoy»', () => {
    const a = u.avanceReciente([c('2026-10-06T15:00:00Z', 3, 0, 50), c('2026-10-04T15:00:00Z', 4, 0, 90)], ahora);
    expect(a?.periodo).toBe('semana');
    expect(a?.resumen.puntos).toBe(50); // el domingo 04/10 es de la semana pasada
    expect(u.textoAvance(a).titulo).toBe('+50 puntos de dominio esta semana');
  });

  it('sin entregas esta semana invita a practicar, sin culpa', () => {
    expect(u.avanceReciente([c('2026-10-02T15:00:00Z', 3, 0, 50)], ahora)).toBeNull();
    expect(u.textoAvance(null)).toEqual({ titulo: 'Esta semana aún no practicas', detalle: 'Haz un ejercicio y aquí ves cuánto subes.', tono: 'nada' });
  });

  it('dice la verdad si bajó o se mantuvo', () => {
    expect(u.textoAvance(u.avanceReciente([c('2026-10-08T14:00:00Z', 1, 60, 45)], ahora))).toMatchObject({ titulo: '-15 puntos de dominio hoy', tono: 'baja' });
    const igual = u.textoAvance(u.avanceReciente([c('2026-10-08T14:00:00Z', 1, 90, 90), c('2026-10-08T15:00:00Z', 1, 90, 90)], ahora));
    expect(igual).toMatchObject({ titulo: 'Hoy tu dominio se mantuvo', tono: 'igual' });
    expect(igual.detalle).toContain('2 entregas');
  });

  it('cuenta solo las lecciones de la clase que está viendo', () => {
    const a = u.avanceReciente([c('2026-10-08T14:00:00Z', 1, 0, 20), c('2026-10-08T15:00:00Z', 9, 0, 70)], ahora, new Set([1]));
    expect(a?.resumen.puntos).toBe(20);
  });
});

describe('el inicio y el servidor', () => {
  it('el inicio usa la tarjeta nueva, con barra por estados y número en la leyenda (el color no es la única señal)', () => {
    const v = leer('components', 'estudiante', 'TuAvance.vue');
    expect(v).toContain("avanceReciente(studentStore.analytics.cambiosDominio ?? [], new Date(), unidades.value)");
    expect(v).toContain('{{ t.numero }} {{ t.nombre }}');
    expect(v).toContain('<TrendingUp v-if="texto.tono === \'sube\'"');
  });

  it('el servidor manda los cambios de dominio de los últimos 8 días y el store los guarda', () => {
    const s = readFileSync(path.join(__dirname, '..', '..', 'analytics', 'analytics.service.ts'), 'utf8');
    expect(s).toContain('submittedAt: MoreThanOrEqual(new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000))');
    expect(s).toContain('cambiosDominio: (cambiosRecientes ?? [])');
    expect(leer('stores', 'student.ts')).toContain('cambiosDominio: analyticsData.cambiosDominio || []');
  });
});
