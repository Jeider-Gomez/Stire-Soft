import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Contenido del curso como en el prototipo del panel v2 (27/10): árbol con el estado de cada lección, mapa «Para
// completar» y la lección abierta con sus pestañas, sin ventanas encima. utils/estadoCurso.ts y components/docente/contenidos/.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

interface L { id: number; title: string; isActive?: boolean; explicaciones?: number; explicacionesVisibles?: number; activities?: Array<{ status: string }> }
const e = cargar<{
  estadoDeLeccion: (l: L) => 'lista' | 'falta' | 'oculta';
  faltasDeLeccion: (l: L) => string[];
  resumenCurso: (m: unknown[]) => { unidades: number; actividades: number; conPendientes: number; ocultas: number; paraCompletar: Array<{ id: number; falta: string }>; porModulo: Array<{ lecciones: number; listas: number }> };
  rutaDeLeccion: (m: unknown[], id: number) => { modulo: string; tema: string } | null;
  conteoDeLecciones: (l: L[]) => { total: number; lista: number; falta: number; oculta: number };
  filtrarArbol: (m: unknown[], q: string) => Array<{ id: number; topics: Array<{ id: number; learningUnits: L[] }> }>;
}>('estadoCurso');

const lista: L = { id: 1, title: 'Variables', explicaciones: 1, explicacionesVisibles: 1, activities: [{ status: 'published' }] };
const sinPractica: L = { id: 2, title: 'Tipos', explicaciones: 1, explicacionesVisibles: 1, activities: [{ status: 'draft' }] };
const vacia: L = { id: 3, title: 'Ciclos', explicaciones: 0, explicacionesVisibles: 0, activities: [] };
const oculta: L = { id: 4, title: 'Vieja', isActive: false };

describe('el estado de cada lección (el punto del árbol)', () => {
  it('lista: explicación visible y al menos un ejercicio publicado', () => expect(e.estadoDeLeccion(lista)).toBe('lista'));
  it('le falta algo, y dice qué: publicar lo que está en borrador o crearlo', () => {
    expect(e.estadoDeLeccion(sinPractica)).toBe('falta');
    expect(e.faltasDeLeccion(sinPractica)).toEqual(['publicar la práctica']);
    expect(e.faltasDeLeccion(vacia)).toEqual(['explicación', 'práctica']);
    expect(e.faltasDeLeccion({ id: 5, title: 'x', explicaciones: 2, explicacionesVisibles: 0, activities: [{ status: 'published' }] })).toEqual(['publicar la explicación']);
  });
  it('oculta (archivada) manda sobre lo demás', () => expect(e.estadoDeLeccion(oculta)).toBe('oculta'));
});

describe('el mapa del curso', () => {
  const modulos = [
    { id: 10, title: 'Inicio', isPublished: true, topics: [{ id: 100, title: 'Datos', learningUnits: [lista, sinPractica] }] },
    { id: 11, title: 'Control', isPublished: false, topics: [{ id: 101, title: 'Repetir', learningUnits: [vacia, oculta] }] },
  ];
  it('cifras y «Para completar» en el orden del curso, con lo que falta a cada una', () => {
    const r = e.resumenCurso(modulos);
    expect(r).toMatchObject({ unidades: 4, actividades: 2, conPendientes: 2, ocultas: 1 });
    expect(r.paraCompletar.map((p) => p.id)).toEqual([2, 3]);
    expect(r.paraCompletar[1].falta).toBe('Falta: explicación y práctica');
    expect(r.porModulo.map((m) => `${m.listas}/${m.lecciones}`)).toEqual(['1/2', '0/2']);
  });
  it('la ruta de una lección: módulo y tema', () => {
    expect(e.rutaDeLeccion(modulos, 3)).toMatchObject({ modulo: 'Control', tema: 'Repetir' });
    expect(e.rutaDeLeccion(modulos, 99)).toBeNull();
  });
});

describe('la página', () => {
  const pagina = leer('pages', 'docente', 'contenidos.vue');
  it('árbol a la izquierda; a la derecha el mapa o la lección abierta', () => {
    expect(pagina).toContain('<DocenteContenidosArbolLateral');
    expect(pagina).toContain('<DocenteContenidosEditorUnidad v-if="leccionEnEditor"');
    expect(pagina).toContain('<DocenteContenidosMapaCurso :modulos="sections" @elegir="abrirLeccion" />');
  });
  it('la explicación se edita en la página (pestaña «Lección»), no en una ventana encima', () => {
    const editor = leer('components', 'docente', 'contenidos', 'EditorUnidad.vue');
    expect(editor).toContain('<UnitLessonsModal :unit="{ id: leccion.id, title: leccion.title }" incrustado />');
    for (const p of ["texto: 'Lección'", "texto: 'Actividades'", "texto: 'Ajustes'"]) expect(editor).toContain(p);
    const modal = leer('components', 'docente', 'UnitLessonsModal.vue');
    expect(modal).toContain('<Teleport to="body" :disabled="incrustado">');
    expect(modal).toContain(":role=\"incrustado ? undefined : 'dialog'\"");
    expect(pagina).toContain('if (!opts.create && !opts.editId) { abrirLeccion(unit.id); return }');
  });
  it('desde la lección se le puede pedir al Asistente', () => {
    expect(leer('components', 'docente', 'contenidos', 'EditorUnidad.vue')).toContain('Pedírselo al Asistente');
  });
});

describe('módulos y temas se abren y se editan en la página; el árbol se busca y se pliega', () => {
  const modulos = [
    { id: 10, title: 'Inicio', topics: [{ id: 100, title: 'Datos', learningUnits: [lista, sinPractica] }] },
    { id: 11, title: 'Control', topics: [{ id: 101, title: 'Repetición', learningUnits: [vacia, oculta] }] },
  ];
  it('el conteo de un grupo: listas, con faltas y ocultas', () => {
    expect(e.conteoDeLecciones([lista, sinPractica, vacia, oculta])).toEqual({ total: 4, lista: 1, falta: 2, oculta: 1 });
  });
  it('buscar sin tildes: el módulo o el tema que coincide queda entero; si no, solo las lecciones que coinciden', () => {
    expect(e.filtrarArbol(modulos, '').length).toBe(2);
    expect(e.filtrarArbol(modulos, 'repeticion')[0].topics[0].learningUnits.length).toBe(2);
    const r = e.filtrarArbol(modulos, 'TIPOS');
    expect(r.map((m) => m.id)).toEqual([10]);
    expect(r[0].topics[0].learningUnits.map((l) => l.id)).toEqual([2]);
    expect(e.filtrarArbol(modulos, 'nada así')).toEqual([]);
  });
  it('el árbol: nombres de módulo y tema abren su panel, buscador y «Plegar todo»', () => {
    const arbol = leer('components', 'docente', 'contenidos', 'ArbolLateral.vue');
    expect(arbol).toContain("$emit('elegir-grupo', 'modulo', m.id)");
    expect(arbol).toContain("$emit('elegir-grupo', 'tema', t.id)");
    expect(arbol).toContain('placeholder="Buscar en el curso"');
    expect(arbol).toContain("'Desplegar todo' : 'Plegar todo'");
  });
  it('el panel del grupo edita nombre y descripción sin ventana y lista sus lecciones con su estado', () => {
    const panel = leer('components', 'docente', 'contenidos', 'PanelGrupo.vue');
    expect(panel).toContain('@submit.prevent="guardar"');
    expect(panel).not.toContain('AdminDialogo');
    expect(panel).toContain('conteoDeLecciones(props.lecciones)');
    const pagina = leer('pages', 'docente', 'contenidos.vue');
    expect(pagina).toContain('<DocenteContenidosPanelGrupo v-else-if="grupoEnPanel"');
    expect(leer('composables', 'useGrupoDelCurso.ts')).toContain('estado.guardarModulo(m.id, d)');
  });
  it('los enlaces con ?unitId (Asistente, «Hoy») abren la lección en la página', () => {
    expect(leer('pages', 'docente', 'contenidos.vue')).toContain('if (qUnit) abrirLeccion(qUnit)');
  });
});
