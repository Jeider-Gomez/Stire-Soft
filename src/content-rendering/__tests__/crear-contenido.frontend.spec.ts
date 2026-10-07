import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

// PAT-04 (07/10): CurriculumBuilderModals.vue (429 líneas) tenía tres ventanas casi iguales hechas a mano (crear módulo,
// tema y lección), sin Tab atrapado, con `any` y llamando a la API. Ahora es una sola ventana sobre la base común.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8').replace(/\r\n/g, '\n');
const ventana = leer('components', 'docente', 'contenidos', 'VentanaCrear.vue');

describe('crear módulo, tema o lección: una sola ventana (PAT-04)', () => {
  it('el archivo de las tres ventanas ya no existe y Contenido abre VentanaCrear', () => {
    expect(existsSync(path.join(raiz, 'components', 'docente', 'CurriculumBuilderModals.vue'))).toBe(false);
    const pagina = leer('pages', 'docente', 'contenidos.vue');
    expect(pagina).not.toContain('CurriculumBuilderModals');
    expect(pagina).toContain('<DocenteContenidosVentanaCrear v-else-if="ventana?.tipo === \'crear\'"');
    // El orden de lo nuevo sigue siendo el mayor + 1.
    expect(pagina).toContain("orden: mayorOrden(sections.value) + 1");
  });

  it('usa la base común (foco inicial, Tab atrapado, Escape) y no llama a la API ni usa `any`', () => {
    expect(ventana).toContain('<AdminDialogo');
    expect(ventana).toContain('data-foco-inicial');
    expect(ventana).not.toMatch(/\buseApi\s*\(/);
    expect(ventana).not.toMatch(/:\s*any\b|<any>/);
    for (const f of ['crearModulo', 'crearTema', 'crearLeccion']) expect(leer('composables', 'useContenidosAcciones.ts')).toContain(`function ${f}(`);
  });

  it('conserva los textos de las tres ventanas y la dificultad de la lección', () => {
    for (const t of ['Nuevo módulo curricular', 'Nuevo tema curricular', 'Nueva lección', 'Crear módulo', 'Crear tema', 'Crear lección',
      'Ej. Módulo 1: Fundamentos de programación', 'El módulo se creará como', 'El título del módulo es obligatorio.']) {
      expect(ventana).toContain(t);
    }
    expect(ventana).toMatch(/<option value="basico">Básico<\/option>/);
  });

  it('los campos y botones miden 44 px (antes ~32 px en el celular)', () => {
    expect((ventana.match(/min-h-\[44px\]/g) ?? []).length).toBeGreaterThanOrEqual(5);
  });
});
