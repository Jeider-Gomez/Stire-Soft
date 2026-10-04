import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Organización académica (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): la clase dice para qué asignatura, programa y
// semestre es, y la barra superior lo toma de los datos. Se prueban los archivos reales de frontend-nuxt.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (r: string) => cargar(r.replace(/^\.\//, '')));
  return mod.exports as T;
}

interface Inst { id: number; name: string; sigla?: string | null }
interface Prog { id: number; name: string; tipo?: 'carrera' | 'grado' }
interface Asig { id: number; nombre: string; periodoPlan?: number | null; programId?: number | null; program?: Prog | null; institution?: Inst | null }
const C = cargar<{
  ordinal: (n: number) => string;
  periodoDelPlan: (n: number, tipo?: 'carrera' | 'grado') => string;
  programaCorto: (n: string) => string;
  lugarDeAsignatura: (a: Asig) => string;
  contextoDeClase: (c: { asignatura?: Asig | null } | null) => string | null;
  contextoDocente: (c: Array<{ asignatura?: Asig | null }>) => string | null;
  periodoActual: (f?: Date) => string;
  nombreSugerido: (a: string, g?: string, p?: string) => string;
}>('contextoAcademico');

const UNICOR: Inst = { id: 1, name: 'Universidad de Córdoba', sigla: 'Unicórdoba' };
const LIC: Prog = { id: 7, name: 'Licenciatura en Informática', tipo: 'carrera' };
const ALGO: Asig = { id: 3, nombre: 'Fundamentos de Algoritmia', periodoPlan: 3, programId: 7, program: LIC, institution: UNICOR };
const ELECTIVA: Asig = { id: 4, nombre: 'IA en la educación', program: null, institution: UNICOR };
const LIBRE: Asig = { id: 5, nombre: 'Taller de robótica', program: null, institution: null };

describe('contextoAcademico — cómo se nombra dónde va una clase', () => {
  it('ordinales en español: 1.er, 2.°, 3.er, 4.°', () => {
    expect([1, 2, 3, 4, 10].map(C.ordinal)).toEqual(['1.er', '2.°', '3.er', '4.°', '10.°']);
  });
  it('semestre en una carrera, grado en un colegio', () => {
    expect(C.periodoDelPlan(3)).toBe('3.er semestre');
    expect(C.periodoDelPlan(8, 'grado')).toBe('8.° grado');
  });
  it('las tres formas de una asignatura: de un programa, electiva de una institución, curso libre', () => {
    expect(C.lugarDeAsignatura(ALGO)).toBe('3.er semestre · Lic. en Informática');
    expect(C.lugarDeAsignatura(ELECTIVA)).toBe('Electiva · Unicórdoba');
    expect(C.lugarDeAsignatura(LIBRE)).toBe('Curso libre');
    expect(C.lugarDeAsignatura({ ...ALGO, periodoPlan: null })).toBe('Lic. en Informática');
  });
  it('una clase sin asignatura no tiene contexto: no se inventa', () => {
    expect(C.contextoDeClase({ asignatura: ALGO })).toBe('Fundamentos de Algoritmia · 3.er semestre · Lic. en Informática');
    expect(C.contextoDeClase({ asignatura: null })).toBeNull();
    expect(C.contextoDeClase(null)).toBeNull();
  });
  it('el docente: un programa, varios programas, varias instituciones, solo cursos libres o nada', () => {
    expect(C.contextoDocente([{ asignatura: ALGO }, { asignatura: null }])).toBe('Unicórdoba · Lic. en Informática');
    const otro = { ...ALGO, id: 9, program: { id: 8, name: 'Licenciatura en Matemáticas' } };
    expect(C.contextoDocente([{ asignatura: ALGO }, { asignatura: otro }])).toBe('Unicórdoba · 2 programas');
    expect(C.contextoDocente([{ asignatura: ALGO }, { asignatura: { ...ELECTIVA, institution: { id: 2, name: 'I. E. San José' } } }])).toBe('2 instituciones');
    expect(C.contextoDocente([{ asignatura: ELECTIVA }])).toBe('Unicórdoba');
    expect(C.contextoDocente([{ asignatura: LIBRE }])).toBe('Cursos libres');
    expect(C.contextoDocente([{ asignatura: null }])).toBeNull();
  });
  it('periodo académico: enero a junio es 1, julio a diciembre es 2', () => {
    expect(C.periodoActual(new Date(2026, 9, 4))).toBe('2026-2');
    expect(C.periodoActual(new Date(2026, 5, 30))).toBe('2026-1');
  });
  it('nombre sugerido con grupo y periodo, solo los que haya', () => {
    expect(C.nombreSugerido('Fundamentos de Algoritmia', 'Grupo 2', '2026-2')).toBe('Fundamentos de Algoritmia — Grupo 2 · 2026-2');
    expect(C.nombreSugerido('Fundamentos de Algoritmia', '', '2026-2')).toBe('Fundamentos de Algoritmia — 2026-2');
    expect(C.nombreSugerido('Fundamentos de Algoritmia')).toBe('Fundamentos de Algoritmia');
  });
});

describe('La barra superior y los formularios usan los datos, no texto fijo', () => {
  const header = leer('components', 'layout', 'HeaderNav.vue');
  it('el encabezado no nombra ningún programa ni facultad fijos', () => {
    expect(header).not.toMatch(/Ing\. Sistemas|Ingeniería de Sistemas|Licenciatura en Informática|Lic\. en Informática|Facultad de/);
    expect(header).toContain('useContextoDocente()');
    expect(header).toContain('studentStore.currentAsignatura');
  });
  it('crear una clase y sus ajustes permiten elegir asignatura, grupo y periodo', () => {
    for (const f of [leer('pages', 'docente', 'index.vue'), leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue')]) {
      expect(f).toContain('<DocenteSelectorAsignatura v-model=');
      expect(f).toMatch(/grupo/);
      expect(f).toMatch(/periodo/);
    }
  });
  it('el selector ofrece las tres formas y crear institución o programa (un colegio por grados)', () => {
    const sel = leer('components', 'docente', 'SelectorAsignatura.vue');
    expect(sel).toContain("valor: 'programa'");
    expect(sel).toContain("valor: 'institucion'");
    expect(sel).toContain("valor: 'libre'");
    expect(sel).toContain("api.post<InstitucionInfo>('/institutions'");
    expect(sel).toContain("api.post<ProgramaInfo>('/programs'");
    expect(sel).toContain('role="combobox"');
  });
});

describe('Orden del catálogo (§2.2.1 y §2.2.2): sin duplicados y sin trabajo manual para el admin', () => {
  const sel = leer('components', 'docente', 'SelectorAsignatura.vue');
  it('antes de agregar pregunta «¿Es alguna de estas?» y deja usar la existente o agregar igual', () => {
    expect(sel).toContain('/asignaturas/parecidas?');
    expect(sel).toContain('¿Es alguna de estas?');
    expect(sel).toContain('@click="usarParecida(a)"');
    expect(sel).toContain('No, es otra: agregarla');
    // la pregunta va antes de crear: si hay parecidas, no se crea nada todavía
    expect(sel.indexOf('/asignaturas/parecidas?')).toBeLessThan(sel.indexOf("api.post<AsignaturaInfo>('/asignaturas'"));
  });
  it('las oficiales se marcan en la búsqueda', () => {
    expect(sel).toMatch(/v-if="a\.oficial"[^>]*>[\s\S]{0,80}Oficial/);
  });
  it('el admin tiene «Catálogo académico»: unir (con confirmación), son distintas y confirmar como oficial', () => {
    const cat = leer('pages', 'admin', 'catalogo.vue');
    expect(cat).toContain("api.get<Revision>('/asignaturas/revision')");
    expect(cat).toMatch(/await confirmar\(\{[\s\S]*accion: 'Unir'/);
    expect(cat).toContain('/unir`, { destinoId: destino.id }');
    expect(cat).toContain("api.post('/asignaturas/distintas'");
    expect(cat).toContain('{ oficial: true }');
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('to="/admin/catalogo"');
  });
});
