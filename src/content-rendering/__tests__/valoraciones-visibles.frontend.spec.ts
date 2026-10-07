import { readFileSync } from 'fs';
import * as path from 'path';

// 07/10, Jeider: «cómo ve el docente si le sirvió tal lección al estudiante». Ya existía («¿Les sirvieron las explicaciones?»
// en la página de la clase), pero no aparecía hasta el primer voto: el docente no sabía que existía.
const c = readFileSync(path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'components', 'docente', 'ValoracionesClase.vue'), 'utf8');

describe('valoraciones de las lecciones para el docente', () => {
  it('la sección se ve siempre, con un estado vacío que explica qué se le pregunta al estudiante', () => {
    expect(c).not.toContain('<section v-if="filas.length"');
    expect(c).toContain('<section v-if="cargado"');
    expect(c).toContain('Todavía nadie ha respondido.');
  });

  it('resume cuántas respuestas hay y cuántas lecciones conviene revisar', () => {
    expect(c).toContain('{{ totalVotos }}');
    expect(c).toContain('para revisar');
  });
});
