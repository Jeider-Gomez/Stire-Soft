import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// El Asistente del docente en el panel (utils/asistenteDocente.ts, composables/useAsistente.ts,
// components/docente/asistente/): propone según la pantalla, el docente decide, y lo que aplica se crea oculto y a la vista.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Pantalla = 'inicio' | 'contenido' | 'clase' | 'ejercicios' | 'otra';
const a = cargar<{
  pantallaDeRuta: (r: string, q: Record<string, unknown>) => { pantalla: Pantalla; classId: number | null; unitId: number | null };
  tareaSugerida: (p: Pantalla) => string;
  configOpcionMultiple: (e: { enunciado: string; opciones: string[]; correcta: number; porQue: string; repasar: string; dificultad: string }) => Record<string, unknown>;
  tituloDeEjercicio: (t: string, n: number) => string;
  pasosDeEstructura: (b: unknown) => string[];
  resumenBorrador: (b: unknown) => string;
  enlaceContenido: (id: number, leccion?: number, pestana?: string) => string;
}>('asistenteDocente');

describe('qué propone según dónde está el docente', () => {
  it('lee la pantalla, la clase y la lección de la dirección', () => {
    expect(a.pantallaDeRuta('/docente/contenidos', { classId: '7', unitId: '30' })).toEqual({ pantalla: 'contenido', classId: 7, unitId: 30 });
    expect(a.pantallaDeRuta('/docente/clase/9/notas', {})).toMatchObject({ pantalla: 'clase', classId: 9 });
    expect(a.pantallaDeRuta('/docente', {})).toMatchObject({ pantalla: 'inicio', classId: null });
  });
  it('en Contenido propone la lección; en Ejercicios, ejercicios; en el resto, la estructura del curso', () => {
    expect(a.tareaSugerida('contenido')).toBe('leccion');
    expect(a.tareaSugerida('ejercicios')).toBe('ejercicios');
    expect(a.tareaSugerida('inicio')).toBe('estructura');
    expect(a.tareaSugerida('clase')).toBe('estructura');
  });
  it('lo creado se ve en Contenido del curso de esa clase, y en su lección y pestaña', () => {
    expect(a.enlaceContenido(7)).toBe('/docente/contenidos?classId=7');
    expect(a.enlaceContenido(7, 12, 'actividades')).toBe('/docente/contenidos?classId=7&unitId=12&pestana=actividades');
    expect(a.enlaceContenido(7, 12, 'leccion')).toBe('/docente/contenidos?classId=7&unitId=12');
  });
});

describe('del borrador a STIRE', () => {
  const ej = { enunciado: '¿Qué imprime el ciclo? Explica.', opciones: ['1', '2', '3'], correcta: 1, porQue: 'Porque…', repasar: 'Ciclos', dificultad: 'basico' };
  it('la opción múltiple usa el formato del constructor de ejercicios', () => {
    expect(a.configOpcionMultiple(ej)).toEqual({
      options: [{ id: 'opt1', text: '1' }, { id: 'opt2', text: '2' }, { id: 'opt3', text: '3' }],
      correctAnswerId: 'opt2', isMultipleChoice: false, explanation: 'Porque…', repasar: 'Ciclos',
    });
  });
  it('el título del ejercicio es su primera frase, sin pasar de 80 caracteres', () => {
    expect(a.tituloDeEjercicio(ej.enunciado, 1)).toBe('¿Qué imprime el ciclo?');
    expect(a.tituloDeEjercicio('x'.repeat(120), 3).startsWith('Ejercicio 3:')).toBe(true);
  });
  it('los pasos que verá el docente van en orden: módulo, sus temas y sus lecciones', () => {
    const b = { tipo: 'estructura', porque: '', modulos: [{ titulo: 'Variables', descripcion: '', temas: [{ titulo: 'Tipos', lecciones: [{ titulo: 'Números', objetivo: '', dificultad: 'basico' }, { titulo: 'Texto', objetivo: '', dificultad: 'basico' }] }] }] };
    expect(a.pasosDeEstructura(b)).toEqual(['Módulo «Variables»', 'Tema «Tipos»', 'Lección «Números»', 'Lección «Texto»']);
    expect(a.resumenBorrador(b)).toBe('1 módulos · 1 temas · 2 lecciones');
  });
});

describe('el panel', () => {
  const panel = leer('components', 'docente', 'asistente', 'Panel.vue');
  const comp = leer('composables', 'useAsistente.ts');
  it('propone y el docente decide: borrador, «Aplicar en la clase», «Otra versión» y «Descartar»', () => {
    for (const t of ['Aplicar en la clase', 'Otra versión', 'Descartar']) expect(panel).toContain(t);
    expect(panel).toContain('<DocenteAsistenteBorrador v-if="borrador && !pensando"');
  });
  it('muestra paso a paso lo que va creando y lleva a Contenido del curso', () => {
    expect(panel).toContain('aria-label="Lo que el Asistente va creando"');
    expect(comp).toContain('await navigateTo(enlaceContenido(classId))');
    expect(comp).toContain("await navigateTo(enlaceContenido(classId, leccion.id, b.tipo === 'ejercicios' ? 'actividades' : 'leccion'))");
    expect(comp).toContain('window.dispatchEvent(new CustomEvent(EVENTO_CONTENIDO_CAMBIO))');
    expect(leer('pages', 'docente', 'contenidos.vue')).toContain('window.addEventListener(EVENTO_CONTENIDO_CAMBIO, recargarPorAsistente)');
  });
  it('lo que crea queda oculto: la explicación sin publicar y los ejercicios en borrador', () => {
    expect(comp).toContain("type: 'markdown', body: b.explicacion, order: 0, isVisible: false");
    expect(comp).not.toMatch(/\/publish/);
  });
  it('sin clave, explica cómo conseguirla gratis; se abre desde el encabezado o con Ctrl+.', () => {
    expect(panel).toContain('<DocenteAsistenteClave v-if="tieneClave === false" />');
    expect(leer('components', 'docente', 'asistente', 'Clave.vue')).toContain('aistudio.google.com/apikey');
    expect(panel).toContain("(e.ctrlKey || e.metaKey) && e.key === '.'");
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('id="abrir-asistente"');
    expect(leer('layouts', 'teacher.vue')).toContain('<DocenteAsistentePanel />');
  });
});

describe('el borrador del Asistente se ajusta antes de crearlo y cada cosa creada lleva a editarla (27/10)', () => {
  const u = cargar<{ moverItem: <T>(l: T[], i: number, j: number) => T[]; quitarItem: <T>(l: T[], i: number) => T[]; enlaceEjercicio: (c: number, l: number, e: number) => string }>('asistenteDocente');
  it('mover y quitar en el borrador', () => {
    expect(u.moverItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(u.moverItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
    expect(u.quitarItem(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });
  it('el enlace a un ejercicio creado abre su lección en «Actividades» con ese ejercicio', () => {
    expect(u.enlaceEjercicio(7, 12, 99)).toBe('/docente/contenidos?classId=7&unitId=12&pestana=actividades&ejercicio=99');
  });
  it('el borrador tiene subir, bajar, quitar y texto editable; los pasos hechos llevan «Abrir» o «Editar»', () => {
    const b = leer('components', 'docente', 'asistente', 'Borrador.vue');
    expect(b).toContain("@quitar=\"quitarEjercicio(i)\"");
    expect(b).toContain('@change="marcarCorrecta(i, k)"');
    const p = leer('components', 'docente', 'asistente', 'Panel.vue');
    expect(p).toContain('@cambiar="(b) => (borrador = b)"');
    expect(p).toContain("p.enlace.includes('ejercicio=') ? 'Editar' : 'Abrir'");
    expect(leer('composables', 'useAsistente.ts')).toContain("avanzar(n, 'hecho', enlaceEjercicio(classId, leccion.id, act.id))");
    expect(leer('components', 'docente', 'UnitExercisesPanel.vue')).toContain('const pedido = Number(route.query.ejercicio)');
  });
});
