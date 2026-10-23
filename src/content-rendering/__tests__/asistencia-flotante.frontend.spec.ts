import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Asistencia activa (23/10, pedido del dueño): la toma de asistencia sigue a la vista en un panel flotante mientras el
// docente usa STIRE, con los que van llegando, escáner pequeño y marcar a mano, sin estorbar.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(): T {
  const js = ts.transpileModule(leer('utils', 'asistencia.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Marca = { id: number; nombre: string; estado: string | null; hora: string | null };
const a = cargar<{
  llegadasRecientes: (e: Marca[], n?: number) => Marca[];
  idsQueLlegaron: (e: Marca[]) => number[];
  llegadosNoVistos: (e: Marca[], vistos: number[]) => number;
  sinMarcarQueCoinciden: (e: Marca[], texto: string, n?: number) => Marca[];
}>();

const lista: Marca[] = [
  { id: 1, nombre: 'Ana Pérez', estado: 'presente', hora: '2026-10-23T13:05:00.000Z' },
  { id: 2, nombre: 'Andrés Gómez', estado: null, hora: null },
  { id: 3, nombre: 'Lucía Díaz', estado: 'tarde', hora: '2026-10-23T13:20:00.000Z' },
  { id: 4, nombre: 'Mateo Ruiz', estado: 'ausente', hora: '2026-10-23T13:30:00.000Z' },
  { id: 5, nombre: 'Ángela Ríos', estado: null, hora: null },
];

describe('lo que muestra el panel', () => {
  it('los últimos que llegaron, del más reciente al más antiguo; ausentes y sin marcar no cuentan', () => {
    expect(a.llegadasRecientes(lista).map((e) => e.id)).toEqual([3, 1]);
    expect(a.llegadasRecientes(lista, 1).map((e) => e.id)).toEqual([3]);
  });

  it('«+N nuevos» cuenta por id a quienes llegaron desde que el docente miró, sin depender del reloj', () => {
    const vistos = a.idsQueLlegaron(lista);
    expect(vistos).toEqual([1, 3]);
    expect(a.llegadosNoVistos(lista, vistos)).toBe(0);
    const despues = lista.map((e) => (e.id === 2 ? { ...e, estado: 'presente', hora: '2026-10-23T13:00:00.000Z' } : e));
    expect(a.llegadosNoVistos(despues, vistos)).toBe(1);
  });

  it('marcar a mano busca solo entre quienes faltan, sin importar tildes ni mayúsculas', () => {
    expect(a.sinMarcarQueCoinciden(lista, 'an').map((e) => e.id)).toEqual([2, 5]);
    expect(a.sinMarcarQueCoinciden(lista, 'ANGELA').map((e) => e.id)).toEqual([5]);
    expect(a.sinMarcarQueCoinciden(lista, 'ana')).toEqual([]);
  });
});

describe('dónde vive y cómo se comporta', () => {
  it('está en el layout del docente y no sale en la propia página de asistencia', () => {
    expect(leer('layouts', 'teacher.vue')).toContain('<DocenteAsistenciaFlotante />');
    const panel = leer('components', 'docente', 'AsistenciaFlotante.vue');
    expect(panel).toContain('route.path === `/docente/clase/${store.activa.classId}/asistencia`');
    expect(panel).toContain('class="fixed bottom-4 right-4 z-[60]');
    expect(panel).toContain(':aria-expanded="abierto"');
    expect(panel).toContain('@keydown.esc="plegar"');
    expect(panel).toContain('<CamaraQr @leido="alLeer"');
    expect(panel).toContain('if ((leidos.get(texto) ?? 0) > ahora - 5000) return');
  });

  it('se activa al tomar la asistencia de hoy o con «Dejar activa mientras uso STIRE», y se va al cerrar o borrar la sesión', () => {
    const pagina = leer('pages', 'docente', 'clase', '[classId]', 'asistencia.vue');
    expect(pagina).toContain('asistenciaActiva.activar(classId, s.id)');
    expect(pagina).toContain('<DocenteAsistenciaDejarActiva :class-id="classId" :sesion-id="detalle.sesion.id" :abierta="detalle.sesion.abierta" />');
    expect(leer('components', 'docente', 'AsistenciaDejarActiva.vue')).toContain("{ if (!abierta && activaAqui.value) store.desactivar() }");
    const tienda = leer('stores', 'asistenciaActiva.ts');
    expect(tienda).toContain('if (!detalle.value.sesion.abierta) desactivar()');
    expect(tienda).toContain('=== 404) desactivar()');
    expect(tienda).toContain("document.visibilityState === 'visible'");
    expect(tienda).toContain('sessionStorage.setItem(CLAVE');
  });

  it('las rutas siguen en el composable (PAT-01): la tienda las usa con un cliente creado al inicio', () => {
    expect(leer('composables', 'useAsistenciaClase.ts')).toContain('export function accionesAsistencia(api: Api, classId: number)');
    expect(leer('stores', 'asistenciaActiva.ts')).toContain('accionesAsistencia(api, activa.value.classId)');
  });
});
