import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raizNuxt = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raizNuxt, ...p), 'utf8');

// Jest no compila frontend-nuxt/: se transpila la función de títulos, como en evaluacion-heuristica.frontend.spec.ts.
function cargarTitulo(): (ruta: string) => string {
  const js = ts.transpileModule(leer('utils', 'tituloPagina.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports['tituloPagina'] as (ruta: string) => string;
}
const tituloPagina = cargarTitulo();

describe('Una pantalla se llama igual en el menú, en su título y en la pestaña del navegador', () => {
  it('«Mi cuenta» en los tres roles (antes «Mi perfil» en la pestaña y en el menú de la cuenta)', () => {
    for (const ruta of ['/estudiante/perfil', '/docente/perfil', '/admin/perfil']) expect(tituloPagina(ruta)).toBe('Mi cuenta · STIRE');
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('<span>Mi cuenta</span>');
    for (const archivo of [['components', 'layout', 'HeaderNav.vue'], ['utils', 'migas.ts'], ['utils', 'buscar.ts'], ['utils', 'manual.ts']]) {
      expect(leer(...archivo)).not.toContain('Mi perfil');
    }
  });

  it('las pestañas del docente usan los nombres del menú', () => {
    expect(tituloPagina('/docente/contenidos')).toBe('Contenido · STIRE');
    expect(tituloPagina('/docente/rendimiento')).toBe('Estudiantes · STIRE');
    expect(tituloPagina('/docente/mensajes')).toBe('Avisos y mensajes · STIRE');
    expect(tituloPagina('/docente/clase/7')).toBe('Resumen de la clase · STIRE');
  });

  it('las pestañas del administrador usan el título de cada pantalla', () => {
    expect(tituloPagina('/admin')).toBe('Usuarios · STIRE');
    expect(tituloPagina('/admin/dashboard')).toBe('Sistema · STIRE');
    expect(tituloPagina('/admin/sistema')).toBe('Registros y mantenimiento · STIRE');
    expect(tituloPagina('/admin/catalogo')).toBe('Catálogo · STIRE');
  });
});
