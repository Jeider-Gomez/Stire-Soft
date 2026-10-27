import { readFileSync } from 'fs';
import * as path from 'path';

// Presentación de la clase para los estudiantes (prototipo del panel v2, 27/10): la franja con el color de portada, el
// docente y su bienvenida (la descripción de la clase). En el Inicio del estudiante, en «Mis clases» y, como vista
// previa, en Ajustes del docente.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('la presentación de la clase', () => {
  it('el componente muestra la franja de color, el docente y la bienvenida', () => {
    const c = leer('components', 'PresentacionClase.vue');
    expect(c).toContain(':style="{ backgroundColor: color }"');
    expect(c).toContain('{{ bienvenida }}');
    expect(c).toContain('Con {{ docente }}');
  });
  it('el Inicio del estudiante abre con la presentación de su clase activa, con el color que eligió el docente', () => {
    const p = leer('pages', 'estudiante', 'index.vue');
    expect(p).toContain('<PresentacionClase v-if="claseActual"');
    expect(p).toContain('claseActual.value?.portada ?? colorDeClase(Math.max(i, 0))');
    expect(leer('stores', 'student.ts')).toContain("portada: e.class!.portada ?? null");
  });
  it('«Mis clases» lleva la franja de color en cada tarjeta', () => {
    expect(leer('pages', 'estudiante', 'clases.vue')).toContain("backgroundColor: item.class?.portada ?? colorDeClase(i)");
  });
  it('en Ajustes el docente escribe la bienvenida y ve cómo queda', () => {
    const d = leer('components', 'docente', 'ajustes', 'SeccionDatos.vue');
    expect(d).toContain('Bienvenida para tus estudiantes');
    expect(d).toContain('Así la ven tus estudiantes');
  });
});
