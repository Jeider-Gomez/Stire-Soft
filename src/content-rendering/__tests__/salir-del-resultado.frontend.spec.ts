import { readFileSync } from 'fs';
import * as path from 'path';

// Sugerencia de un estudiante (17/11): «no me deja salir cuando termino una lección». La ventana del resultado solo se
// cerraba con Escape y, con el Tutor abierto, el botón de la siguiente lección se salía de la ventana.
const v = readFileSync(path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'components', 'exercise', 'ResultadoEntrega.vue'), 'utf8');

describe('Salir de la ventana del resultado', () => {
  it('tiene una X para cerrar, siempre a la vista', () => {
    expect(v).toContain('aria-label="Cerrar y revisar el ejercicio" title="Cerrar" @click="ws.submissionResult = null"');
  });
  it('los botones van uno debajo del otro y el texto largo se parte en líneas', () => {
    expect(v).toContain('<div class="flex flex-col items-stretch gap-2">');
    expect(v).not.toContain('flex-col-reverse sm:flex-row');
    expect(v).toContain('.boton-resultado { white-space: normal;');
    expect(v).toContain('overflow-x-hidden');
  });
});
