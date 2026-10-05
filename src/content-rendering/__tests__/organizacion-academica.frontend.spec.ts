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

// Fase 3: «Dónde enseño / Qué estudio», el inicio del docente cuando pasan los semestres y la gamificación sobria.
describe('Fase 3 — práctico, escalable y sin abrumar', () => {
  const V = cargar<{ contextoDeVinculos: (v: Array<{ program: Prog & { institutionId?: number }; institution: Inst | null }>) => string | null }>('contextoAcademico');
  const O = cargar<{
    periodoVigente: (c: unknown[], ahora?: Date) => string | null;
    programasDeLasClases: (c: unknown[]) => Array<{ id: number; nombre: string }>;
    organizarClases: (c: unknown[], f: { texto: string; programaId: number | null; verAnteriores: boolean }, ahora?: Date) => { visibles: Array<{ id: number }>; anteriores: number; vigente: string | null };
  }>('organizarClases');
  const HOY = new Date(2026, 9, 4);
  const MATE: Prog = { id: 8, name: 'Licenciatura en Matemáticas' };
  const clase = (id: number, periodo: string | null, asignatura: Asig | null = ALGO, name = `Clase ${id}`) => ({ id, name, code: `C-${id}`, periodo, asignatura });

  it('la barra del docente sin clases con asignatura sale de sus vínculos', () => {
    expect(V.contextoDeVinculos([{ program: LIC, institution: UNICOR }])).toBe('Unicórdoba · Lic. en Informática');
    expect(V.contextoDeVinculos([{ program: LIC, institution: UNICOR }, { program: MATE, institution: UNICOR }])).toBe('Unicórdoba · 2 programas');
    expect(V.contextoDeVinculos([{ program: LIC, institution: UNICOR }, { program: MATE, institution: { id: 2, name: 'I. E. San José' } }])).toBe('2 instituciones');
    expect(V.contextoDeVinculos([])).toBeNull();
  });

  it('a la vista el periodo vigente y las clases sin periodo; los anteriores, plegados y contados', () => {
    const clases = [clase(1, '2026-2'), clase(2, '2026-1'), clase(3, '2025-2'), clase(4, null)];
    const r = O.organizarClases(clases, { texto: '', programaId: null, verAnteriores: false }, HOY);
    expect(r.vigente).toBe('2026-2');
    expect(r.visibles.map((c) => c.id)).toEqual([1, 4]);
    expect(r.anteriores).toBe(2);
    expect(O.organizarClases(clases, { texto: '', programaId: null, verAnteriores: true }, HOY).visibles.map((c) => c.id)).toEqual([1, 2, 3, 4]);
  });
  it('al buscar se busca en todo, también en lo plegado y por asignatura', () => {
    const clases = [clase(1, '2026-2'), clase(2, '2025-1', ALGO, 'Algoritmia vieja')];
    const r = O.organizarClases(clases, { texto: 'vieja', programaId: null, verAnteriores: false }, HOY);
    expect(r.visibles.map((c) => c.id)).toEqual([2]);
    expect(O.organizarClases(clases, { texto: 'fundamentos', programaId: null, verAnteriores: false }, HOY).visibles).toHaveLength(2);
  });
  it('si ninguna clase es del periodo actual, el vigente es el más reciente', () => {
    expect(O.periodoVigente([clase(1, '2025-2'), clase(2, '2025-1')], HOY)).toBe('2025-2');
    expect(O.periodoVigente([clase(1, null)], HOY)).toBeNull();
  });
  it('el filtro por programa solo existe con dos programas o más', () => {
    const mate: Asig = { id: 9, nombre: 'Cálculo', program: MATE, institution: UNICOR };
    expect(O.programasDeLasClases([clase(1, '2026-2'), clase(2, '2026-2')])).toHaveLength(1);
    const dos = [clase(1, '2026-2'), clase(2, '2026-2', mate)];
    expect(O.programasDeLasClases(dos).map((p) => p.nombre)).toEqual(['Lic. en Informática', 'Lic. en Matemáticas']);
    expect(O.organizarClases(dos, { texto: '', programaId: 8, verAnteriores: false }, HOY).visibles.map((c) => c.id)).toEqual([2]);
  });

  it('las pantallas lo usan', () => {
    for (const rol of ['docente', 'estudiante']) expect(leer('pages', rol, 'perfil.vue')).toContain('<PerfilVinculos');
    const vinc = leer('components', 'perfil', 'Vinculos.vue');
    expect(vinc).toContain("'Dónde enseño' : 'Qué estudio'");
    expect(vinc).toContain('api.del(`/users/me/affiliations/${v.id}`)');
    const index = leer('pages', 'docente', 'index.vue');
    expect(index).toContain('v-if="!isLoading && programasDelDocente.length > 1"');
    expect(index).toContain('de periodos anteriores');
  });
});

// Logros y medallas (utils/logros.ts; BT-29): privados, sin ranking, por aprendizaje real.
describe('Logros y medallas', () => {
  const L = cargar<{
    agruparLogros: (l: unknown[]) => Array<{ categoria: string; obtenidos: number; logros: Array<{ clave: string }> }>;
    ultimoLogro: (l: unknown[]) => { clave: string } | null;
    textoNuevos: (l: Array<{ titulo: string }>) => string;
    textoProgreso: (l: { progreso: { actual: number; meta: number } }) => string;
    porcentajeLogro: (l: { progreso: { actual: number; meta: number } }) => number;
  }>('logros');
  const logro = (clave: string, categoria: string, nivel: string | null, obtenido: string | null, actual = 0, meta = 3) =>
    ({ clave, categoria, titulo: clave, descripcion: '', nivel, obtenido, progreso: { actual, meta } });
  const lista = [
    logro('practica-plata', 'practica', 'plata', null, 3, 5),
    logro('constancia-bronce', 'constancia', 'bronce', '2026-10-02T15:00:00Z', 1, 1),
    logro('practica-bronce', 'practica', 'bronce', '2026-10-03T15:00:00Z', 3, 3),
    logro('modulo-7', 'dominio', null, null, 2, 4),
  ];
  it('agrupa por categoría en orden (constancia primero) y dentro, lo obtenido primero', () => {
    const g = L.agruparLogros(lista);
    expect(g.map((x) => x.categoria)).toEqual(['constancia', 'practica', 'dominio']);
    expect(g[1].logros.map((l) => l.clave)).toEqual(['practica-bronce', 'practica-plata']);
    expect(g[1].obtenidos).toBe(1);
  });
  it('la más reciente, el avance y el texto de las nuevas', () => {
    expect(L.ultimoLogro(lista)?.clave).toBe('practica-bronce');
    expect(L.textoProgreso({ progreso: { actual: 2, meta: 3 } })).toBe('2 de 3');
    expect(L.porcentajeLogro({ progreso: { actual: 2, meta: 4 } })).toBe(50);
    expect(L.porcentajeLogro({ progreso: { actual: 9, meta: 4 } })).toBe(100);
    expect(L.textoNuevos([{ titulo: 'Semana de estudio' }])).toBe('¡Nueva medalla: Semana de estudio!');
    expect(L.textoNuevos([{ titulo: 'a' }, { titulo: 'b' }])).toBe('¡2 medallas nuevas!');
  });
  it('las ganadas, la más reciente primero; y el filtro de la pantalla de logros', () => {
    const M = cargar<{ medallasGanadas: (l: unknown[]) => Array<{ clave: string }>; filtrarLogros: (l: unknown[], f: string) => Array<{ clave: string }> }>('logros');
    const l = [{ clave: 'a', obtenido: '2026-09-01' }, { clave: 'b', obtenido: null }, { clave: 'c', obtenido: '2026-10-01' }];
    expect(M.medallasGanadas(l).map((x) => x.clave)).toEqual(['c', 'a']);
    expect(M.filtrarLogros(l, 'faltan').map((x) => x.clave)).toEqual(['b']);
    expect(M.filtrarLogros(l, 'ganados').map((x) => x.clave)).toEqual(['a', 'c']);
    expect(M.filtrarLogros(l, 'todos')).toHaveLength(3);
  });
  it('el inicio celebra lo nuevo una vez y muestra una meta; «Mi progreso» solo el resumen; todas en su pantalla; sin ranking', () => {
    const inicio = leer('components', 'estudiante', 'LogrosInicio.vue');
    expect(inicio).toContain("api.post('/analytics/logros/vistos'");
    expect(inicio).toContain('datos.siguiente');
    expect(inicio).toContain('to="/estudiante/logros"');
    expect(leer('pages', 'estudiante', 'index.vue')).toContain('<EstudianteLogrosInicio />');
    // 04/10: las 26 medallas llenaban «Mi progreso»; ahora va una fila con las ganadas y la próxima meta.
    const progreso = leer('pages', 'estudiante', 'progreso.vue');
    expect(progreso).toContain('<EstudianteResumenLogros />');
    expect(progreso).not.toContain('<EstudianteMisLogros />');
    expect(leer('pages', 'estudiante', 'logros.vue')).toContain('<EstudianteMisLogros />');
    const resumen = leer('components', 'estudiante', 'ResumenLogros.vue');
    expect(resumen).toContain('ganados.value.slice(0, 8)');
    expect(resumen).toContain('v-if="!datos || datos.activos"');
    // lo que ve el estudiante (sin los comentarios del código, que explican por qué no hay ranking)
    const sinComentarios = (t: string) => t.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\/.*$/gm, '');
    for (const f of [inicio, leer('components', 'estudiante', 'MisLogros.vue')]) expect(sinComentarios(f).toLowerCase()).not.toMatch(/ranking|clasificaci[oó]n|posici[oó]n/);
  });
});

describe('Logros configurables por el docente, sin trabajo extra', () => {
  const L2 = cargar<{ categoriasElegidas: (t: string | null) => string[] }>('logros');
  it('sin elección son todas, en orden; con elección, solo esas', () => {
    expect(L2.categoriasElegidas(null)).toEqual(['constancia', 'practica', 'dominio', 'desafio', 'persistencia', 'memoria']);
    expect(L2.categoriasElegidas('memoria,dominio')).toEqual(['dominio', 'memoria']);
  });
  it('en Ajustes: un interruptor (activados por defecto) y las categorías plegadas, con al menos una', () => {
    const ajustes = leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue');
    expect(ajustes).toContain('classInfo.value?.logrosActivos ?? true');
    expect(ajustes).toContain('guardarLogros({ logrosActivos: !logrosActivos })');
    expect(ajustes).toMatch(/<details v-if="logrosActivos"/);
    expect(ajustes).toContain('categoriasLogro.length === 1 && categoriasLogro.includes(c)');
  });
  it('si ninguna clase del estudiante usa logros, no los ve', () => {
    expect(leer('components', 'estudiante', 'LogrosInicio.vue')).toContain('v-if="!datos || datos.activos"');
    expect(leer('components', 'estudiante', 'MisLogros.vue')).toContain('v-if="!datos || datos.activos"');
  });
});
