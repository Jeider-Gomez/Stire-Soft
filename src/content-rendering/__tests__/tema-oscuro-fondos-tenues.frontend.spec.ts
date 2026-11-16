import { readFileSync } from 'fs';
import * as path from 'path';

const css = readFileSync(path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'assets', 'css', 'temas.css'), 'utf8');

describe('Tema oscuro: texto de acento sobre fondos tenues', () => {
  const regla =
    css.split('\n').find((l) => l.includes('.text-acento-ambar-fuerte, .text-acento-ambar) { color: rgb(var(--c-base-blanco)); }')) ?? '';

  it('el texto solo se oscurece sobre el fondo lleno de acento, no sobre uno tenue («/15»)', () => {
    expect(regla).toContain('[class~="bg-acento-ambar-fuerte"]');
    expect(regla).toContain('[class~="bg-acento-ambar"]');
    expect(regla).not.toContain('[class*="bg-acento-"]');
  });

  it('un fondo que solo aparece al pasar el cursor oscurece el texto solo en ese momento', () => {
    expect(regla).toContain(String.raw`.hover\:bg-acento-ambar:hover`);
    expect(regla).toContain(String.raw`.hover\:bg-acento-ambar-fuerte:hover`);
  });
});

describe('Tema oscuro: texto sobre el azul fijo de STIRE', () => {
  // «bg-stire-blue» no cambia con el tema; «text-base-blanco» sí (en oscuro es tinta): quedaba 1,7:1 (medido el 16/11).
  it('las pastillas seleccionadas sobre azul fijo llevan texto blanco fijo', () => {
    const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
    for (const archivo of ['pages/ayuda.vue', 'components/docente/contenidos/EditorUnidad.vue', 'components/docente/contenidos/VistaEstudiante.vue']) {
      const texto = readFileSync(path.join(raiz, archivo), 'utf8');
      expect(texto).toMatch(/bg-stire-blue[^'"]*text-white/);
      expect(texto).not.toMatch(/bg-stire-blue[^'"]*text-base-blanco/);
    }
  });
});
