import { readFileSync } from 'fs';
import * as path from 'path';

// P-8 (17/11): en el celular el estudiante no lleva ☰ (cuadro E-Cel-Inicio: logo, campana y cuenta). Lo principal va en
// la barra de abajo y lo demás del menú, en el menú de la cuenta.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('P-8 · menú del estudiante en el celular', () => {
  const cab = leer('components', 'layout', 'HeaderNav.vue');
  const barra = leer('components', 'layout', 'BarraInferior.vue');

  it('el ☰ no se muestra al estudiante', () => {
    expect(cab).toMatch(/<button v-if="authStore\.currentRole !== 'estudiante'"\s+@click="\$emit\('toggle-sidebar'\)"/);
  });

  it('todo el menú del estudiante queda a mano: barra de abajo + menú de la cuenta', () => {
    const enBarra = ['/estudiante', '/estudiante/aprender', '/estudiante/repasos', '/estudiante/progreso'];
    for (const r of enBarra) expect(barra).toContain(`to="${r}"`);
    for (const r of ['/estudiante/clase', '/estudiante/asistencia', '/estudiante/proyectos', '/estudiante/clases']) {
      expect(cab).toContain(`to: '${r}'`);
    }
    expect(cab).toMatch(/v-if="authStore\.currentRole === 'estudiante'" aria-label="Más secciones" class="md:hidden/);
  });

  it('«Mis proyectos» sale solo si está disponible y sin pedirlo dos veces', () => {
    expect(cab).toContain("useState('proyectos-disponible'");
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain("useState('proyectos-disponible'");
    expect(cab).not.toContain('/proyectos/estado');
  });
});
