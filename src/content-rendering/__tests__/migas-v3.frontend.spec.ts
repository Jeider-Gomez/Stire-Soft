// «Dónde estás» de la barra de arriba (v3, Fase B; barra() y barraD() de scripts/diseno-v3/generador/proto_est2.mjs).
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.resolve(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => fs.readFileSync(path.join(raiz, ...p), 'utf8');
const codigo = ts.transpileModule(leer('utils', 'migas.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod: { exports: Record<string, unknown> } = { exports: {} };
new Function('module', 'exports', codigo)(mod, mod.exports);
const { migasDeRuta } = mod.exports as { migasDeRuta: (r: string, rol: string, clase?: string | null) => string[] };

describe('«Dónde estás» con los nombres del menú v3', () => {
  it('estudiante: como los cuadros E-*', () => {
    expect(migasDeRuta('/estudiante', 'estudiante')).toEqual(['Inicio']);
    expect(migasDeRuta('/estudiante/unidad/4', 'estudiante')).toEqual(['Aprender', 'Lección']);
    expect(migasDeRuta('/estudiante/mensajes', 'estudiante')).toEqual(['Mi clase', 'Mensajes']);
  });
  it('docente: lo de una clase empieza con su nombre, como los cuadros D3-*', () => {
    expect(migasDeRuta('/docente', 'docente', 'Fundamentos · G2')).toEqual(['Mis clases']);
    expect(migasDeRuta('/docente/entregas', 'docente', 'Fundamentos · G2')).toEqual(['Fundamentos · G2', 'Entregas']);
    expect(migasDeRuta('/docente/clase/3/notas', 'docente', 'Fundamentos · G2')).toEqual(['Fundamentos · G2', 'Asistencia y notas', 'Notas']);
    // sin clase elegida no se inventa una
    expect(migasDeRuta('/docente/clase/3', 'docente', null)).toEqual(['Resumen de la clase']);
  });
  it('administrador: «Administración» y la pantalla, como en todos los cuadros A-…', () => {
    expect(migasDeRuta('/admin', 'administrador')).toEqual(['Administración', 'Usuarios y roles']);
    expect(migasDeRuta('/admin/sistema', 'administrador')).toEqual(['Administración', 'Registros y mantenimiento']);
  });
  it('una ruta desconocida no muestra camino', () => {
    expect(migasDeRuta('/otra', 'estudiante')).toEqual([]);
  });
  it('la barra los muestra a la izquierda y en el orden del prototipo', () => {
    const h = leer('components', 'layout', 'HeaderNav.vue');
    expect(h).toContain('aria-label="Dónde estás"');
    const orden = ['<span>Buscar</span>', '<LayoutBotonApariencia ', '<LayoutNotificationBell />', '<LayoutMenuAyuda ', '<LayoutBotonSugerencias ', '<AvatarUsuario'].map((t) => h.indexOf(t));
    expect(orden.every((n) => n > 0)).toBe(true);
    expect([...orden].sort((a, b) => a - b)).toEqual(orden);
  });
});
