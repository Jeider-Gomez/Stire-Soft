import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Lo que confundió a José como estudiante en las dos semanas de la prueba (S09-JO01, 14/10).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

const p = cargar<{
  estadoDePractica: (d: number, r: string | null) => { dominio: string; boton: string };
  textoRepaso: (d: number) => string;
}>('progresoLeccion');
const a = cargar<{ claseActualPrimero: <T extends { classId: number }>(c: T[], actual: number | null) => T[] }>('asistencia');

describe('una lección dominada se ve terminada', () => {
  it('con 85 % o más dice «Dominada ✓» y practicar más es opcional', () => {
    expect(p.estadoDePractica(98, 'reto')).toEqual({ dominio: '98 % de dominio · Dominada ✓', boton: 'Practicar más (opcional)' });
    expect(p.estadoDePractica(40, 'siguiente')).toEqual({ dominio: '40 % de dominio', boton: 'Seguir practicando' });
  });

  it('el repaso de una lección dominada es corto y para no olvidarla', () => {
    expect(p.estadoDePractica(100, 'repaso').boton).toBe('Hacer un repaso corto');
    expect(p.textoRepaso(100)).toBe('Dominada · toca un repaso corto');
    expect(p.textoRepaso(70)).toBe('Toca repasarla');
  });

  it('el inicio y «Mi progreso» usan esos textos', () => {
    expect(leer('pages', 'estudiante', 'index.vue')).toContain('estadoDePractica(studentStore.activeUnit.masteryPercentage, recommendedReason).boton');
    expect(leer('pages', 'estudiante', 'progreso.vue')).toContain('{{ textoRepaso(item.mastery) }}');
  });
});

describe('asistencia: la clase actual primero', () => {
  it('la clase en la que trabaja va arriba y las demás quedan en su orden', () => {
    const c = [{ classId: 1 }, { classId: 2 }, { classId: 3 }];
    expect(a.claseActualPrimero(c, 3).map((x) => x.classId)).toEqual([3, 1, 2]);
    expect(a.claseActualPrimero(c, 9).map((x) => x.classId)).toEqual([1, 2, 3]);
    expect(leer('pages', 'estudiante', 'asistencia.vue')).toContain('Clase actual');
  });
});

describe('el lanzador del Tutor no tapa los botones', () => {
  it('en pantallas de menos de 380 px va siempre como ícono, y lo enfocado no queda debajo (WCAG 2.4.11)', () => {
    expect(leer('components', 'tutor', 'LanzadorTutor.vue')).toMatch(/estrecho = window\.innerWidth < 380/);
    expect(leer('layouts', 'student.vue')).toContain("useHead({ htmlAttrs: { class: 'scroll-pb-24' } })");
  });
});

describe('Repasos: una lección dominada no sale como «Atrasado» (Jeider, 17/10)', () => {
  const r = cargar<{ presentarRepaso: (u: string, l: string, d: number | undefined) => { dominada: boolean; etiqueta: string; nota: string | null } }>('repasos');

  it('con 85 % o más dice «Dominada ✓» y que el repaso es para no olvidarla', () => {
    expect(r.presentarRepaso('critico', 'Atrasado', 100)).toMatchObject({ dominada: true, etiqueta: 'Dominada ✓ · 100 %', nota: 'Repaso corto para no olvidarla' });
  });

  it('sin dominar conserva la urgencia y dice el dominio', () => {
    expect(r.presentarRepaso('critico', 'Atrasado', 40)).toMatchObject({ dominada: false, etiqueta: 'Atrasado', nota: '40 % de dominio' });
    expect(r.presentarRepaso('vencido', 'Toca hoy', undefined)).toMatchObject({ etiqueta: 'Toca hoy', nota: null });
  });

  it('la página lo usa y explica que esperar no baja el dominio', () => {
    const p = leer('pages', 'estudiante', 'repasos.vue');
    expect(p).toContain('presentarRepaso(r.urgency, r.urgencyLabel, dominioPorLeccion.value.get(r.learningUnitId))');
    expect(p).toContain('dejar pasar el repaso no te baja el dominio');
  });
});
