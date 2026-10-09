import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 09/10, Jeider como estudiante: «no me dice el dominio recomendado para pasar a la siguiente lección, ni cuánto necesito
// para desbloquear el siguiente módulo». El módulo solo se veía en el inicio, en el menú o al chocar con una lección
// cerrada; la meta de la lección (DOMINADO) en ningún lado.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const js = ts.transpileModule(leer('utils', 'bloqueoModulos.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
type Modulo = { id: number; title: string; units: Array<{ id: number }> };
const { estadoDeModulos, metaDelModulo } = mod.exports as {
  estadoDeModulos: (m: unknown, umbral: number) => unknown[];
  metaDelModulo: (m: Modulo[], e: unknown[], unitId: number) => Record<string, unknown> | null;
};

const modulos = (dominios: number[][]) => dominios.map((d, i) => ({
  id: i + 1, title: `Unidad ${i + 1}: Tema`, titulo: `Unidad ${i + 1}: Tema`,
  units: d.map((_, j) => ({ id: (i + 1) * 10 + j })), lecciones: d.map((dominio) => ({ dominio, empezada: false })),
}));

describe('lo que pide el módulo para abrir el siguiente, desde la lección', () => {
  it('dice cuánto pide, cuánto lleva y cuánto falta, en la lección y para el módulo que sigue', () => {
    const m = modulos([[40, 20], [0]]);
    expect(metaDelModulo(m, estadoDeModulos(m, 50), 11)).toEqual({ modulo: 'Unidad 1: Tema', siguiente: 'Unidad 2: Tema', dominio: 30, umbral: 50, falta: 20 });
  });

  it('nada si el docente quitó el bloqueo, si el siguiente ya abrió o si es el último módulo', () => {
    const m = modulos([[40, 20], [0]]);
    expect(metaDelModulo(m, estadoDeModulos(m, 0), 10)).toBeNull();
    const listo = modulos([[60, 50], [0]]);
    expect(metaDelModulo(listo, estadoDeModulos(listo, 50), 10)).toBeNull();
    expect(metaDelModulo(m, estadoDeModulos(m, 50), 20)).toBeNull();
  });

  it('la lección muestra su meta (con una línea en la barra) y lo del módulo; la ventana del resultado, lo del módulo', () => {
    const meta = leer('components', 'estudiante', 'MetaDeLaLeccion.vue');
    expect(meta).toContain('Meta de la lección: {{ DOMINADO }} %');
    expect(meta).toContain('se abre con <strong>{{ meta.umbral }} %</strong> de dominio promedio');
    const leccion = leer('pages', 'estudiante', 'unidad', '[id].vue');
    expect(leccion).toContain('<EstudianteMetaDeLaLeccion :unit-id="unitId" />');
    expect(leccion).toContain(':style="{ left: `${DOMINADO}%` }"');
    expect(leer('components', 'exercise', 'ResultadoEntrega.vue')).toContain('<EstudianteMetaDeLaLeccion v-if="ej.learningUnitId" :unit-id="ej.learningUnitId" solo-modulo');
  });
});
