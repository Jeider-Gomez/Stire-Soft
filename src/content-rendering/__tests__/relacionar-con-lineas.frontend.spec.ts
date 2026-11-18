import { readFileSync } from 'fs';
import * as path from 'path';

// 17/11 (Jeider: «que ya estén y solo unas los lazos»): relacionar uniendo con líneas. components/exercise/MatchingExercise.vue.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const v = readFileSync(path.join(raiz, 'components', 'exercise', 'MatchingExercise.vue'), 'utf8');

describe('Relacionar con líneas', () => {
  it('las dos columnas están a la vista, cada pieza con su lado y su id', () => {
    expect(v).toContain('v-for="l in leftColumn"');
    expect(v).toContain('v-for="r in rightColumn"');
    expect(v).toContain('data-lado="izq" :data-id="l.id"');
    expect(v).toContain('data-lado="der" :data-id="r.id"');
  });

  it('se une arrastrando de una pieza a la otra (ratón y dedo) o tocando una y luego la otra', () => {
    expect(v).toContain(`@pointerdown="empezarTrazo($event, 'izq', l.id)" @click="tocar('izq', l.id)"`);
    expect(v).toContain(`@pointerdown="empezarTrazo($event, 'der', r.id)" @click="tocar('der', r.id)"`);
    expect(v).toContain('if (destino && destino.lado !== origen.lado) {');
    expect(v).toContain('touch-action: none;');
  });

  it('una pareja solo puede estar unida con un elemento: al unirla con otro, el anterior queda libre', () => {
    expect(v).toMatch(/function unir\(izquierda: string, derecha: string\) \{\s+const antes = izquierdaDe\(derecha\)\s+if \(antes\) pairs\[antes\] = ''/);
  });

  it('la respuesta que se entrega no cambia: { pairs: { izquierda: derecha } }', () => {
    expect(v).toContain('workspaceStore.pendingAnswer = { pairs: cleanPairs }');
  });

  it('las líneas se vuelven a medir al cambiar las parejas o el tamaño', () => {
    expect(v).toContain('observador = new ResizeObserver(() => { medida.value++ })');
    expect(v).toContain("watch(pairs, () => nextTick(() => { medida.value++ }), { deep: true })");
  });
});
