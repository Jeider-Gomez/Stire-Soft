import { readFileSync } from 'fs';
import * as path from 'path';

// Pantalla del mapa de calor (paso 6). Jest no compila frontend-nuxt/, así que se leen los archivos reales.
// Medido en Chrome a 375 px el 30/09: la página se desplazaba 567 px a los lados.
const FRONT = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const mapa = readFileSync(path.join(FRONT, 'components', 'docente', 'MapaDeCalor.vue'), 'utf8');
const rendimiento = readFileSync(path.join(FRONT, 'pages', 'docente', 'rendimiento.vue'), 'utf8');

describe('Mapa de calor: la página no se desplaza a los lados en un teléfono', () => {
  it('el contenedor con desplazamiento de la tabla es relative (los textos sr-only, absolutos, no escapan de él)', () => {
    expect(mapa).toMatch(/<div class="relative overflow-x-auto">\s*<table/);
    expect(mapa).toMatch(/class="sr-only"/);
  });

  it('Rendimiento ya no tiene su propio selector de clase: la clase se elige en la barra lateral', () => {
    // El selector se salía del ancho del teléfono; al quitarlo no hay nada que se desborde.
    expect(rendimiento).not.toContain('rendimiento-class-selector');
  });

  it('Rendimiento muestra el mapa de la clase elegida', () => {
    expect(rendimiento).toMatch(/<DocenteMapaDeCalor :class-id="selectedClassId" \/>/);
  });
});
