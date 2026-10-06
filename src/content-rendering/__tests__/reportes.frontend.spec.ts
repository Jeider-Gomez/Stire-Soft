import { readFileSync } from 'fs';
import * as path from 'path';

// «Sugerencias» y la bandeja del admin (docs/calidad/PRUEBA_DOS_SEMANAS.md). El dueño pidió no decir «reportar».
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');

describe('Sugerencias desde cualquier pantalla', () => {
  it('el botón está en el encabezado de todos los roles y anota sola la pantalla y el dispositivo', () => {
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('<LayoutBotonSugerencias />');
    const boton = leer('components', 'layout', 'BotonSugerencias.vue');
    expect(boton).toContain('<span class="hidden lg:inline">Sugerencias</span>');
    expect(boton).not.toMatch(/>\s*Reportar/);
    expect(boton).toContain('ruta: route.fullPath');
    expect(boton).toContain('classId: claseActual()');
    expect(boton).toContain('dispositivo: `${window.innerWidth}×${window.innerHeight} · ${navigator.userAgent}`');
    expect(boton).toContain("gravedad: f.tipo === 'idea' ? undefined : f.gravedad");
    expect(boton).toContain("api.get('/reportes/mios')");
  });

  it('el admin los ve en «Sugerencias», los marca y los descarga en CSV', () => {
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('to="/admin/sugerencias"');
    const bandeja = leer('pages', 'admin', 'sugerencias.vue');
    expect(bandeja).toContain('sugerencias.actualizar(r.id, { estado: r.estado, nota: r.notaEditada })');
    expect(leer('composables', 'useSugerencias.ts')).toContain('api.patch(`/reportes/${id}`, cambios)');
    expect(bandeja).toContain("a.download = 'sugerencias-stire.csv'");
  });
});
