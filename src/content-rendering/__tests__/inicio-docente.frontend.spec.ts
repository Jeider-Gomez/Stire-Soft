import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// El inicio del docente como en el prototipo del panel v2 (utils/inicioDocente.ts y components/docente/inicio/):
// saludo con el resumen, «Por revisar» de todas las clases y «Mis clases» en tarjetas o en lista.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

interface Clase { id: number; name: string; enrollmentCount?: number; atRiskCount?: number }
interface Pendiente { n: number; texto: string; clase?: string; claseId?: number; ir: string; tipo?: string }
interface Alerta { claseId: number; clase: string; bloqueados: number; errorMasRepetido: { nombre: string; estudiantes: number } | null }
const m = cargar<{
  saludo: (h: number) => string;
  primerNombre: (n: string | null | undefined) => string;
  resumenInicio: (c: Clase[]) => string;
  porRevisar: (c: Clase[], noLeidos: number | null, maximo?: number, alertas?: Alerta[]) => Pendiente[];
  vistaGuardada: (v: string | null) => 'tarjetas' | 'lista';
}>('inicioDocente');

const clases: Clase[] = [
  { id: 1, name: 'Fundamentos de Algoritmia', enrollmentCount: 30, atRiskCount: 2 },
  { id: 2, name: 'Pensamiento Algorítmico', enrollmentCount: 25, atRiskCount: 0 },
  { id: 3, name: 'Programación I', enrollmentCount: 19, atRiskCount: 5 },
];

describe('el saludo y el resumen', () => {
  it('saluda según la hora', () => {
    expect(m.saludo(7)).toBe('Buenos días');
    expect(m.saludo(15)).toBe('Buenas tardes');
    expect(m.saludo(21)).toBe('Buenas noches');
  });
  it('usa solo el primer nombre, y nada si no hay nombre', () => {
    expect(m.primerNombre('  Laura Martínez Gómez ')).toBe('Laura');
    expect(m.primerNombre(undefined)).toBe('');
  });
  it('resume en una línea lo que antes eran cuatro tarjetas', () => {
    expect(m.resumenInicio(clases)).toBe('3 clases · 74 estudiantes · 7 necesitan apoyo');
    expect(m.resumenInicio([{ id: 9, name: 'X', enrollmentCount: 1 }])).toBe('1 clase · 1 estudiante');
    expect(m.resumenInicio([])).toBe('Todavía no tienes clases.');
  });
});

describe('«Por revisar»', () => {
  it('junta todas las clases, de lo más grande a lo más pequeño, y cada cifra lleva a donde se atiende', () => {
    const r = m.porRevisar(clases, 3);
    expect(r.map((p) => p.n)).toEqual([5, 3, 2]);
    expect(r[0]).toMatchObject({ clase: 'Programación I', claseId: 3, ir: '/docente/rendimiento?classId=3', texto: 'estudiantes necesitan apoyo' });
    expect(r[1]).toMatchObject({ texto: 'mensajes sin leer', ir: '/docente/mensajes' });
    expect(r[1].clase).toBeUndefined();
  });
  it('no inventa: sin rezago ni mensajes la lista va vacía', () => {
    expect(m.porRevisar([{ id: 2, name: 'P', atRiskCount: 0 }], null)).toEqual([]);
    expect(m.porRevisar([], 0)).toEqual([]);
  });
  it('singular y máximo', () => {
    expect(m.porRevisar([{ id: 1, name: 'A', atRiskCount: 1 }], 1).map((p) => p.texto)).toEqual(['estudiante necesita apoyo', 'mensaje sin leer']);
    const muchas = Array.from({ length: 8 }, (_, i) => ({ id: i, name: `C${i}`, atRiskCount: i + 1 }));
    expect(m.porRevisar(muchas, null)).toHaveLength(5);
  });
});

describe('«Mis clases» en tarjetas o lista', () => {
  it('recuerda la vista; cualquier otro valor vuelve a tarjetas', () => {
    expect(m.vistaGuardada('lista')).toBe('lista');
    expect(m.vistaGuardada(null)).toBe('tarjetas');
    expect(m.vistaGuardada('mosaico')).toBe('tarjetas');
  });
  it('la página organiza; las tarjetas, la lista y «Por revisar» son componentes', () => {
    const p = leer('pages', 'docente', 'index.vue');
    expect(p).toContain('<DocenteInicioPorRevisar');
    expect(p).toContain('<DocenteInicioTarjetaClase');
    expect(p).toContain('<DocenteInicioListaClases');
    expect(p).toContain(':aria-pressed="vista === v"');
    expect(p).toContain('localStorage.setItem(CLAVE_VISTA_CLASES, v)');
    // color y sigla, los mismos del menú lateral
    expect(p).toContain('colorDeClase(i)');
    expect(p).toContain('siglasDeClases(classes.value)');
  });
  it('el recorrido guiado sigue encontrando «Por revisar» y las clases', () => {
    expect(leer('components', 'docente', 'inicio', 'PorRevisar.vue')).toContain('data-recorrido="rezago"');
    expect(leer('pages', 'docente', 'index.vue')).toContain('data-recorrido="clases"');
    expect(leer('pages', 'docente', 'index.vue')).toContain('id="abrir-crear-clase"');
  });
});

describe('«Por revisar» trae también las alertas de cada clase (27/10)', () => {
  const alertas: Alerta[] = [
    { claseId: 1, clase: 'Fundamentos de Algoritmia', bloqueados: 2, errorMasRepetido: { nombre: 'Confunde = con ==', estudiantes: 4 } },
    { claseId: 2, clase: 'Pensamiento Algorítmico', bloqueados: 0, errorMasRepetido: { nombre: 'Olvida inicializar', estudiantes: 1 } },
  ];
  it('quien no puede avanzar va primero; el error repetido entra si lo tienen dos o más; cada uno lleva a «Hoy» de su clase', () => {
    const r = m.porRevisar(clases, null, 6, alertas);
    expect(r[0]).toMatchObject({ n: 2, tipo: 'bloqueados', texto: 'estudiantes no pueden avanzar', ir: '/docente/clase/1#bloqueados' });
    expect(r.find((p) => p.tipo === 'error')).toMatchObject({ n: 4, texto: 'repiten el error «Confunde = con ==»', ir: '/docente/clase/1#errores' });
    expect(r.some((p) => p.texto.includes('Olvida inicializar'))).toBe(false);
  });
  it('el Inicio las carga de cada clase activa y «Hoy» tiene adónde llevar', () => {
    expect(leer('pages', 'docente', 'index.vue')).toContain('porRevisar(clasesActivas, unreadMessages, 6, alertasClases)');
    expect(leer('composables', 'useAlertasInicio.ts')).toContain('/errores-semana`).catch(() => null)');
    const hoy = leer('pages', 'docente', 'clase', '[classId]', 'index.vue');
    expect(hoy).toContain('id="bloqueados"');
    expect(hoy).toContain('<DocenteErroresSemana id="errores"');
  });
});
