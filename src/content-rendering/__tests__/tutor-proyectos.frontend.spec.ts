import { readFileSync } from 'fs';
import * as path from 'path';

// El Tutor dentro de un proyecto propio, en modo guía (docs/DISENO_PROYECTOS.md, fase 3).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');

describe('Tutor en Proyectos', () => {
  it('la página del proyecto le pasa al Tutor el proyecto abierto y lo quita al salir', () => {
    const pagina = leer('pages', 'estudiante', 'proyectos', '[id].vue');
    expect(pagina).toContain('tutorStore.setProyectoAbierto(p ? { titulo: p.titulo, tipo: p.tipo, archivos: p.archivos } : null)');
    expect(pagina).toContain('onBeforeUnmount(() => tutorStore.setProyectoAbierto(null))');
  });

  it('en un proyecto el chat manda el título, el tipo y todos los archivos con su nombre, no los datos de un ejercicio', () => {
    const store = leer('stores', 'tutor.ts');
    expect(store).toContain("context: proyectoAbierto.value && route.path.startsWith('/estudiante/proyectos/')");
    expect(store).toContain('proyectoTitulo: proyectoAbierto.value.titulo');
    expect(store).toContain('currentCode: proyectoAbierto.value.archivos.map((a) => `/* ${a.nombre} */\\n${a.contenido}`)');
  });
});
