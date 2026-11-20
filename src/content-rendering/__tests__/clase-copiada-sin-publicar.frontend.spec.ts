import { readFileSync } from 'fs';
import * as path from 'path';

const raiz = path.join(__dirname, '..', '..', '..');
const composable = readFileSync(path.join(raiz, 'frontend-nuxt', 'composables', 'useClasesDocente.ts'), 'utf8');
const copia = readFileSync(path.join(raiz, 'src', 'reuse', 'reuse.service.ts'), 'utf8');

describe('Crear una clase copiando otra (simulación del 20/11)', () => {
  it('la copia llega sin publicar', () => {
    expect(copia).toContain('isPublished: false');
  });

  it('el aviso de «Clase creada» le dice al docente que publique lo copiado, solo cuando la copia salió bien', () => {
    const despuesDeCopiar = composable.slice(composable.indexOf('/reuse/classes/'), composable.indexOf('} catch', composable.indexOf('/reuse/classes/')));
    expect(despuesDeCopiar).toMatch(/sin publicar/);
    expect(despuesDeCopiar).toMatch(/Contenido/);
  });
});
