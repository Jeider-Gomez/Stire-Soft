// «Contenido del curso» en la lección (v3, Fase D, paso 2; cuadros «E-Leccion» y «E-Leccion-Cerrado» del lienzo).
import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Estado = 'hecho' | 'aqui' | 'sigue' | 'empezada' | 'pendiente';
type Modulo = { id: number; titulo: string; dominadas: number; total: number; dominio: number; abierto: boolean; requiere: string | null; temas: Array<{ titulo: string; lecciones: Array<{ id: number; estado: Estado }> }> };
const C = cargar<{
  contenidoDelCurso: (m: unknown[], e: unknown[], unitId: number) => Modulo[];
  tituloModulo: (t: string) => string;
}>('contenidoCurso');

const u = (id: number, status: string, masteryPercentage = 0, empezada = false) => ({ id, title: `Lección ${id}`, status, masteryPercentage, empezada });
const curso = [
  { id: 1, title: 'Unidad 1 - Introducción', units: [], topics: [
    { id: 11, title: '¿Qué es un algoritmo?', units: [u(1, 'dominado', 90), u(2, 'en-progreso', 40, true)] },
    { id: 12, title: 'Variables', units: [u(3, 'dominado', 88), u(4, 'por-iniciar')] },
  ] },
  { id: 2, title: 'Unidad 2: Diseño', units: [], topics: [{ id: 21, title: 'Condicionales', units: [u(5, 'por-iniciar')] }] },
];
const estados = [
  { id: 1, abierto: true, dominio: 55, requiere: null },
  { id: 2, abierto: false, dominio: 0, requiere: { moduloId: 1, titulo: 'Unidad 1 - Introducción', dominio: 55, umbral: 60 } },
];

describe('«Contenido del curso»: qué muestra', () => {
  const [m1, m2] = C.contenidoDelCurso(curso, estados, 2);

  it('cada lección con su estado; «Sigue» es la primera sin dominar después de la abierta, saltando las dominadas', () => {
    expect(m1!.temas.flatMap((t) => t.lecciones.map((l) => l.estado))).toEqual(['hecho', 'aqui', 'hecho', 'sigue']);
  });
  it('el módulo dice cuántas lecciones lleva y su dominio', () => {
    expect(m1).toMatchObject({ titulo: 'Unidad 1 · Introducción', dominadas: 2, total: 4, dominio: 55, abierto: true });
  });
  it('un módulo cerrado dice qué lo abre, en palabras', () => {
    expect(m2!.abierto).toBe(false);
    expect(m2!.requiere).toBe('Se abre con 60 % de dominio en «Unidad 1 · Introducción». Vas en 55 %.');
  });
  it('los títulos de módulo se unen con «·», como en el cuadro', () => {
    expect(C.tituloModulo('Módulo 1: Fundamentos')).toBe('Módulo 1 · Fundamentos');
    expect(C.tituloModulo('Unidad 3 · Algoritmos')).toBe('Unidad 3 · Algoritmos');
  });
});

describe('«Contenido del curso»: dónde y cómo', () => {
  it('va al lado de la lección, solo en computador, y se recoge y se vuelve a abrir', () => {
    expect(leer('layouts', 'student.vue')).toContain('<EstudianteContenidoCurso v-if="enLeccion" />');
    const panel = leer('components', 'estudiante', 'ContenidoCurso.vue');
    expect(panel).toContain('aria-label="Contenido del curso"');
    expect(panel).toContain('class="hidden lg:flex flex-col w-[300px]');
    expect(panel).toContain('aria-label="Recoger el contenido"');
    expect(leer('components', 'estudiante', 'SaltosLeccion.vue')).toContain('<ListTree :size="16" aria-hidden="true" /> Contenido');
    expect(leer('composables', 'useContenidoCurso.ts')).toContain("localStorage.setItem(CLAVE_CONTENIDO, abierto.value ? '1' : '0')");
  });

  it('el estado de cada lección se lee también sin ver el círculo, y la abierta lleva aria-current', () => {
    const fila = leer('components', 'estudiante', 'FilaContenido.vue');
    expect(fila).toContain('<span class="sr-only"> ({{ TEXTO_ESTADO[leccion.estado] }})</span>');
    expect(fila).toContain(":aria-current=\"leccion.estado === 'aqui' ? 'page' : undefined\"");
    expect(fila).toContain('min-h-[44px]');
  });

  it('al estudiar, el menú va en íconos sin cambiar lo que el estudiante eligió para las demás pantallas', () => {
    const m = leer('composables', 'useMenuColapsado.ts');
    expect(m).toContain("const enLeccion = computed(() => route.path.startsWith('/estudiante/unidad/'))");
    expect(m).toContain('colapsado.value = enLeccion.value ? !abiertoEnLeccion.value : elegido.value');
    // Y el plan del menú no se repite al lado del panel.
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain("<LayoutPlanDelCurso v-if=\"!route.path.startsWith('/estudiante/unidad/') && route.path !== '/estudiante/aprender'\"");
  });

  it('plegado, el ícono de los botones del menú («Aprender», «Mi clase») no se aplasta', () => {
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('.menu-colapsado button:not(.expandir-logo) span:not(.icono-menu):not(.siglas-clase) {');
  });
});

describe('«Aprender» (cuadro «E-Aprender»)', () => {
  const pagina = leer('pages', 'estudiante', 'aprender.vue');
  const plan = leer('components', 'estudiante', 'PlanCurso.vue');

  it('tiene los filtros «Todas», «Me faltan» y «Para repasar», marcados con aria-pressed, y «Seguir donde ibas»', () => {
    expect(pagina).toContain("{ clave: 'faltan', texto: 'Me faltan' }");
    expect(pagina).toContain("{ clave: 'repasar', texto: 'Para repasar' }");
    expect(pagina).toContain(':aria-pressed="filtro === f.clave"');
    expect(pagina).toContain('Seguir donde ibas');
    expect(plan).toContain("props.filtro === 'faltan' ? u.status !== 'dominado' : debeRepasar(u)");
  });

  it('el camino muestra el módulo elegido, y los módulos son tarjetas con su avance', () => {
    expect(pagina).toContain('<EstudianteInicioCaminoModulo v-if="modulo" :modulo-id="modulo" />');
    expect(plan).toContain(':aria-pressed="m.id === modulo"');
    expect(plan).toContain('{{ dominioDe(m.id) }} % del módulo');
  });

  it('cada lección dice su estado con texto, y un módulo cerrado dice qué lo abre', () => {
    expect(plan).toContain("const LECCION: Record<Estado, string> = { hecho: 'Dominada', empezado: 'Empezada', nada: 'Sin empezar' }");
    expect(plan).toContain('practica sus lecciones para abrirlo');
  });

  it('«Aprender» lleva a su pantalla desde el menú y desde la barra del celular', () => {
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('<NuxtLink to="/estudiante/aprender" class="item-menu tono-cielo"');
    expect(leer('components', 'layout', 'BarraInferior.vue')).toContain('<NuxtLink to="/estudiante/aprender" class="tono-cielo"');
  });

  it('las listas de lecciones van en nav: se leen como navegación y no se subrayan como enlaces de texto', () => {
    expect(plan).toContain('<nav :aria-label="`Lecciones del tema ${tema.n}`">');
    expect(leer('components', 'estudiante', 'inicio', 'CaminoModulo.vue')).toContain('<nav aria-label="Lecciones del módulo">');
  });
});

describe('La barra de arriba de la lección (cuadro «E-Leccion»)', () => {
  const s = leer('components', 'estudiante', 'SaltosLeccion.vue');
  it('«Anterior» y «Siguiente» llevan el nombre de la lección, y «Siguiente» va destacado', () => {
    expect(s).toContain('{{ nav.anterior.titulo }}');
    expect(s).toContain('{{ nav.siguiente.titulo }}');
    expect(s).toContain('class="salto-siguiente pointer-events-auto"');
    expect(s).toContain(':aria-label="`Siguiente lección: ${nav.siguiente.titulo}`"');
  });
  it('los botones miden 44 px y el «display» no pisa a «hidden» (lección de la Fase C)', () => {
    expect(s).toContain('min-height: 44px');
    expect(s).toContain('a.salto-grande, a.salto-siguiente { display: inline-flex; }');
  });
});
