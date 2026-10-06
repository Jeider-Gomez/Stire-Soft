import { readFileSync } from 'fs';
import * as path from 'path';

// Fase 30 B2: Estado de publicación (D1) — EstadoPublicacion.vue en ArbolContenidos.vue.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('Fase 30 B2 · EstadoPublicacion.vue — chip de estado + botón de acción', () => {
  it('el componente existe y usa solo tokens de identidad (sin red-/green-/amber-)', () => {
    const comp = leer('components', 'docente', 'contenidos', 'EstadoPublicacion.vue');
    expect(comp).toBeTruthy();
    expect(comp).not.toMatch(/\b(bg|text|border)-(red|green|amber)-\d+/);
    expect(comp).toContain('semantico-pasa');
    expect(comp).toContain('acento-ambar');
  });

  it('el chip de estado (etiqueta) y el botón de acción son distintos (D1)', () => {
    const comp = leer('components', 'docente', 'contenidos', 'EstadoPublicacion.vue');
    // Chip: «Publicado» / «Borrador»
    expect(comp).toContain("publicado ? 'Publicado' : 'Borrador'");
    // Botón: «Publicar» / «Ocultar» — lo que el docente hace, no el estado
    expect(comp).toContain("publicado ? 'Ocultar' : 'Publicar'");
    // Emite 'accion' para que el padre lo procese
    expect(comp).toContain("(e: 'accion')");
  });

  it('el árbol de contenidos usa EstadoPublicacion y no texto hardcodeado del botón antiguo', () => {
    const arbol = leer('components', 'docente', 'ArbolContenidos.vue');
    expect(arbol).toContain('<DocenteContenidosEstadoPublicacion');
    expect(arbol).not.toContain('Pulsa para publicarlo');
    expect(arbol).not.toMatch(/hover:bg-red-/);
  });

  it('publicarModulo y ocultarModulo están separados en useContenidosCurso (D1)', () => {
    const composable = leer('composables', 'useContenidosCurso.ts');
    expect(composable).toContain('async function publicarModulo(');
    expect(composable).toContain('async function ocultarModulo(');
    // Cada uno llama avisar con tipo 'exito'
    expect(composable).toMatch(/publicarModulo[\s\S]{0,300}avisar\(\s*\{/);
    expect(composable).toMatch(/ocultarModulo[\s\S]{0,300}avisar\(\s*\{/);
  });
});
