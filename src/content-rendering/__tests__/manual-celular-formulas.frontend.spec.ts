import { readFileSync } from 'fs';
import * as path from 'path';

const pagina = readFileSync(path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'pages', 'ayuda.vue'), 'utf8');

describe('Manual en el celular: las fórmulas no ensanchan la página', () => {
  it('las tarjetas con fórmula se encogen al ancho de la pantalla y la fórmula se desplaza dentro de su caja', () => {
    // Sin «grid-cols-1» y «min-w-0», la columna tomaba el ancho de la fórmula (558 px en una pantalla de 375; medido el 16/11).
    expect(pagina).toContain('<dl v-if="s.bloques?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">');
    expect(pagina).toContain('<div v-for="b in s.bloques" :key="b.titulo" class="min-w-0 bg-base-blanco');
    expect(pagina).toContain('<pre class="mt-3 overflow-x-auto');
  });
});
