import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 07/10, Jeider probó como estudiante: «Seguir practicando» lo dejaba en el mismo ejercicio aunque ya lo hubiera resuelto
// o no le quedaran intentos (una pestaña inútil), el dominio decía +17 % cuando había bajado, y la calibración seguía
// diciendo «acertaste» después de fallar. utils/resultadoEntrega.ts y components/exercise/ResultadoEntrega.vue.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

interface Accion { tipo: string; texto: string; activityId?: number; reto?: boolean }
interface Paso { titulo: string; mensaje: string; primaria: Accion; secundaria: Accion }
const u = cargar<{
  pasoSiguiente: (e: { aprobado: boolean; quedanIntentos: number; actividadActual: number; recomendacion: unknown }) => Paso;
  textoCambioDominio: (a: number | null, d: number | null) => { texto: string; diferencia: number } | null;
  CUANDO_VUELVE: Record<string, string>;
}>('resultadoEntrega');

const rec = (activityId: number, reason: string, allCompleted = false) => ({ activityId, title: 'Prueba de escritorio: el intercambio', reason, reasonMessage: 'Prueba otro ejercicio del mismo tipo y nivel.', allCompleted });

describe('después de entregar: un siguiente paso que sirve', () => {
  it('aprobó y hay otro ejercicio: lo lleva a ese ejercicio, no al mismo', () => {
    const p = u.pasoSiguiente({ aprobado: true, quedanIntentos: 2, actividadActual: 10, recomendacion: rec(11, 'hermana') });
    expect(p.primaria).toEqual({ tipo: 'ejercicio', texto: 'Probar otro ejercicio parecido', activityId: 11, reto: false });
    expect(p.secundaria.tipo).toBe('leccion');
    expect(p.mensaje).toContain('«Prueba de escritorio: el intercambio»');
  });

  it('el siguiente puede ser de nivel más alto o un reto (el reto se abre como reto)', () => {
    expect(u.pasoSiguiente({ aprobado: true, quedanIntentos: 0, actividadActual: 10, recomendacion: rec(12, 'sube_nivel') }).primaria.texto).toBe('Subir de nivel');
    expect(u.pasoSiguiente({ aprobado: true, quedanIntentos: 0, actividadActual: 10, recomendacion: rec(13, 'reto') }).primaria).toMatchObject({ activityId: 13, reto: true });
  });

  it('si el recomendador devuelve el mismo ejercicio o no hay más, no lo manda a una pantalla repetida', () => {
    const mismo = u.pasoSiguiente({ aprobado: true, quedanIntentos: 1, actividadActual: 10, recomendacion: rec(10, 'reintento') });
    expect(mismo.primaria.tipo).toBe('leccion');
    const completa = u.pasoSiguiente({ aprobado: true, quedanIntentos: 1, actividadActual: 10, recomendacion: rec(10, 'completada', true) });
    expect(completa.titulo).toBe('¡Completaste la lección!');
    expect(completa.primaria).toMatchObject({ tipo: 'inicio', texto: 'Ir a mi siguiente paso' });
  });

  it('no aprobó y le quedan intentos: intentar de nuevo, diciendo cuántos quedan', () => {
    const p = u.pasoSiguiente({ aprobado: false, quedanIntentos: 1, actividadActual: 10, recomendacion: rec(11, 'hermana') });
    expect(p.primaria).toEqual({ tipo: 'reintentar', texto: 'Intentar de nuevo' });
    expect(p.mensaje).toContain('Te queda 1 intento');
  });

  it('sin intentos nunca ofrece seguir en el mismo ejercicio: otro parecido o la lección', () => {
    const conOtro = u.pasoSiguiente({ aprobado: false, quedanIntentos: 0, actividadActual: 10, recomendacion: rec(11, 'hermana') });
    expect(conOtro.primaria).toMatchObject({ tipo: 'ejercicio', activityId: 11 });
    const sinOtro = u.pasoSiguiente({ aprobado: false, quedanIntentos: 0, actividadActual: 10, recomendacion: null });
    expect(sinOtro.primaria.tipo).toBe('leccion');
    for (const p of [conOtro, sinOtro]) {
      expect(p.primaria.tipo).not.toBe('reintentar');
      expect(p.secundaria.tipo).not.toBe('reintentar');
      expect(p.mensaje).not.toMatch(/regañ|castig|perdiste/i);
    }
  });
});

describe('al volver a abrir un ejercicio sin intentos', () => {
  const sinIntentos = cargar<{ accionesSinIntentos: (r: unknown, actual: number) => Accion[] }>('resultadoEntrega').accionesSinIntentos;

  it('ofrece otro ejercicio de la lección, o la lección si no hay otro', () => {
    expect(sinIntentos(rec(11, 'hermana'), 10).map((a) => a.tipo)).toEqual(['ejercicio', 'leccion']);
    expect(sinIntentos(rec(10, 'reintento'), 10).map((a) => a.tipo)).toEqual(['leccion', 'inicio']);
    expect(sinIntentos(null, 10).map((a) => a.tipo)).toEqual(['leccion', 'inicio']);
  });

  it('la página lo muestra cuando ya no quedan intentos y no hay un resultado abierto', () => {
    expect(leer('pages', 'estudiante', 'evaluacion', '[activityId].vue')).toContain('<ExerciseSinIntentos v-if="remainingAttempts === 0 && !workspaceStore.submissionResult');
    expect(leer('components', 'exercise', 'SinIntentos.vue')).toContain('Ya usaste los intentos de este ejercicio.');
  });
});

describe('la calibración habla del tipo de ejercicio', () => {
  const c = cargar<{ mensajeCalibracion: (x: { confianza: string; acerto: boolean }, esCodigo?: boolean) => { texto: string } }>('confianza');

  it('en opción múltiple no habla de «casos» ni de «tu programa»', () => {
    const t = c.mensajeCalibracion({ confianza: 'seguro', acerto: false }, false).texto;
    expect(t).not.toMatch(/caso|programa/);
    expect(t).toContain('el error que más enseña');
    expect(c.mensajeCalibracion({ confianza: 'seguro', acerto: false }).texto).toMatch(/qué mostró tu programa/);
  });

  it('la pregunta dice para qué sirve y se adapta al tipo', () => {
    const j = leer('components', 'JuicioConfianza.vue');
    expect(j).toContain("questionType === 'coding' ? 'que pasa todos los casos' : 'tu respuesta'");
    expect(j).toContain('la lección tarda más en volver a tus repasos');
    expect(leer('components', 'exercise', 'ResultadoEntrega.vue')).toContain('mensajeCalibracion(ws.calibracion, esCodigo.value)');
  });
});

describe('el cambio de dominio, dicho como es', () => {
  it('sube, baja o se mantiene, con la diferencia exacta', () => {
    expect(u.textoCambioDominio(0, 20)).toEqual({ texto: 'Tu dominio de esta lección subió de 0 % a 20 %', diferencia: 20 });
    expect(u.textoCambioDominio(20, 17)).toEqual({ texto: 'Tu dominio de esta lección bajó de 20 % a 17 %', diferencia: -3 });
    expect(u.textoCambioDominio(20, 20)?.texto).toBe('Tu dominio de esta lección sigue en 20 %');
    expect(u.textoCambioDominio(null, 20)).toBeNull();
  });

  it('se cuenta desde la entrega anterior: el store pasa el «después» al «antes» al entregar otra vez', () => {
    const ws = leer('stores', 'workspace.ts');
    const entregar = ws.slice(ws.indexOf('isSubmitting.value = true'));
    expect(entregar).toMatch(/if \(masteryAfter\.value !== null\) masteryBefore\.value = masteryAfter\.value\s+masteryAfter\.value = null/);
    expect(entregar.indexOf('masteryBefore.value = masteryAfter.value')).toBeLessThan(entregar.indexOf('/submissions/${subId}/submit'));
  });
});

describe('«Tus últimos ejercicios» dice cuánto movió cada entrega el dominio', () => {
  const corto = cargar<{ cambioCorto: (a?: number | null, d?: number | null) => { corto: string; diferencia: number } | null }>('resultadoEntrega').cambioCorto;

  it('+, − o igual; sin dato (entregas viejas) no inventa nada', () => {
    expect(corto(0, 20)?.corto).toBe('+20 %');
    expect(corto(20, 17)?.corto).toBe('−3 %');
    expect(corto(40, 40)?.corto).toBe('igual');
    expect(corto(null, 40)).toBeNull();
    expect(corto(undefined, undefined)).toBeNull();
  });

  it('la tabla tiene la columna y el servidor la manda', () => {
    expect(leer('pages', 'estudiante', 'progreso.vue')).toContain('<th class="p-2.5 font-semibold">Tu dominio</th>');
    const analytics = readFileSync(path.join(__dirname, '..', '..', 'analytics', 'analytics.service.ts'), 'utf8');
    expect(analytics).toContain('dominioDespues: s.dominioDespues ?? null');
  });
});

describe('la ventana del resultado', () => {
  const v = leer('components', 'exercise', 'ResultadoEntrega.vue');

  it('la calibración solo sale en la entrega en la que el estudiante dijo qué tan seguro estaba', () => {
    expect(v).toContain('ws.calibracion && ej.value.usedAttempts === 1 ? mensajeCalibracion(ws.calibracion, esCodigo.value) : null');
  });

  it('no muestra «0 de 0»: el conteo de preguntas aparece solo si hay alguna', () => {
    expect(v).toContain('v-if="esCodigo && (r.totalCount ?? 0) > 0"');
  });

  it('cuándo vuelve la lección se dice en palabras, una frase distinta por resultado', () => {
    expect(new Set(Object.values(u.CUANDO_VUELVE)).size).toBe(4);
    expect(v).not.toContain('Para tus repasos:');
  });

  it('es un diálogo con nombre y sus botones miden al menos 44 px', () => {
    expect(v).toContain('role="dialog" aria-modal="true" aria-labelledby="resultado-titulo"');
    expect((v.match(/min-h-\[44px\]/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
});
