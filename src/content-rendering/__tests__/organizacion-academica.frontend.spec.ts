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

describe('Regresión 04/10: el estudiante veía «Curso libre» en Fundamentos de Algoritmia', () => {
  // GET /enrollment/my traía la asignatura sin programa ni institución (TypeORM no carga las eager anidadas por «class»).
  it('una asignatura con ids de programa o institución pero sin sus datos no se presenta como curso libre', () => {
    const incompleta = { id: 1, nombre: 'Fundamentos de Algoritmia', programId: 1, institutionId: 1 };
    expect(C.lugarDeAsignatura(incompleta)).toBe('');
    expect(C.contextoDeClase({ asignatura: incompleta })).toBe('Fundamentos de Algoritmia');
    expect(C.lugarDeAsignatura({ id: 2, nombre: 'Electiva', institutionId: 1 })).toBe('');
  });
  it('la barra del estudiante no cae en «Curso libre» si la asignatura es de un programa o institución', () => {
    const header = leer('components', 'layout', 'HeaderNav.vue');
    expect(header).toContain("(a.programId || a.institutionId ? 'Sistema tutor inteligente' : 'Curso libre')");
    expect(header).toContain('lugarDeAsignatura(studentStore.currentAsignatura)) || studentStore.currentTeacher');
  });
  it('la matrícula del estudiante pide la asignatura con su programa e institución', () => {
    const svc = readFileSync(path.join(__dirname, '..', '..', 'enrollment', 'enrollment.service.ts'), 'utf8');
    expect(svc).toContain("'class.asignatura', 'class.asignatura.program', 'class.asignatura.institution'");
  });
});

// Plantillas por asignatura y alcance (§2.3): agrupadas, con señales de calidad, sin abrumar.
interface PlantillaT {
  classId: number; nombre: string; docente: string; enfoque: string | null; alcance: string; asignatura: Asig | null;
  modulos: number; lecciones: number; ejercicios: number; vecesCopiada: number; valoracion: { utiles: number; total: number } | null; actualizada: string; cercania: number;
}
const P = cargar<{
  textoPlantilla: (p: PlantillaT) => string;
  haceCuanto: (iso: string, ahora?: Date) => string;
  senalesDePlantilla: (p: PlantillaT, ahora?: Date) => string[];
  agruparPorAsignatura: (p: PlantillaT[]) => Array<{ titulo: string; subtitulo: string; plantillas: PlantillaT[] }>;
  cuantosEnfoques: (g: { plantillas: unknown[] }) => string;
  opcionesDeAlcance: (a: Asig | null) => Array<{ valor: string; titulo: string; motivoNoDisponible: string | null }>;
}>('plantillas');

describe('Plantillas: agrupadas por asignatura, con lo que dice si sirven', () => {
  const HOY = new Date('2026-10-04T12:00:00Z');
  const base: PlantillaT = {
    classId: 3, nombre: 'Fundamentos de Algoritmia (203413)', docente: 'Laura Martínez', enfoque: 'Con JavaScript, según el plan de clase', alcance: 'asignatura',
    asignatura: ALGO, modulos: 4, lecciones: 13, ejercicios: 41, vecesCopiada: 0, valoracion: null, actualizada: '2026-10-01T12:00:00Z', cercania: 0,
  };
  const pensar = { ...base, classId: 4, nombre: 'Pensamiento algorítmico desde cero', enfoque: 'Solo pseudocódigo, sin programar', vecesCopiada: 2 };
  const ia = { ...base, classId: 9, enfoque: null, nombre: 'IA en el aula', asignatura: ELECTIVA, cercania: 4 };

  it('el texto de la lista no lleva el código de ingreso de la clase', () => {
    expect(P.textoPlantilla(base)).toBe('Con JavaScript, según el plan de clase — Laura Martínez · 4 módulos, 13 lecciones');
    expect(P.textoPlantilla(base)).not.toContain('ALGO-');
  });
  it('señales: contenido, copias, utilidad solo con 5 votos o más, actualidad', () => {
    expect(P.senalesDePlantilla(base, HOY)).toEqual(['4 módulos · 13 lecciones · 41 ejercicios', 'actualizada hace 3 días']);
    expect(P.senalesDePlantilla({ ...pensar, valoracion: { utiles: 18, total: 20 } }, HOY)).toEqual([
      '4 módulos · 13 lecciones · 41 ejercicios', 'la copiaron 2 docentes', 'a 90 % de los estudiantes le sirvió', 'actualizada hace 3 días',
    ]);
    expect(P.senalesDePlantilla({ ...base, valoracion: { utiles: 2, total: 3 } }, HOY).join()).not.toContain('%');
  });
  it('hace cuánto, en palabras', () => {
    expect(P.haceCuanto('2026-10-04T08:00:00Z', HOY)).toBe('hoy');
    expect(P.haceCuanto('2026-10-03T08:00:00Z', HOY)).toBe('ayer');
    expect(P.haceCuanto('2026-07-01T08:00:00Z', HOY)).toBe('hace 3 meses');
    expect(P.haceCuanto('2024-09-01T08:00:00Z', HOY)).toBe('hace 2 años');
  });
  it('dos plantillas de Fundamentos de Algoritmia son un grupo con 2 enfoques, antes que la electiva', () => {
    const g = P.agruparPorAsignatura([ia, base, pensar]);
    expect(g.map((x) => [x.titulo, x.plantillas.length])).toEqual([['Fundamentos de Algoritmia', 2], ['IA en la educación', 1]]);
    expect(g[0].subtitulo).toBe('3.er semestre · Lic. en Informática · Unicórdoba');
    expect(P.cuantosEnfoques(g[0])).toBe('2 enfoques');
  });
  it('«¿Con quién compartes?» usa los nombres reales y explica lo que no se puede', () => {
    const algo = P.opcionesDeAlcance({ ...ALGO, program: { ...LIC, facultad: 'Facultad de Educación y Ciencias Humanas' } as Prog });
    expect(algo.map((o) => o.titulo)).toEqual([
      'No compartir', 'Docentes de Fundamentos de Algoritmia', 'Docentes de Lic. en Informática',
      'Docentes de la Facultad de Educación y Ciencias Humanas', 'Docentes de Unicórdoba', 'Todos los docentes de STIRE',
    ]);
    expect(algo.every((o) => o.motivoNoDisponible === null)).toBe(true);
    const electiva = P.opcionesDeAlcance(ELECTIVA);
    expect(electiva.find((o) => o.valor === 'programa')!.motivoNoDisponible).toBe('Esta asignatura no es de un programa.');
    expect(electiva.find((o) => o.valor === 'institucion')!.motivoNoDisponible).toBeNull();
    const sin = P.opcionesDeAlcance(null);
    expect(sin.filter((o) => o.motivoNoDisponible).map((o) => o.valor)).toEqual(['asignatura', 'programa', 'facultad', 'institucion']);
  });
  it('las pantallas usan el agrupamiento y el alcance, y piden las plantillas para la asignatura', () => {
    const index = leer('pages', 'docente', 'index.vue');
    expect(index).toContain('<DocenteElegirPlantilla');
    expect(index).toContain('/reuse/plantillas?asignaturaId=');
    const elegir = leer('components', 'docente', 'ElegirPlantilla.vue');
    expect(elegir).toContain('Ver más plantillas');
    expect(elegir).toContain('agruparPorAsignatura(resto)');
    expect(leer('pages', 'docente', 'contenidos.vue')).toContain('v-for="g in gruposDePlantillas"');
    const ajustes = leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue');
    expect(ajustes).toContain('opcionesDeAlcance(classInfo.value?.asignatura)');
    expect(ajustes).toContain("alcancePlantilla: alcanceElegido.value");
    expect(ajustes).not.toContain('alternarPlantilla');
  });
});
