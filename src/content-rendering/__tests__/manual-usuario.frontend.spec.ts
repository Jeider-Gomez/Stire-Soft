import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Manual de usuario (S10-P07, 18/10): se ve en /ayuda sin iniciar sesión y se descarga en PDF, con la identidad de
// STIRE. Cada tarea con la misma plantilla (como las guías de Canvas o de Google Classroom).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(): T {
  const js = ts.transpileModule(leer('utils', 'manual.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Tarea = { id: string; titulo: string; paraQue: string; pasos: string[]; captura?: { src: string; alt: string }; resultado: string };
const m = cargar<{
  MANUAL: Array<{ id: string; rol: string; tareas: Tarea[] }>;
  PDF_MANUAL: string;
  trozosConBotones: (t: string) => Array<{ tipo: string; valor: string }>;
}>();

describe('manual de usuario', () => {
  it('lo que va entre «» se dibuja como el botón de la pantalla', () => {
    expect(m.trozosConBotones('Toca «Unirse» y luego «Crear clase».')).toEqual([
      { tipo: 'texto', valor: 'Toca ' },
      { tipo: 'boton', valor: 'Unirse' },
      { tipo: 'texto', valor: ' y luego ' },
      { tipo: 'boton', valor: 'Crear clase' },
      { tipo: 'texto', valor: '.' },
    ]);
  });

  it('cada tarea sigue la plantilla: pregunta, para qué, pasos, resultado; ids únicos y capturas que existen con su texto alternativo', () => {
    const ids = new Set<string>();
    for (const s of m.MANUAL) {
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      for (const t of s.tareas) {
        expect(ids.has(t.id)).toBe(false);
        ids.add(t.id);
        expect(t.titulo).toMatch(/^¿.+\?$/);
        expect(t.paraQue.length).toBeGreaterThan(10);
        expect(t.pasos.length).toBeGreaterThan(0);
        expect(t.resultado.length).toBeGreaterThan(5);
        if (t.captura) {
          expect(existsSync(path.join(raiz, 'public', t.captura.src))).toBe(true);
          expect(t.captura.alt.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('los botones que nombra existen con ese texto en la aplicación', () => {
    const botones = ['Unirse', 'Escanear QR', 'Crear nueva clase', 'Generar sugerido', 'Empezar vacía', 'Ingresar a la plataforma', 'Regístrate aquí', 'Crear cuenta'];
    const todo = ['pages/estudiante/clases.vue', 'components/EscanerQrClase.vue', 'pages/docente/index.vue', 'components/docente/VentanaCrearClase.vue', 'components/docente/ElegirPlantilla.vue', 'pages/auth/login.vue', 'pages/auth/register.vue'].map((f) => leer(f)).join('\n');
    for (const b of botones) expect(todo).toContain(b);
  });

  it('/ayuda se abre sin cuenta, tiene descarga en PDF y estilo de impresión, y se llega desde el pie de página', () => {
    expect(leer('middleware', 'auth.global.ts')).toContain("if (to.path === '/ayuda') return");
    const pagina = leer('pages', 'ayuda.vue');
    expect(pagina).toContain(':href="PDF_MANUAL" download');
    expect(pagina).toContain('@media print');
    expect(m.PDF_MANUAL).toBe('/manual/STIRE-Manual-de-usuario.pdf');
    expect(leer('components', 'layout', 'FooterBar.vue')).toContain('to="/ayuda"');
    expect(leer('layouts', 'auth.vue')).toContain('to="/ayuda"');
  });
});
