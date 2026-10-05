import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// PAT-01 y PAT-04 · El panel del admin dividido (docs/DISENO_ARQUITECTURA_FRONTEND.md): antes, un archivo de 1532
// líneas con la API, cinco ventanas y dos tablas; ahora la página organiza, el composable habla con la API y cada
// pestaña y ventana es un componente.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

const ARCHIVOS = [
  ['pages', 'admin', 'index.vue'],
  ['composables', 'useGestionUsuarios.ts'],
  ...['AdminDialogo', 'AdminModalCambioRol', 'AdminModalDecision', 'AdminModalRegistrar', 'AdminModalActivar', 'AdminModalClave', 'AdminTablaUsuarios', 'AdminSolicitudesDocente'].map((n) => ['components', 'admin', `${n}.vue`]),
];

describe('ningún archivo del panel pasa de 300 líneas («The Blob»)', () => {
  it.each(ARCHIVOS.map((p) => [p.join('/'), p]))('%s', (_n, p) => {
    expect(leer(...(p as string[])).split('\n').length).toBeLessThanOrEqual(300);
  });
});

describe('separación de responsabilidades (PAT-01)', () => {
  it('ni la página ni sus componentes llaman a la API: lo hace el composable', () => {
    for (const p of ARCHIVOS.filter((x) => x[0] !== 'composables')) expect(leer(...p)).not.toMatch(/useApi\(|\$fetch|api\.(get|post|patch|put|delete)/);
    const c = leer('composables', 'useGestionUsuarios.ts');
    for (const ruta of ["'/users'", '`/users/${u.id}/role`', '`/role-requests/${s.id}`', "'/role-requests'"]) expect(c).toContain(ruta);
  });

  it('la página crea la gestión y la comparte; los componentes la reciben', () => {
    expect(leer('pages', 'admin', 'index.vue')).toContain('provide(CLAVE_GESTION_USUARIOS, gestion)');
    expect(leer('components', 'admin', 'AdminModalRegistrar.vue')).toContain('useGestionUsuariosDeLaPagina()');
  });

  it('una sola ventana a la vez (sin ventanas encima de otras) y todas sobre la misma base accesible', () => {
    const p = leer('pages', 'admin', 'index.vue');
    expect(p.match(/<AdminModal\w+ v-(?:else-)?if="ventana\?\.tipo === /g)).toHaveLength(5);
    const d = leer('components', 'admin', 'AdminDialogo.vue');
    expect(d).toContain('role="dialog"');
    expect(d).toContain('aria-modal="true"');
    expect(d).toContain('atraparFoco($event, dialogo)');
    expect(d).toContain('useEscapeToClose(() => true, cerrar)');
    expect(d).toContain("document.getElementById(id)?.focus()");
  });
});

describe('reglas puras (utils/adminUsuarios.ts)', () => {
  type U = { id: number; fullName: string; email: string; role: string; isActive: boolean };
  const a = cargar<{
    otrosRoles: (u: { role: string }) => Array<{ value: string }>;
    filtrarUsuarios: (u: U[], q: string, rol: string) => U[];
    explicacionCambioRol: (u: { fullName: string; email: string; role: string }, r: string) => string;
    generarClaveSegura: (azar?: () => number) => string;
  }>('adminUsuarios');
  const usuarios: U[] = [
    { id: 1, fullName: 'Laura Martínez', email: 'laura@x.co', role: 'docente', isActive: true },
    { id: 2, fullName: 'Admin', email: 'admin@x.co', role: 'admin', isActive: true },
    { id: 3, fullName: 'Sebastián', email: 'seba@x.co', role: 'estudiante', isActive: false },
  ];

  it('los roles a los que se puede pasar excluyen el actual («administrador» = «admin»)', () => {
    expect(a.otrosRoles({ role: 'administrador' }).map((r) => r.value)).toEqual(['estudiante', 'docente']);
  });

  it('filtra por nombre o correo y por rol', () => {
    expect(a.filtrarUsuarios(usuarios, 'LAURA', 'todos').map((u) => u.id)).toEqual([1]);
    expect(a.filtrarUsuarios(usuarios, 'x.co', 'administrador').map((u) => u.id)).toEqual([2]);
  });

  it('explica el cambio en una frase', () => {
    expect(a.explicacionCambioRol(usuarios[2], 'docente')).toMatch(/^Sebastián pasará de estudiante a docente\. Podrá crear clases/);
  });

  it('la contraseña generada cumple la política: mayúscula, minúscula, número y símbolo, sin caracteres confusos', () => {
    for (let i = 0; i < 50; i++) {
      const c = a.generarClaveSegura();
      expect(c).toMatch(/[A-Z]/);
      expect(c).toMatch(/[a-z]/);
      expect(c).toMatch(/[0-9]/);
      expect(c).toMatch(/[!@#$%&*]/);
      expect(c.slice(2)).not.toMatch(/[IlO01]/);
      expect(c).toHaveLength(11);
    }
  });
});
