import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// «Buscar» (Ctrl K) del docente y del administrador (v3, Fase B; utils/buscar.ts, components/layout/Buscar.vue).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  const requerir = (r: string) => cargar(r.replace('./', ''));
  new Function('module', 'exports', 'require', js)(mod, mod.exports, requerir);
  return mod.exports as T;
}

interface R { id: string; titulo: string; detalle: string; ir: string; tipo: 'pantalla' | 'clase' | 'ayuda'; claves?: string }
const b = cargar<{
  normalizar: (t: string) => string;
  palabras: (t: string) => string[];
  buscar: (items: R[], texto: string, maximo?: number) => R[];
  pantallasDeRol: (rol: string) => R[];
  clasesComoResultados: (c: Array<{ id: number; name: string; code?: string }>) => R[];
  ayudaDeRol: (manual: unknown[], rol: string) => R[];
}>('buscar');
const { MANUAL } = cargar<{ MANUAL: unknown[] }>('manual');

const docente = () => [
  ...b.pantallasDeRol('docente'),
  ...b.clasesComoResultados([{ id: 7, name: 'Fundamentos de Algoritmia', code: 'FA-G2' }]),
  ...b.ayudaDeRol(MANUAL, 'docente'),
];

describe('buscar como lo escribe la gente', () => {
  it('sin tildes ni mayúsculas, y sin las palabras vacías de una pregunta', () => {
    expect(b.normalizar('Catálogo ACADÉMICO')).toBe('catalogo academico');
    expect(b.palabras('¿Cómo tomo la asistencia?')).toEqual(['tomo', 'asistencia']);
  });
  it('sin texto, las pantallas del rol para empezar', () => {
    expect(b.buscar(docente(), '').map((r) => r.titulo)).toEqual(['Mis clases', 'Biblioteca', 'Avisos y mensajes', 'Mi cuenta']);
  });
  it('el docente encuentra su clase por el nombre o por el código, y cada sección ya con la clase elegida', () => {
    expect(b.buscar(docente(), 'fundamentos')[0]).toMatchObject({ titulo: 'Fundamentos de Algoritmia', ir: '/docente/clase/7' });
    expect(b.buscar(docente(), 'fa-g2')[0].ir).toBe('/docente/clase/7');
    const entregas = b.buscar(docente(), 'entregas fundamentos')[0];
    expect(entregas.titulo).toBe('Entregas · Fundamentos de Algoritmia');
    expect(entregas.ir).toContain('7');
  });
  it('con palabras de la gente, no solo el nombre exacto: «calificaciones» lleva a las notas', () => {
    expect(b.buscar(docente(), 'calificaciones')[0].titulo).toBe('Notas · Fundamentos de Algoritmia');
  });
  it('las preguntas encuentran la tarea del manual y llevan a /ayuda#tarea', () => {
    const r = b.buscar(docente(), 'asistencia').find((x) => x.tipo === 'ayuda');
    expect(r?.ir).toMatch(/^\/ayuda#/);
  });
  it('el administrador busca entre sus pantallas y no ve las del docente', () => {
    const admin = [...b.pantallasDeRol('administrador'), ...b.ayudaDeRol(MANUAL, 'administrador')];
    expect(b.buscar(admin, 'solicitudes docente')[0]).toMatchObject({ titulo: 'Usuarios y roles', ir: '/admin' });
    expect(admin.some((r) => r.ir.startsWith('/docente'))).toBe(false);
  });
  it('si nada coincide, la lista queda vacía (la ventana ofrece la ayuda)', () => {
    expect(b.buscar(docente(), 'xyzqwe')).toEqual([]);
    expect(leer('components', 'layout', 'Buscar.vue')).toContain('No encontramos nada con esas palabras.');
  });
});

describe('dónde está', () => {
  it('el mismo botón «Buscar» y Ctrl K en los tres roles; el del estudiante sigue siendo «Ir a una lección»', () => {
    const h = leer('components', 'layout', 'HeaderNav.vue');
    expect(h).toContain("@click=\"authStore.currentRole === 'estudiante' ? (irALeccion = true) : (buscarAbierto = true)\"");
    expect(h).not.toContain('<button v-if="authStore.currentRole === \'estudiante\'" type="button"');
    for (const l of ['teacher.vue', 'admin.vue']) expect(leer('layouts', l)).toContain('<LayoutBuscar />');
    expect(leer('layouts', 'student.vue')).not.toContain('<LayoutBuscar />');
  });
  it('es una ventana accesible: diálogo modal, combobox con su lista y el foco vuelve al cerrar', () => {
    const v = leer('components', 'layout', 'Buscar.vue');
    expect(v).toContain('role="dialog" aria-modal="true"');
    expect(v).toContain('role="combobox"');
    expect(v).toContain('role="listbox"');
    expect(v).toContain('devolver = recordarFoco()');
  });
});

describe('barra de abajo del docente en el celular (v3, cuadro D3-Cel-Inicio)', () => {
  const barra = leer('components', 'layout', 'BarraInferiorDocente.vue');
  it('Clases, Asistencia, Estudiantes, Mensajes y Asistente, en ese orden', () => {
    const orden = ['</span>Clases', '</span>Asistencia', '</span>Estudiantes', '</span>Mensajes', '</span>Asistente'].map((t) => barra.indexOf(t));
    expect(orden.every((n) => n > 0)).toBe(true);
    expect([...orden].sort((x, y) => x - y)).toEqual(orden);
  });
  it('Asistencia y Estudiantes son de la clase elegida en el menú; sin clase llevan a «Mis clases»', () => {
    expect(barra).toContain(":to=\"clase ? enlacePestana('asistencia', clase) : '/docente'\"");
    expect(leer('components', 'layout', 'ClasesDelMenu.vue')).toContain("const idClase = useState<number | null>('clase-docente-id'");
  });
  it('el Asistente abre el mismo panel que la barra de arriba', () => {
    expect(barra).toContain("useState('asistente-abierto'");
    expect(barra).toContain('aria-controls="panel-asistente"');
  });
  it('está en el layout del docente con su espacio abajo, y la asistencia flotante sube para no taparla', () => {
    const l = leer('layouts', 'teacher.vue');
    expect(l).toContain('<LayoutBarraInferiorDocente />');
    expect(l).toContain('pb-[72px] md:pb-0');
    expect(leer('components', 'docente', 'AsistenciaFlotante.vue')).toContain('bottom-[88px] md:bottom-4');
    // el estilo es uno solo para las dos barras
    expect(leer('assets', 'css', 'menu-v3.css')).toContain('.barra-inferior .pildora {');
    expect(leer('components', 'layout', 'BarraInferior.vue')).not.toContain('<style');
  });
});
