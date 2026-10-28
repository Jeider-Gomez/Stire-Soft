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
  it('en Contenido propone la lección; en Ejercicios, ejercicios; en una clase, analizarla; en el resto, la estructura del curso', () => {
    expect(a.tareaSugerida('contenido')).toBe('leccion');
    expect(a.tareaSugerida('ejercicios')).toBe('ejercicios');
    expect(a.tareaSugerida('inicio')).toBe('estructura');
    expect(a.tareaSugerida('clase')).toBe('analisis');
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
    expect(comp).toContain("await navigateTo(enlaceContenido(classId, leccion.id, b.tipo === 'ejercicios' || b.tipo === 'programacion' ? 'actividades' : 'leccion'))");
    expect(comp).toContain('window.dispatchEvent(new CustomEvent(EVENTO_CONTENIDO_CAMBIO))');
    expect(leer('pages', 'docente', 'contenidos.vue')).toContain('window.addEventListener(EVENTO_CONTENIDO_CAMBIO, recargarPorAsistente)');
  });
  it('lo que crea queda oculto: la explicación sin publicar y los ejercicios en borrador', () => {
    expect(comp).toContain("type: 'markdown', body: b.explicacion, order: 0, isVisible: false");
    expect(comp).not.toMatch(/\/publish/);
  });
  it('sin clave, explica cómo conseguirla gratis; se abre desde el encabezado o con Ctrl+.', () => {
    expect(panel).toContain('<DocenteAsistenteClave v-if="tieneClave === false" />');
    expect(leer('components', 'docente', 'asistente', 'Clave.vue')).toContain('<GuiaClaveGoogle />'); // el enlace va en la guía (utils/claveGoogle.ts)
    expect(leer('utils', 'claveGoogle.ts')).toContain('aistudio.google.com/apikey');
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

describe('el Asistente escribe explicaciones alternativas y analiza la clase (27/10)', () => {
  const u = cargar<{
    resumenAnonimoClase: (d: Record<string, unknown>) => string;
    tareaSugerida: (p: string) => string;
    enlaceDeHallazgo: (a: string, c: number) => string | null;
    ORDEN_TAREAS: string[];
  }>('asistenteDocente');
  it('el resumen de la clase es anónimo: cifras por lección y errores, nunca nombres', () => {
    const r = u.resumenAnonimoClase({
      estudiantes: 30,
      bloqueados: [{ studentId: 1, fullName: 'Ana Ruiz', unitTitle: 'Ciclos' }, { studentId: 2, fullName: 'Luis Paz', unitTitle: 'Ciclos' }, { studentId: 1, fullName: 'Ana Ruiz', unitTitle: 'Ciclos' }],
      errores: [{ nombre: 'Confunde = con ==', estudiantes: [{ nombre: 'Ana Ruiz' }, { nombre: 'Luis Paz' }] }],
    });
    expect(r).toContain('Lección «Ciclos»: 2 fallan varias veces seguidas');
    expect(r).toContain('«Confunde = con ==» (2 estudiantes)');
    expect(r).not.toMatch(/Ana|Luis/);
    expect(u.resumenAnonimoClase({})).toContain('Sin alertas');
  });
  it('en una clase propone primero analizarla; los hallazgos llevan a donde se resuelven', () => {
    expect(u.tareaSugerida('clase')).toBe('analisis');
    expect(u.ORDEN_TAREAS).toEqual(['estructura', 'leccion', 'alternativa', 'ejercicios', 'programacion', 'analisis']);
    expect(u.enlaceDeHallazgo('refuerzo', 4)).toBe('/docente/clase/4#bloqueados');
    expect(u.enlaceDeHallazgo('alternativa', 4)).toBeNull();
  });
  it('la alternativa se crea oculta con su «cuando»; el análisis no crea nada', () => {
    const c = leer('composables', 'useAsistente.ts');
    expect(c).toContain("isVisible: false, cuando: b.cuando");
    expect(c).toContain("} else if (b.tipo === 'analisis') {");
    expect(leer('components', 'docente', 'asistente', 'Panel.vue')).toContain("borrador.tipo !== 'analisis'");
    expect(leer('components', 'docente', 'asistente', 'Borrador.vue')).toContain("@click=\"$emit('hacer', ACCION_HALLAZGO[h.accion].tarea!, h.leccion)\"");
  });
});

describe('ejercicios de programación del Asistente (27/10)', () => {
  const u = cargar<{ configProgramacion: (e: Record<string, unknown>) => { language: string; starterCode: string; testCases: Array<{ label: string; input: string; expected: string; isPublic: boolean }> }; ORDEN_TAREAS: string[] }>('asistenteDocente');
  it('se guarda como la pregunta de programación del constructor de STIRE, con ejemplos públicos y casos ocultos', () => {
    const c = u.configProgramacion({ inicial: 'const n = 1', casos: [{ entrada: '3', salida: '6', publico: true }, { entrada: '0', salida: '0', publico: false }, { entrada: '-7', salida: '-14', publico: false }] });
    expect(c).toMatchObject({ language: 'javascript', starterCode: 'const n = 1' });
    expect(c.testCases.map((t) => t.label)).toEqual(['Ejemplo 1', 'Caso oculto 1', 'Caso oculto 2']);
    expect(c.testCases[2]).toMatchObject({ input: '-7', expected: '-14', isPublic: false });
    expect(u.ORDEN_TAREAS).toContain('programacion');
  });
  it('se crea como pregunta «coding» con cinco intentos, y el borrador muestra los casos que calculó el juez', () => {
    const c = leer('composables', 'useAsistente.ts');
    expect(c).toContain("type: 'coding', question: e.enunciado");
    expect(c).toContain('attemptsAllowed: 5');
    expect(leer('components', 'docente', 'asistente', 'Borrador.vue')).toContain('la salida la calculó el juez con la solución');
  });
});
