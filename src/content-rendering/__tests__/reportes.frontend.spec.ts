import { readFileSync } from 'fs';
import * as path from 'path';

// «Reportar» y la bandeja del admin (docs/calidad/PRUEBA_DOS_SEMANAS.md).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');

describe('Reportar desde cualquier pantalla', () => {
  it('el botón está en el encabezado de todos los roles y anota sola la pantalla y el dispositivo', () => {
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('<LayoutBotonReportar />');
    const boton = leer('components', 'layout', 'BotonReportar.vue');
    expect(boton).toContain('ruta: route.fullPath');
    expect(boton).toContain('classId: claseActual()');
    expect(boton).toContain('dispositivo: `${window.innerWidth}×${window.innerHeight} · ${navigator.userAgent}`');
    expect(boton).toContain("gravedad: f.tipo === 'idea' ? undefined : f.gravedad");
    expect(boton).toContain("api.get('/reportes/mios')");
  });

  it('el admin los ve en «Reportes», los marca y los descarga en CSV', () => {
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('to="/admin/reportes"');
    const bandeja = leer('pages', 'admin', 'reportes.vue');
    expect(bandeja).toContain('api.patch(`/reportes/${r.id}`, { estado: r.estado, nota: r.notaEditada })');
    expect(bandeja).toContain("a.download = 'reportes-stire.csv'");
  });
});
