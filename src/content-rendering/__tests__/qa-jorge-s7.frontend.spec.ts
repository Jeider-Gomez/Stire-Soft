import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Hallazgos QA-06 y QA-07 del reporte de Jorge (docs/calidad/reportes-qa/REPORTE_QA_S7_2026-10-02.md), tarea S08-J02.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

type Estado = 'idle' | 'saving' | 'saved' | 'retrying' | 'error' | 'sin-intentos';
const ag = (() => {
  const js = ts.transpileModule(leer('utils', 'autoguardado.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as {
    puedeAutoguardar: (o: { hayIntentoAbierto: boolean; usados: number; permitidos: number }) => boolean;
    esperaReintento: (intento: number, status: number | undefined) => number | null;
    textoAutoguardado: (estado: Estado, hora: string) => string;
  };
})();

describe('QA-07: el autoguardado no avisa en rojo sin motivo y reintenta solo', () => {
  it('con los intentos ya usados y sin intento abierto no se guarda (antes cada tecla pedía un intento y el servidor lo negaba)', () => {
    expect(ag.puedeAutoguardar({ hayIntentoAbierto: false, usados: 3, permitidos: 3 })).toBe(false);
    expect(ag.puedeAutoguardar({ hayIntentoAbierto: false, usados: 2, permitidos: 3 })).toBe(true);
    expect(ag.puedeAutoguardar({ hayIntentoAbierto: true, usados: 3, permitidos: 3 })).toBe(true);
    expect(ag.puedeAutoguardar({ hayIntentoAbierto: false, usados: 9, permitidos: 0 })).toBe(true); // 0 = sin límite
  });

  it('un fallo de red, 5xx, 408 o 429 se reintenta a los 2, 5 y 10 s; luego se rinde', () => {
    expect([0, 1, 2, 3].map((i) => ag.esperaReintento(i, undefined))).toEqual([2000, 5000, 10000, null]);
    expect(ag.esperaReintento(0, 502)).toBe(2000);
    expect(ag.esperaReintento(0, 429)).toBe(2000);
    expect(ag.esperaReintento(0, 408)).toBe(2000);
  });

  it('un 4xx que no cambia al repetir (intento cerrado, sin permiso) no se reintenta', () => {
    expect(ag.esperaReintento(0, 400)).toBeNull();
    expect(ag.esperaReintento(0, 403)).toBeNull();
  });

  it('los textos dicen qué pasa en palabras de estudiante', () => {
    expect(ag.textoAutoguardado('idle', '')).toBe('Se guarda solo mientras escribes');
    expect(ag.textoAutoguardado('saved', '10:32')).toBe('Guardado a las 10:32 ✔');
    expect(ag.textoAutoguardado('retrying', '')).toMatch(/reintentando/);
    expect(ag.textoAutoguardado('sin-intentos', '')).toMatch(/Ya usaste tus intentos/);
  });

  it('el store usa estas reglas y cancela el guardado pendiente al entregar y al cambiar de ejercicio', () => {
    const store = leer('stores', 'workspace.ts');
    expect(store).toMatch(/from '~\/utils\/autoguardado'/);
    expect(store).toMatch(/puedeAutoguardar\(\{ hayIntentoAbierto: !!currentSubmissionId\.value/);
    expect(store).toMatch(/esperaReintento\(intento,/);
    const entregar = store.slice(store.indexOf('async function submitSolution'));
    expect(entregar.indexOf('cancelarAutoguardado()')).toBeGreaterThan(-1);
    expect(entregar.indexOf('cancelarAutoguardado()')).toBeLessThan(entregar.indexOf("api.post<SubmissionResult>"));
    const cargar = store.slice(store.indexOf('async function loadActivity'), store.indexOf('async function submitSolution'));
    expect(cargar).toContain('cancelarAutoguardado()');
    // Un guardado en camino de un ejercicio o intento anterior no pisa el estado actual
    expect(store).toMatch(/if \(generacion !== autosaveGeneracion\) return/);
  });
});

describe('QA-06: el nivel de ayuda del Tutor se lee como indicador, no como botones', () => {
  const drawer = leer('components', 'tutor', 'TutorChatDrawer.vue');
  const inicio = drawer.indexOf('<!-- Indicador de Nivel de Guía');
  const bloque = drawer.slice(inicio, drawer.indexOf('<!-- En un refuerzo', inicio));

  it('es una sola línea de texto con tres puntos de progreso, sin etiquetas con borde', () => {
    expect(bloque).toContain('Nivel de ayuda:');
    expect(bloque).toMatch(/v-for="n in 3"/);
    expect(bloque).not.toMatch(/\bborder border-/);
    expect(bloque).not.toMatch(/<button/);
  });

  it('dice cuándo sube el nivel, para que nadie intente tocarlo', () => {
    expect(bloque).toContain('sube si sigues fallando el ejercicio');
    expect(drawer).toMatch(/1: 'pista',\s*2: 'pregunta guía',\s*3: 'dónde está el error'/);
  });
});
