import { readFileSync } from 'fs';
import * as path from 'path';

// Hallazgos de José en la prueba S08-E01 (docs/calidad/hallazgos/HALLAZGOS_JOSE_S08.md). Las notificaciones tienen su
// prueba en notificaciones-y-avisos.frontend.spec.ts y notifications.service.spec.ts.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('JOSE-S08-1 · la pantalla del ejercicio tiene demasiado a la vez', () => {
  const p = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');

  it('el enunciado se puede plegar y volver a abrir, y el botón dice lo que controla', () => {
    expect(p).toContain('v-show="!panelPlegado" id="panel-enunciado"');
    expect(p).toMatch(/aria-controls="panel-enunciado"[^>]*@click="plegarPanel\(true\)"/);
    expect(p).toContain('<ExerciseFranjaPanelPlegado v-if="(isCodingActivity || isHtmlCssActivity) && panelPlegado" controla="panel-enunciado"');
    expect(leer('components', 'exercise', 'FranjaPanelPlegado.vue')).toContain('Ver el enunciado');
  });

  it('se recuerda en el navegador, con try/catch (en una ventana privada no falla)', () => {
    const c = leer('composables', 'usePanelPlegable.ts');
    expect(c).toContain("localStorage.getItem(clave) === '1'");
    expect(c.match(/try \{/g)?.length).toBe(2);
  });
});
