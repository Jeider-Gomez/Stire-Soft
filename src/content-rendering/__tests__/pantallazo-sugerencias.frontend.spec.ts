import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { MAX_BYTES_CAPTURA as MAX_SERVIDOR } from '../../media/imagen-subida';

// Pantallazo en «Sugerencias» (02/10): zona para pegarlo con Ctrl+V, se reduce antes de subirlo y solo lo ven quien lo
// envió y el admin.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const u = (() => {
  const js = ts.transpileModule(leer('utils', 'captura.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as {
    MAX_BYTES_CAPTURA: number;
    medidaReducida: (a: number, b: number, max?: number) => { ancho: number; alto: number };
    imagenDe: (d: unknown) => unknown;
    esImagenAceptada: (a: { type: string }) => boolean;
    atajoDeCaptura: (p: string) => string;
  };
})();

describe('Pantallazo en las sugerencias (frontend)', () => {
  it('el límite es el mismo que el del servidor', () => {
    expect(u.MAX_BYTES_CAPTURA).toBe(MAX_SERVIDOR);
  });

  it('reduce a 1600 px de ancho conservando la proporción y nunca agranda', () => {
    expect(u.medidaReducida(1920, 1080)).toEqual({ ancho: 1600, alto: 900 });
    expect(u.medidaReducida(2560, 1600)).toEqual({ ancho: 1600, alto: 1000 });
    expect(u.medidaReducida(375, 812)).toEqual({ ancho: 375, alto: 812 });
  });

  it('toma la imagen de lo que se pega (un pantallazo copiado llega como archivo) e ignora el texto', () => {
    const png = { type: 'image/png', name: 'image.png' };
    const pegadoImagen = { items: [{ kind: 'string', type: 'text/plain', getAsFile: () => null }, { kind: 'file', type: 'image/png', getAsFile: () => png }], files: [] };
    expect(u.imagenDe(pegadoImagen)).toBe(png);
    expect(u.imagenDe({ items: [{ kind: 'string', type: 'text/plain', getAsFile: () => null }], files: [] })).toBeNull();
    expect(u.imagenDe(null)).toBeNull();
    expect(u.esImagenAceptada({ type: 'image/webp' })).toBe(true);
    expect(u.esImagenAceptada({ type: 'image/svg+xml' })).toBe(false);
  });

  it('dice cómo tomar un pantallazo según el equipo', () => {
    expect(u.atajoDeCaptura('Mozilla/5.0 (Windows NT 10.0)')).toBe('Win + Shift + S');
    expect(u.atajoDeCaptura('Mozilla/5.0 (Macintosh; Intel Mac OS X)')).toBe('Cmd + Shift + 4');
    expect(u.atajoDeCaptura('Mozilla/5.0 (Linux; Android 14)')).toBe('el botón de captura del celular');
  });

  it('el formulario tiene la zona para pegar, sube el pantallazo después de guardar la sugerencia y no se cierra al soltar una selección afuera', () => {
    const zona = leer('components', 'ZonaPantallazo.vue');
    expect(zona).toContain('@paste.prevent="alPegar"');
    expect(zona).toContain('@drop.prevent="alSoltar"');
    expect(zona).toContain('Ctrl + V');
    const boton = leer('components', 'layout', 'BotonSugerencias.vue');
    expect(boton).toContain('<ZonaPantallazo ref="zonaRef" v-model="captura" />');
    expect(boton).toContain('@paste="pegarEnTexto"');
    expect(boton).toContain("await api.put(`/reportes/${creado.id}/captura`, datos)");
    expect(boton).toContain('@click.self="inicioClic === $event.currentTarget && cerrar()"');
  });

  it('el admin ve el pantallazo pidiéndolo con su sesión (no es una imagen pública)', () => {
    const admin = leer('pages', 'admin', 'sugerencias.vue');
    expect(admin).toContain("api.apiFetch<Blob>(`/reportes/${r.id}/captura`, { responseType: 'blob' })");
    expect(leer('composables', 'useApi.ts')).toContain("responseType?: 'blob'");
  });
});
