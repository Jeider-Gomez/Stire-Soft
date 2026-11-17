import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 17/11 (Jeider): los ejercicios de arrastrar y de ordenar se arrastran con el dedo en el celular.
// composables/useArrastreTactil.ts, DragDropExercise.vue y OrderingExercise.vue.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const fuente = leer('composables', 'useArrastreTactil.ts');

function cargar() {
  const js = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'onBeforeUnmount', js)(mod, mod.exports, () => undefined);
  return mod.exports as {
    esArrastre: (dx: number, dy: number) => boolean;
    desplazamientoEnBorde: (y: number, alto: number) => number;
  };
}

describe('Arrastrar con el dedo', () => {
  const { esArrastre, desplazamientoEnBorde } = cargar();

  it('un toque sin mover sigue siendo un toque; desde 8 px es arrastre', () => {
    expect(esArrastre(0, 0)).toBe(false);
    expect(esArrastre(3, 4)).toBe(false);
    expect(esArrastre(6, 6)).toBe(true);
  });

  it('cerca del borde la página se desplaza sola', () => {
    expect(desplazamientoEnBorde(30, 800)).toBeLessThan(0);
    expect(desplazamientoEnBorde(780, 800)).toBeGreaterThan(0);
    expect(desplazamientoEnBorde(400, 800)).toBe(0);
  });

  it('solo dedo y lápiz: el ratón sigue con el arrastre nativo', () => {
    expect(fuente).toContain("if (e.pointerType === 'mouse' || e.button > 0) return");
  });

  it('clasificar: piezas y zonas conectadas, y el dedo no desplaza la página sobre una pieza', () => {
    const v = leer('components', 'exercise', 'DragDropExercise.vue');
    expect(v.match(/@pointerdown="tactil\.empezar\(\$event, item\.id\)"/g)).toHaveLength(2);
    expect(v).toContain(':data-zona="TRAY"');
    expect(v).toContain(':data-zona="target.id"');
    expect(v).toContain('.arrastre-tactil { touch-action: none;');
  });

  it('ordenar: se arrastra desde la manija y cada fila es una zona', () => {
    const v = leer('components', 'exercise', 'OrderingExercise.vue');
    expect(v).toContain('@pointerdown="tactil.empezar($event, String(index))"');
    expect(v).toContain(':data-zona="String(index)"');
    expect(v).toContain('.manija-ordenar { touch-action: none;');
  });
});
