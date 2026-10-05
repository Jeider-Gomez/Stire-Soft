import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// UX-08 · Encuesta de usabilidad SUS dentro de STIRE (docs/DISENO_ENCUESTA_USABILIDAD.md).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

const sus = cargar<{
  AFIRMACIONES_SUS: string[];
  ESCALA_SUS: Array<{ valor: number }>;
  faltantesSus: (r: Array<number | null>) => number[];
  esPositivaSus: (i: number) => boolean;
  afirmacionesAMejorar: (p: number[]) => number[];
  invitacionPospuesta: (g: string | null, ahora: number) => boolean;
}>('sus');

describe('las afirmaciones y la escala', () => {
  it('son las 10 del SUS, alternando positivas y negativas, con escala de 1 a 5', () => {
    expect(sus.AFIRMACIONES_SUS).toHaveLength(10);
    expect(sus.AFIRMACIONES_SUS[0]).toMatch(/me gustaría usar STIRE con frecuencia/);
    expect(sus.AFIRMACIONES_SUS[1]).toMatch(/innecesariamente complejo/);
    expect(sus.esPositivaSus(0)).toBe(true);
    expect(sus.esPositivaSus(1)).toBe(false);
    expect(sus.ESCALA_SUS.map((e) => e.valor)).toEqual([1, 2, 3, 4, 5]);
  });

  it('dice cuáles faltan, para llevar el foco a la primera', () => {
    expect(sus.faltantesSus([1, null, 3, null, 5, 1, 2, 3, 4, 5])).toEqual([1, 3]);
    expect(sus.faltantesSus([1, 2, 3, 4, 5, 1, 2, 3, 4, 5])).toEqual([]);
  });
});

describe('qué mejorar primero (resultados del admin)', () => {
  it('marca las 2 afirmaciones que más quitan, teniendo en cuenta si son positivas o negativas', () => {
    // la 2 (negativa) en 4,5 quita 3,5; la 3 (positiva) en 2 quita 3; el resto quita poco
    expect(sus.afirmacionesAMejorar([4.5, 4.5, 2, 1.5, 4.5, 1.5, 4.5, 1.5, 4.5, 1.5])).toEqual([1, 2]);
  });

  it('si nada quita más de 1 punto en promedio, no marca nada', () => {
    expect(sus.afirmacionesAMejorar([4.5, 1.5, 4.5, 1.5, 4.5, 1.5, 4.5, 1.5, 4.5, 1.5])).toEqual([]);
  });
});

describe('la invitación no interrumpe', () => {
  it('«Ahora no» la oculta 7 días en este equipo', () => {
    const ahora = 1_800_000_000_000;
    expect(sus.invitacionPospuesta(null, ahora)).toBe(false);
    expect(sus.invitacionPospuesta(String(ahora - 6 * 86_400_000), ahora)).toBe(true);
    expect(sus.invitacionPospuesta(String(ahora - 8 * 86_400_000), ahora)).toBe(false);
    expect(sus.invitacionPospuesta('basura', ahora)).toBe(false);
  });

  it('es una tarjeta en el inicio (no una ventana encima) y solo aparece si el servidor dice invitar', () => {
    const inv = leer('components', 'InvitacionEncuesta.vue');
    expect(inv).toContain('<aside v-if="visible"');
    expect(inv).not.toContain('role="dialog"');
    expect(inv).toContain(".invitar");
    expect(leer('pages', 'estudiante', 'index.vue')).toContain('<InvitacionEncuesta ruta="/estudiante/encuesta" />');
    expect(leer('pages', 'docente', 'index.vue')).toContain('<InvitacionEncuesta ruta="/docente/encuesta" />');
  });
});

describe('el formulario', () => {
  const f = leer('components', 'EncuestaSus.vue');

  it('cada afirmación es un grupo de radios con leyenda y opciones de 44 px', () => {
    expect(f).toContain('<fieldset v-for="(a, i) in AFIRMACIONES_SUS"');
    expect(f).toContain('<legend class="sr-only">Afirmación {{ i + 1 }}');
    expect(f).toContain('type="radio"');
    expect(f).toContain('min-h-[44px] flex items-center justify-center');
  });

  it('si falta alguna, el error va junto a ella y el foco también (PAT-03)', () => {
    expect(f).toContain('Falta esta respuesta.');
    expect(f).toContain('document.getElementById(`sus-${faltan.value[0]}`)?.focus()');
  });

  it('se puede responder desde el perfil y el admin ve los resultados en su menú', () => {
    expect(leer('pages', 'estudiante', 'perfil.vue')).toContain('to="/estudiante/encuesta"');
    expect(leer('pages', 'docente', 'perfil.vue')).toContain('to="/docente/encuesta"');
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('to="/admin/usabilidad"');
  });
});

describe('segunda parte, distinta para estudiantes y docentes (pedido del dueño, 04/10)', () => {
  const u = cargar<{
    TAREAS_POR_ROL: Record<string, Array<{ clave: string }>>;
    preguntaAbierta: (rol?: string) => string;
    tareasRespondidas: (v: Record<string, number | null>) => Record<string, number>;
  }>('sus');
  const f = leer('components', 'EncuestaSus.vue');

  it('las tareas son las mismas claves que valida el servidor', () => {
    const servidor = readFileSync(path.join(__dirname, '..', '..', 'usabilidad', 'sus.ts'), 'utf8');
    for (const rol of ['estudiante', 'docente']) for (const t of u.TAREAS_POR_ROL[rol]) expect(servidor).toContain(`clave: '${t.clave}'`);
  });

  it('cada rol tiene su pregunta abierta y «No lo he hecho» no se envía', () => {
    expect(u.preguntaAbierta('estudiante')).toBe('¿Qué te ayudaría a aprender mejor con STIRE?');
    expect(u.preguntaAbierta('docente')).toBe('¿Qué te quitaría más trabajo en STIRE?');
    expect(u.tareasRespondidas({ a: 5, b: null })).toEqual({ a: 5 });
  });

  it('el SUS va primero e igual para todos; luego la facilidad de 1 a 7, con «No lo he hecho»', () => {
    expect(f.indexOf('1. Tu experiencia en general')).toBeLessThan(f.indexOf('2. Lo que haces en STIRE'));
    expect(f).toContain('<fieldset v-for="t in tareas"');
    expect(f).toContain('No lo he hecho');
    expect(f).toContain('{{ preguntaAbierta(rol) }}');
    // el admin ve la tarea más difícil de cada rol
    expect(leer('pages', 'admin', 'usabilidad.vue')).toContain('v-for="(lista, r) in datos.tareas ?? {}"');
  });
});
