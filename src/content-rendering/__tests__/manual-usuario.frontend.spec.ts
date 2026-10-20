import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { calculateNextReview, type CalidadRepaso } from '../../common/utils/spaced-repetition';

// Manual de usuario (S10-P07, 18/10): se ve en /ayuda sin iniciar sesión y se descarga en PDF, con la identidad de
// STIRE. Cada tarea con la misma plantilla (como las guías de Canvas o de Google Classroom).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(): T {
  const js = ts.transpileModule(leer('utils', 'manual.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Tarea = {
  id: string; titulo: string; paraQue: string; pasos: string[]; captura?: { src: string; alt: string }; resultado: string;
  consejo?: string; siAlgoSaleMal?: Array<{ problema: string; solucion: string }>;
};
type Seccion = {
  id: string; rol: string; titulo: string; intro: string; tareas: Tarea[];
  bloques?: Array<{ titulo: string; texto: string }>; preguntas?: Array<{ pregunta: string; respuesta: string }>; conCalendario?: boolean;
};
const m = cargar<{
  MANUAL: Seccion[];
  PDF_MANUAL: string;
  CALENDARIO_REPASOS: Array<{ resultado: string; dias: number[] }>;
  trozosConBotones: (t: string) => Array<{ tipo: string; valor: string }>;
  filtrarManual: (manual: Seccion[], texto: string, rol: string) => Seccion[];
}>();

/** Todo el código del cliente (pantallas, componentes y utils), para buscar los textos de los botones. */
function archivos(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? archivos(p, ext) : ext.test(n) ? [readFileSync(p, 'utf8')] : [];
  });
}

describe('manual de usuario', () => {
  it('lo que va entre «» se dibuja como el botón de la pantalla', () => {
    expect(m.trozosConBotones('Toca «Unirse» y luego «Crear clase».')).toEqual([
      { tipo: 'texto', valor: 'Toca ' },
      { tipo: 'boton', valor: 'Unirse' },
      { tipo: 'texto', valor: ' y luego ' },
      { tipo: 'boton', valor: 'Crear clase' },
      { tipo: 'texto', valor: '.' },
    ]);
  });

  it('cada tarea sigue la plantilla: pregunta, para qué, pasos, resultado; ids únicos y capturas que existen con su texto alternativo', () => {
    const ids = new Set<string>();
    for (const s of m.MANUAL) {
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      for (const t of s.tareas) {
        expect(ids.has(t.id)).toBe(false);
        ids.add(t.id);
        expect(t.titulo).toMatch(/^¿.+\?$/);
        expect(t.paraQue.length).toBeGreaterThan(10);
        expect(t.pasos.length).toBeGreaterThan(0);
        expect(t.resultado.length).toBeGreaterThan(5);
        if (t.captura) {
          expect(existsSync(path.join(raiz, 'public', t.captura.src))).toBe(true);
          expect(t.captura.alt.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('cada botón o campo que nombra entre «» existe con ese texto en la aplicación', () => {
    // Fuera de STIRE: el menú de Moodle. «?» es el ícono de ayuda de la cabecera (sin texto).
    const deFuera = new Set(['Importar calificaciones', '?']);
    const cliente = [
      ...archivos(path.join(raiz, 'pages'), /\.vue$/),
      ...archivos(path.join(raiz, 'components'), /\.vue$/),
      ...archivos(path.join(raiz, 'layouts'), /\.vue$/),
      ...archivos(path.join(raiz, 'utils'), /\.ts$/).filter((t) => !t.includes('export const MANUAL')),
    ].join('\n');
    const faltan: string[] = [];
    for (const s of m.MANUAL) {
      for (const t of s.tareas) {
        const textos = [...t.pasos, t.resultado, t.consejo ?? '', ...(t.siAlgoSaleMal ?? []).flatMap((p) => [p.problema, p.solucion])];
        for (const texto of textos) {
          for (const trozo of m.trozosConBotones(texto)) {
            if (trozo.tipo === 'boton' && !deFuera.has(trozo.valor) && !cliente.includes(trozo.valor)) faltan.push(`${t.id}: ${trozo.valor}`);
          }
        }
      }
    }
    expect(faltan).toEqual([]);
  });

  it('cubre las tareas principales de cada rol, la repetición espaciada, las preguntas frecuentes y el glosario', () => {
    const ids = m.MANUAL.flatMap((s) => [s.id, ...s.tareas.map((t) => t.id)]);
    for (const id of [
      'resolver-un-ejercicio', 'pedir-ayuda-al-tutor', 'hacer-mis-repasos', 'ver-mi-progreso', 'marcar-asistencia',
      'armar-los-contenidos', 'saber-a-quien-ayudar', 'tomar-asistencia', 'llevar-las-notas',
      'aprobar-un-docente', 'atender-sugerencias', 'leer-la-encuesta',
      'repeticion-espaciada', 'preguntas-frecuentes', 'glosario',
    ]) expect(ids).toContain(id);
    expect(m.MANUAL.find((s) => s.id === 'repeticion-espaciada')?.conCalendario).toBe(true);
  });

  it('el calendario de repasos es el que calcula el motor (SM-2 con 3 días en el segundo repaso y tope de 60)', () => {
    const calidad: Record<string, CalidadRepaso> = { 'Fácil': 5, Bien: 4, 'Difícil': 3, 'Otra vez': 1 };
    for (const fila of m.CALENDARIO_REPASOS) {
      let estado = { repetitions: 0, intervalDays: 0, easeFactor: 2.5 };
      const dias = fila.dias.map(() => {
        const r = calculateNextReview(estado, calidad[fila.resultado]);
        estado = { repetitions: r.repetitions, intervalDays: r.intervalDays, easeFactor: r.easeFactor };
        return r.intervalDays;
      });
      expect(dias).toEqual(fila.dias);
    }
    // Y lo que dice el texto: 1, 3, 8… y nunca más de 60 días.
    expect(m.CALENDARIO_REPASOS.find((f) => f.resultado === 'Bien')?.dias.slice(0, 3)).toEqual([1, 3, 8]);
    expect(Math.max(...m.CALENDARIO_REPASOS.flatMap((f) => f.dias))).toBe(60);
  });

  it('el buscador encuentra sin importar tildes, y el filtro de rol deja lo suyo y lo de todos', () => {
    const conRepaso = m.filtrarManual(m.MANUAL, 'repasar ahora', 'todos');
    expect(conRepaso.flatMap((s) => s.tareas.map((t) => t.id))).toEqual(['hacer-mis-repasos']);
    expect(m.filtrarManual(m.MANUAL, 'leccion', 'todos').length).toBeGreaterThan(0);
    const docente = m.filtrarManual(m.MANUAL, '', 'docente');
    expect(docente.every((s) => s.rol === 'docente' || s.rol === 'todos')).toBe(true);
    expect(docente.some((s) => s.rol === 'docente')).toBe(true);
    expect(m.filtrarManual(m.MANUAL, 'zzzz', 'todos')).toEqual([]);
  });

  it('/ayuda se abre sin cuenta, tiene descarga en PDF y estilo de impresión, y se llega desde el pie de página', () => {
    expect(leer('middleware', 'auth.global.ts')).toContain("if (to.path === '/ayuda') return");
    const pagina = leer('pages', 'ayuda.vue');
    expect(pagina).toContain(':href="PDF_MANUAL" download');
    expect(pagina).toContain('@media print');
    expect(pagina).toContain('role="search"');
    expect(pagina).toContain('<ManualCalendarioRepasos v-if="s.conCalendario" />');
    expect(m.PDF_MANUAL).toBe('/manual/STIRE-Manual-de-usuario.pdf');
    expect(leer('components', 'layout', 'FooterBar.vue')).toContain('to="/ayuda"');
    expect(leer('layouts', 'auth.vue')).toContain('to="/ayuda"');
  });
});
