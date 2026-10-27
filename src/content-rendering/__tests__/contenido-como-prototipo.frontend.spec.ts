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
  grupoDeActividad: (t?: { code?: string; name?: string } | null) => string;
  agruparActividades: (a: Array<{ id: number; activityType?: { code?: string; name?: string } }>) => Array<{ id: string; actividades: Array<{ id: number }> }>;
  moverEnLista: (l: Array<{ id: number; order?: number }>, d: number, h: number) => { lista: Array<{ id: number; order?: number }>; cambios: Array<{ id: number; order: number }> };
  pestanaParaCompletar: (l: L) => string;
  enlaceALeccion: (c: number, u: number, p?: string) => string;
  esPestana: (p: unknown) => boolean;
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
    expect(leer('composables', 'useNavegacionContenido.ts')).toContain('const unidad = Number(q.unitId) || null');
  });
});

describe('la pestaña «Actividades» en tres grupos', () => {
  it('por el código del tipo, y si no llega, por el nombre; lo desconocido es práctica', () => {
    expect(e.grupoDeActividad({ code: 'AUTO-EVAL' })).toBe('practica');
    expect(e.grupoDeActividad({ code: 'TALLER' })).toBe('taller');
    expect(e.grupoDeActividad({ code: 'PARCIAL' })).toBe('evaluacion');
    expect(e.grupoDeActividad({ name: 'Parcial / Evaluación' })).toBe('evaluacion');
    expect(e.grupoDeActividad(null)).toBe('practica');
  });
  it('en el orden Práctica, Talleres, Evaluación, sin grupos vacíos', () => {
    const g = e.agruparActividades([{ id: 1, activityType: { code: 'PARCIAL' } }, { id: 2 }, { id: 3, activityType: { code: 'AUTO-EVAL' } }]);
    expect(g.map((x) => x.id)).toEqual(['practica', 'evaluacion']);
    expect(g[0].actividades.map((a) => a.id)).toEqual([2, 3]);
  });
  it('el panel de ejercicios los muestra agrupados', () => {
    expect(leer('components', 'docente', 'UnitExercisesPanel.vue')).toContain('agruparActividades(visibleActivities.value)');
  });
});

describe('el panel es dinámico: se reorganiza, crea sin ventanas y te lleva a cada lugar (prototipo del panel v2)', () => {
  it('mover entre hermanos renumera 1, 2, 3… y solo guarda los que cambiaron', () => {
    const lista = [{ id: 1, order: 1 }, { id: 2, order: 2 }, { id: 3, order: 3 }, { id: 4, order: 4 }];
    const r = e.moverEnLista(lista, 3, 1);
    expect(r.lista.map((x) => x.id)).toEqual([1, 4, 2, 3]);
    expect(r.cambios).toEqual([{ id: 4, order: 2 }, { id: 2, order: 3 }, { id: 3, order: 4 }]);
    expect(e.moverEnLista(lista, 0, 0).cambios).toEqual([]);
    expect(e.moverEnLista(lista, 0, 9).cambios).toEqual([]);
  });
  it('«Para completar» lleva a la pestaña justa: la explicación si falta, si no la práctica', () => {
    expect(e.pestanaParaCompletar(vacia)).toBe('leccion');
    expect(e.pestanaParaCompletar(sinPractica)).toBe('actividades');
    expect(e.resumenCurso([{ id: 1, title: 'M', topics: [{ id: 2, title: 'T', learningUnits: [sinPractica] }] }]).paraCompletar[0]).toMatchObject({ pestana: 'actividades' });
  });
  it('el enlace a una lección desde cualquier panel lleva la pestaña; la dirección guarda lo abierto', () => {
    expect(e.enlaceALeccion(7, 12, 'actividades')).toBe('/docente/contenidos?classId=7&unitId=12&pestana=actividades');
    expect(e.enlaceALeccion(7, 12)).toBe('/docente/contenidos?classId=7&unitId=12');
    expect(e.esPestana('ajustes')).toBe(true);
    expect(e.esPestana('otra')).toBe(false);
    const nav = leer('composables', 'useNavegacionContenido.ts');
    expect(nav).toContain("watch(() => route.fullPath, leerRuta, { immediate: true })");
    expect(nav).toContain('router.replace(destino)');
  });
  it('el árbol se reorganiza arrastrando o con Alt+↑/↓, solo entre hermanos', () => {
    const arbol = leer('components', 'docente', 'contenidos', 'ArbolLateral.vue');
    expect(arbol).toContain("v-bind=\"arrastre('leccion', t.id, il)\"");
    expect(arbol).toContain("@keydown.alt.up.prevent=\"teclado('tema', m.id, it, -1)\"");
    expect(arbol).toContain('mismoGrupo(nivel, padre)');
  });
  it('el panel de un módulo o un tema lista sus hijos en orden, con subir, bajar y arrastrar', () => {
    const panel = leer('components', 'docente', 'contenidos', 'PanelGrupo.vue');
    expect(panel).toContain("'Temas, en orden' : 'Lecciones, en orden'");
    expect(panel).toContain("@click=\"$emit('mover', i, i - 1)\"");
    expect(panel).toContain('@drop.prevent="soltar(i)"');
  });
  it('crear sin ventana: nace con un nombre provisional y se abre para nombrarlo; el nombre de la lección se edita en su cabecera', () => {
    const org = leer('composables', 'useOrganizarCurso.ts');
    expect(org).toContain("title: 'Nueva lección'");
    expect(leer('pages', 'docente', 'contenidos.vue')).toContain("@nuevo-modulo=\"crearYAbrir('modulo', null)\"");
    const editor = leer('components', 'docente', 'contenidos', 'EditorUnidad.vue');
    expect(editor).toContain('@blur="renombrar"');
    expect(editor).toContain("@click=\"$emit('ir-grupo', 'tema', ruta.temaId)\"");
  });
});

describe('«Ver como estudiante» y el árbol en el celular', () => {
  it('la vista del estudiante usa el mismo componente que su lección y solo muestra lo visible y lo publicado', () => {
    const v = leer('components', 'docente', 'contenidos', 'VistaEstudiante.vue');
    expect(v).toContain('<ContenidoLeccion :texto="x.body ?? \'\'" :insertados="insertadosDe(x.metadata)"');
    expect(v).toContain("x.isVisible !== false");
    expect(v).toContain("a.status === 'published'");
    expect(leer('components', 'docente', 'contenidos', 'EditorUnidad.vue')).toContain("'Volver a editar' : 'Ver como estudiante'");
  });
  it('en el celular el árbol es una hoja que sube desde abajo y se cierra al elegir', () => {
    const p = leer('pages', 'docente', 'contenidos.vue');
    expect(p).toContain('fixed inset-x-0 bottom-0 z-50 max-h-[75vh]');
    expect(p).toContain('watch(() => route.fullPath, () => { arbolMovil.value = false })');
  });
});

describe('el manual cuenta el panel nuevo (PD-13)', () => {
  const m = leer('utils', 'manual.ts');
  it('crear desde el árbol, reordenar, «Ver como estudiante», «A borrador» y «Corregir» un aviso', () => {
    for (const t of ['«+ Módulo», «+ Tema» o «+ Lección»', 'arrastra en el árbol', '«Ver como estudiante»', '«A borrador»', 'toca «Corregir» en el aviso']) expect(m).toContain(t);
  });
});

describe('duplicar un tema, mover una lección a otro tema y módulos siempre abiertos (27/10)', () => {
  const js = ts.transpileModule(leer('utils', 'bloqueoModulos.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  const b = mod.exports as { estadoDeModulos: (m: unknown[], u: number) => Array<{ abierto: boolean }> };
  it('un módulo siempre abierto no espera el dominio del anterior', () => {
    const modulos = [
      { id: 1, titulo: 'A', lecciones: [{ dominio: 10, empezada: true }] },
      { id: 2, titulo: 'B', lecciones: [{ dominio: 0, empezada: false }] },
      { id: 3, titulo: 'Proyecto', abiertoSiempre: true, lecciones: [{ dominio: 0, empezada: false }] },
    ];
    expect(b.estadoDeModulos(modulos, 50).map((e) => e.abierto)).toEqual([true, false, true]);
    expect(leer('stores', 'student.ts')).toContain('abiertoSiempre: !!sec.abiertoSiempre');
  });
  it('el panel del tema lo duplica y el del módulo lo deja siempre abierto; la lección se mueve desde Ajustes', () => {
    const panel = leer('components', 'docente', 'contenidos', 'PanelGrupo.vue');
    expect(panel).toContain("@click=\"$emit('duplicar')\"");
    expect(panel).toContain("@change=\"$emit('alternar-abierto')\"");
    const org = leer('composables', 'useOrganizarCurso.ts');
    expect(org).toContain('/reuse/topics/${temaId}/duplicar');
    expect(org).toContain('/learning-unit/${leccionId}/mover');
    expect(org).toContain('{ abiertoSiempre: nuevo }');
    expect(leer('components', 'docente', 'contenidos', 'EditorUnidad.vue')).toContain('Mover a otro tema');
  });
});
