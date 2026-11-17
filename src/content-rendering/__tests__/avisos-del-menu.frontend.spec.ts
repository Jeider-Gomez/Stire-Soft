import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// P-2 y P-4 (17/11): «Sigue donde ibas» y «Abierta» en Mi asistencia (estudiante); solicitudes de rol y sugerencias nuevas
// (administrador). composables/useAvisosDelMenu.ts y components/layout/SidebarNav.vue.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const fuente = leer('composables', 'useAvisosDelMenu.ts');

function avisosDeAsistencia(clases: Array<{ sesiones?: Array<{ estado: string | null }> }>): boolean {
  const js = ts.transpileModule(fuente.replace(/^import .*$/m, ''), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return (mod.exports.avisosDeAsistencia as typeof avisosDeAsistencia)(clases);
}

describe('P-2 y P-4 · avisos del menú', () => {
  const menu = leer('components', 'layout', 'SidebarNav.vue');

  it('la asistencia está abierta solo con una sesión sin marcar (estado null)', () => {
    expect(avisosDeAsistencia([])).toBe(false);
    expect(avisosDeAsistencia([{ sesiones: [{ estado: 'presente' }, { estado: 'ausente' }] }])).toBe(false);
    expect(avisosDeAsistencia([{ sesiones: [] }, { sesiones: [{ estado: null }] }])).toBe(true);
    expect(avisosDeAsistencia([{}])).toBe(false);
  });

  it('pregunta como mucho una vez por minuto, salvo al salir de la pantalla que lo resuelve', () => {
    expect(fuente).toContain('const CADA_MS = 60_000');
    expect(fuente).toContain("['/estudiante/asistencia', '/admin', '/admin/sugerencias'].includes(antes ?? '')");
  });

  it('el administrador ve las solicitudes pendientes y las sugerencias nuevas', () => {
    expect(fuente).toContain("'/role-requests?status=pending'");
    expect(fuente).toContain("'/reportes?estado=nuevo'");
    expect(menu).toContain('v-if="solicitudesRol > 0"');
    expect(menu).toContain('v-if="sugerenciasNuevas > 0"');
  });

  it('el estudiante ve «Abierta» y «Sigue donde ibas», que no sale dentro de esa lección', () => {
    expect(menu).toContain('v-if="asistenciaAbierta" class="cuenta-menu">Abierta');
    expect(menu).toContain('<LayoutSigueDondeIbas />');
    const sigue = leer('components', 'layout', 'SigueDondeIbas.vue');
    expect(sigue).toContain('Sigue donde ibas');
    expect(sigue).toContain('return u && route.path !== `/estudiante/unidad/${u.id}` ? u : null');
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('class="punto-asistencia md:hidden"');
  });
});
