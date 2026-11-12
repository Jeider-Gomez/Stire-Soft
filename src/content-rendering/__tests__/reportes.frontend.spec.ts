import { readFileSync } from 'fs';
import * as path from 'path';

// «Sugerencias» y la bandeja del admin (docs/calidad/PRUEBA_DOS_SEMANAS.md). El dueño pidió no decir «reportar».
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');

describe('Sugerencias desde cualquier pantalla', () => {
  it('el botón está en el encabezado del estudiante y del docente y anota sola la pantalla y el dispositivo', () => {
    // v3 (12/11): el administrador las lee, no las envía (cuadro A-Usuarios); en el celular el botón no se ve pero sigue
    // montado, y «Enviar una sugerencia» del menú de Ayuda abre su ventana (barra E-Cel-Inicio: logo, avisos y cuenta).
    const h = leer('components', 'layout', 'HeaderNav.vue');
    expect(h).toContain(`<LayoutBotonSugerencias v-if="authStore.currentRole !== 'administrador'" class="hidden md:block" />`);
    expect(h).toContain(`<LayoutMenuAyuda :con-sugerencias="authStore.currentRole !== 'administrador'" />`);
    const boton = leer('components', 'layout', 'BotonSugerencias.vue');
    // 07/10: visible desde lg y siempre para el lector (WCAG 2.5.3, control por voz).
    expect(boton).toContain('<span class="sr-only lg:not-sr-only">Sugerencias</span>');
    expect(boton).not.toMatch(/>\s*Reportar/);
    expect(boton).toContain('ruta: route.fullPath');
    expect(boton).toContain('classId: claseActual()');
    expect(boton).toContain('dispositivo: `${window.innerWidth}×${window.innerHeight} · ${navigator.userAgent}`');
    expect(boton).toContain("gravedad: f.tipo === 'idea' ? undefined : f.gravedad");
    expect(boton).toContain("api.get('/reportes/mios')");
  });

  it('el admin los ve en «Sugerencias», los resuelve o archiva y los descarga en Excel (desde el 07/10; antes CSV)', () => {
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('to="/admin/sugerencias"');
    const bandeja = leer('pages', 'admin', 'sugerencias.vue');
    expect(bandeja).toContain('await sugerencias.actualizar(r.id, { estado, nota: nota ?? undefined, avisar })');
    expect(leer('composables', 'useSugerencias.ts')).toContain('api.patch(`/reportes/${id}`, cambios)');
    expect(bandeja).toContain('descargarExcel(libroDeSugerencias(lista.value), `sugerencias-stire-${new Date().toISOString().slice(0, 10)}.xlsx`)');
  });
});
