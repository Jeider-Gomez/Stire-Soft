import { readFileSync } from 'fs';
import * as path from 'path';

// Auditoría de la Fase 30 (Claude Code, 06/10) sobre lo que entregó Antigravity.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
// Sin depender del salto de línea: en Windows, Git puede dejar los archivos con CRLF.
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8').replace(/\r\n/g, '\n');
const VENTANAS = [
  ['components', 'docente', 'contenidos', 'VentanaEliminar.vue'],
  ['components', 'docente', 'contenidos', 'VentanaArchivar.vue'],
  ['components', 'docente', 'VentanaEliminarClase.vue'],
];

describe('Fase 30 — auditoría', () => {
  it('las ventanas no llaman a la API: usan useContenidosAcciones (PAT-01)', () => {
    for (const v of VENTANAS) {
      const c = leer(...v);
      expect(c).not.toContain('useApi()');
      expect(c).not.toMatch(/api\.(get|post|patch|put|del)\(/);
      expect(c).toContain('useContenidosAcciones()');
    }
    expect(leer('composables', 'useContenidosAcciones.ts')).toContain('function impactoClase(classId: number)');
  });

  it('si no se puede calcular el impacto, la ventana NO ofrece eliminar a ciegas: lo dice y ofrece reintentar', () => {
    for (const v of [VENTANAS[0], VENTANAS[2]]) {
      const c = leer(...v);
      // Antes: `catch { impacto.value = { sePuedeEliminar: true } }` (y en la clase, además, arrancaba la cuenta de 4 s).
      expect(c).not.toMatch(/catch[^}]*sePuedeEliminar:\s*true/);
      expect(c).toContain('v-else-if="errorImpacto"');
      expect(c).toContain('Reintentar');
      expect(c).toContain('No pude calcular qué se pierde');
    }
  });

  it('eliminar clase: «Cancelar» y el campo del nombre están visibles también durante la cuenta regresiva', () => {
    const c = leer('components', 'docente', 'VentanaEliminarClase.vue');
    const cuenta = c.indexOf('<div v-if="segundosRestantes > 0" class="flex items-center gap-3">');
    // El campo y «Cancelar» van en un bloque hermano SIN condición, después de la barra: existen mientras corre la cuenta.
    const confirmar = c.indexOf('      <div class="space-y-2">\n        <label', cuenta);
    expect(cuenta).toBeGreaterThan(-1);
    expect(confirmar).toBeGreaterThan(cuenta);
    expect(c.indexOf('v-model="nombreEscrito"')).toBeGreaterThan(confirmar);
    expect(c.indexOf("@click=\"$emit('cerrar')\">Cancelar</button>", confirmar)).toBeGreaterThan(confirmar);
    expect(c).not.toContain('<div v-else class="space-y-2">');
    expect(c).toContain('`Lee antes de continuar (${segundosRestantes})`');
    expect(c).toContain('Sí, eliminar la clase');
    // Lector de pantalla: se anuncia al empezar y al terminar, no cada segundo.
    expect((c.match(/aria-live="polite"/g) ?? []).length).toBe(1);
  });

  it('avisos: el verde de éxito es el que el tema oscuro sabe cambiar (no `dark:`, que no está configurado)', () => {
    const c = leer('components', 'AvisosPantalla.vue');
    expect(c).not.toContain('dark:');
    expect(c).toContain('text-emerald-800');
  });

  it('publicar / ocultar (D1): ocultar pide confirmación y los dos avisos traen «Deshacer»', () => {
    const c = leer('composables', 'useContenidosCurso.ts');
    expect(c).toContain("titulo: '¿Ocultar este módulo?'");
    expect(c).toContain('Su avance no se pierde');
    expect((c.match(/deshacer: /g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('el botón de publicar mide 44 px en el celular y el chip dice la palabra completa (no «Pub.»/«Bor.»)', () => {
    const c = leer('components', 'docente', 'contenidos', 'EstadoPublicacion.vue');
    expect(c).toContain('min-h-[44px] sm:min-h-[36px]');
    expect(c).not.toMatch(/'Pub\.'|'Bor\.'/);
  });

  it('Contenido carga los temas archivados: no los pide a /topic/section (solo devuelve los activos)', () => {
    const c = leer('composables', 'useContenidosCurso.ts');
    const cargar = c.slice(c.indexOf('async function cargarModulos'), c.indexOf('async function alternarPublicacion'));
    expect(cargar).toContain('/sections/class/${claseId.value}');
    expect(cargar).not.toMatch(/api\.get[^\n]*\/topic\/section\//);
  });

  it('Contenido: el error al eliminar se muestra (aviso de error) y archivar desde «Eliminar» recarga el árbol', () => {
    const c = leer('pages', 'docente', 'contenidos.vue');
    // Antes se guardaba en `errorEliminacion`, que ningún elemento mostraba: un 409 dejaba la ventana muda.
    expect(c).not.toContain('errorEliminacion');
    expect(c).toContain("avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo eliminar.') })");
    const onArchivar = c.slice(c.indexOf('function onArchivar()'), c.indexOf('function onArchivar()') + 160);
    expect(onArchivar).toContain('loadSections()');
    expect(onArchivar).not.toContain('.filter(');
    expect(c).toContain("leccion: 'Lección «%s» eliminada'");
  });

  it('el aviso de archivar concuerda en género («Lección … archivada»)', () => {
    expect(leer('components', 'docente', 'contenidos', 'VentanaArchivar.vue')).toContain("leccion: 'Lección «%s» archivada'");
  });
});
