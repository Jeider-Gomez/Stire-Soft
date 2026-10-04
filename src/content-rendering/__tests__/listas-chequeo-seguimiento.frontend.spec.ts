import { readFileSync } from 'fs';
import * as path from 'path';

// Revisión de seguimiento de la lista de interfaz (04/10/2026, main @ 9ad39ef): axe-core y la medición de controles en
// las pantallas que no estaban en el recorrido del «después» (Crear clase, Ajustes, Contenidos, Mensajes, Perfil,
// Repasos). docs/calidad/listas-chequeo/2026-10-04_seguimiento/.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8').replace(/\r\n/g, '\n');

describe('UX-07 · contraste sobre fondos grises (axe-core color-contrast)', () => {
  it('las opciones de plantilla no usan el gris secundario (3,9:1 sobre la opción elegida)', () => {
    expect(leer('components', 'docente', 'ElegirPlantilla.vue')).not.toContain('text-base-texto-secundario');
  });

  it('en Ajustes, el botón apagado y las ayudas sobre gris alcanzan 4,5:1', () => {
    const a = leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue');
    expect(a).not.toContain("'bg-base-borde-sutil text-base-texto-secundario'");
    expect(a).toContain('<span class="block text-[11px] text-slate-600">{{ o.motivoNoDisponible || o.ayuda }}</span>');
  });

  it('en Contenidos, la descripción del módulo y «Publicado» alcanzan 4,5:1', () => {
    const c = leer('pages', 'docente', 'contenidos.vue');
    expect(c).toContain('<p v-if="sec.description" class="text-[11px] text-slate-600">');
    expect(c).not.toContain("'bg-semantico-pasa/10 text-semantico-pasa");
  });
});

describe('UX-07 · todo campo tiene etiqueta (axe-core label)', () => {
  it('la casilla «Requiere aprobación» de Crear clase está unida a su etiqueta', () => {
    const d = leer('pages', 'docente', 'index.vue');
    expect(d).toContain('<label for="new-class-aprobacion"');
    expect(d).toMatch(/id="new-class-aprobacion"\s+type="checkbox"/);
  });
});

describe('MOB-02 · controles de 44 px en el celular', () => {
  it.each([
    ['pages/estudiante/clases.vue', 3],
    ['pages/estudiante/mensajes.vue', 3],
    ['pages/docente/mensajes.vue', 3],
    ['pages/estudiante/repasos.vue', 1],
    ['pages/estudiante/index.vue', 1],
    ['pages/docente/clase/[classId]/index.vue', 1],
  ])('%s tiene sus botones de acción a 44 px', (rel, minimo) => {
    expect((leer(rel).match(/min-h-\[44px\]/g) ?? []).length).toBeGreaterThanOrEqual(minimo);
  });

  it('«¿Por qué veo esto?» se toca con el pulgar (antes 32 px)', () => {
    expect(leer('pages', 'estudiante', 'index.vue')).not.toContain('min-h-[32px]');
  });

  it('los campos del perfil miden 44 px (antes 39 px)', () => {
    const f = leer('components', 'perfil', 'Form.vue');
    expect(f).not.toMatch(/class="w-full px-3 py-2/);
  });

  it('Crear clase: «Cerrar» y «Generar sugerido» ya no miden 32 y 17 px', () => {
    const d = leer('pages', 'docente', 'index.vue');
    expect(d).toContain('aria-label="Cerrar"');
    expect(d).toContain('min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-slate-500');
    expect(d).toMatch(/min-h-\[44px\] sm:min-h-0 text-\[11px\] text-stire-blue[^>]*>\s*Generar sugerido/);
  });
});
