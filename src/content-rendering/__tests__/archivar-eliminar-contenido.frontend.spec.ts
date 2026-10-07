import { readFileSync, statSync } from 'fs';
import * as path from 'path';

// Fase 30 B3: Archivar/eliminar contenido (D2, D3) — VentanaArchivar.vue, VentanaEliminar.vue, ArbolContenidos.vue.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const lines = (s: string) => s.split(/\r?\n/).length;

describe('Fase 30 B3 · VentanaArchivar.vue — única ventana de archivar para módulo/tema/lección', () => {
  it('el componente existe y recibe nivel: modulo | tema | leccion', () => {
    const comp = leer('components', 'docente', 'contenidos', 'VentanaArchivar.vue');
    expect(comp).toContain("nivel: 'modulo' | 'tema' | 'leccion'");
    expect(comp).not.toMatch(/\b(bg|text|border)-(red|green|amber)-\d+/);
  });

  it('al confirmar, VentanaArchivar llama a avisar con tipo exito', () => {
    const comp = leer('components', 'docente', 'contenidos', 'VentanaArchivar.vue');
    expect(comp).toContain("avisar({ tipo: 'exito'");
  });

  it('el foco inicial en VentanaArchivar está en el botón Cancelar (data-foco-inicial)', () => {
    const comp = leer('components', 'docente', 'contenidos', 'VentanaArchivar.vue');
    expect(comp).toContain('data-foco-inicial');
  });
});

describe('Fase 30 B3 · VentanaEliminar.vue — única ventana de eliminar con impacto y confirmación', () => {
  it('muestra impacto antes de permitir eliminar (sePuedeEliminar, D3)', () => {
    const comp = leer('components', 'docente', 'contenidos', 'VentanaEliminar.vue');
    expect(comp).toContain('sePuedeEliminar');
    expect(comp).toContain('Calculando');
  });

  it('ofrece «Archivar en su lugar» cuando no se puede eliminar (D2)', () => {
    const comp = leer('components', 'docente', 'contenidos', 'VentanaEliminar.vue');
    expect(comp).toContain('Archivar en su lugar');
    expect(comp).toMatch(/@archivar|['"]archivar['"]/);
  });

  it('el botón Eliminar usa semantico-falla y está al final (D2, orden fijo)', () => {
    const comp = leer('components', 'docente', 'contenidos', 'VentanaEliminar.vue');
    expect(comp).toContain('semantico-falla');
    // «Eliminar» debe aparecer DESPUÉS de «Cancelar»
    expect(comp.indexOf('Cancelar')).toBeLessThan(comp.lastIndexOf('eliminar'));
  });

  it('foco inicial en Cancelar (data-foco-inicial, accesibilidad)', () => {
    const comp = leer('components', 'docente', 'contenidos', 'VentanaEliminar.vue');
    expect(comp).toContain('data-foco-inicial');
  });

  it('un módulo con contenido se confirma con una casilla, sin cuenta ni escribir el nombre (07/10)', () => {
    const comp = leer('components', 'docente', 'contenidos', 'VentanaEliminar.vue');
    expect(comp).toContain('return puedeConfirmar(entendido.value)');
    expect(comp).toContain('Entiendo que el módulo se borra para siempre');
    expect(comp).not.toContain('nombreEscrito');
    expect(comp).not.toContain('duracionSegundos');
  });
});

describe('Fase 30 B3 · contenidos.vue — dentro del límite PAT-04 y sin api.', () => {
  it('contenidos.vue tiene ≤400 líneas (PAT-04)', () => {
    const pagina = leer('pages', 'docente', 'contenidos.vue');
    expect(lines(pagina)).toBeLessThanOrEqual(400);
  });

  it('contenidos.vue no llama a la API directamente (PAT-01)', () => {
    const pagina = leer('pages', 'docente', 'contenidos.vue');
    expect(pagina).not.toMatch(/\buseApi\s*\(/);
    expect(pagina).not.toMatch(/\bapi\.(get|post|patch|put|del)\s*\(/);
  });

  it('el árbol incluye bloques «Archivados (N)» para módulos, temas y lecciones', () => {
    const arbol = leer('components', 'docente', 'ArbolContenidos.vue');
    expect(arbol).toContain('Módulos archivados');
    expect(arbol).toContain('Temas archivados');
    expect(arbol).toContain('Lecciones archivadas');
    // Cada bloque tiene botón Restaurar
    expect((arbol.match(/Restaurar/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
});
