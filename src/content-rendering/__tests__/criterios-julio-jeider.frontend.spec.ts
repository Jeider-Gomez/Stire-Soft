import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Revisión de Jeider de los criterios de Julio (17/10): MOD-01 (plan lateral y lecciones sin empezar) y MOD-03 (el
// resultado de una entrega, más breve).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  // Las utilidades que importan otras de ~/utils/ las reciben cargadas igual.
  const requerir = (ruta: string) => (ruta.startsWith('~/utils/') ? cargar(ruta.slice('~/utils/'.length)) : {});
  new Function('module', 'exports', 'require', js)(mod, mod.exports, requerir);
  return mod.exports as T;
}

type Modulo = { id: number; title: string; units: Array<{ id: number; title: string; status: string; empezada?: boolean }> };
const plan = cargar<{
  moduloInicial: (m: Modulo[], actual: number | null) => number | null;
  conteoModulo: (m: Modulo) => { dominadas: number; total: number };
  leccionDeLaRuta: (r: string) => number | null;
  sinEmpezarPorModulo: (m: Modulo[]) => Array<{ id: number; lecciones: Array<{ id: number }> }>;
}>('planLateral');

const modulos: Modulo[] = [
  { id: 7, title: 'Unidad 1', units: [{ id: 1, title: 'A', status: 'dominado', empezada: true }, { id: 2, title: 'B', status: 'dominado', empezada: true }] },
  { id: 8, title: 'Unidad 2', units: [{ id: 3, title: 'C', status: 'en-progreso', empezada: true }, { id: 4, title: 'D', status: 'por-iniciar' }] },
  { id: 9, title: 'Unidad 3', units: [{ id: 5, title: 'E', status: 'por-iniciar' }] },
];

describe('MOD-01: el plan del curso en la barra lateral', () => {
  it('abre solo el módulo de la lección actual; fuera de una lección, el primero con algo sin dominar', () => {
    expect(plan.moduloInicial(modulos, 5)).toBe(9);
    expect(plan.moduloInicial(modulos, null)).toBe(8);
    expect(plan.moduloInicial([], null)).toBeNull();
    expect(plan.leccionDeLaRuta('/estudiante/unidad/42')).toBe(42);
    expect(plan.leccionDeLaRuta('/estudiante/progreso')).toBeNull();
  });

  it('abrevia el nombre del módulo: el número ya lo dice «M1»', () => {
    const t = cargar<{ tituloCorto: (t: string) => string }>('planLateral').tituloCorto;
    expect(t('Unidad 1: Fundamentos de algoritmia')).toBe('Fundamentos de algoritmia');
    expect(t('Módulo 2 - Ciclos')).toBe('Ciclos');
    expect(t('Unidad 1 · Introducción a la algoritmia')).toBe('Introducción a la algoritmia');
    expect(t('Pensar antes de programar')).toBe('Pensar antes de programar');
    expect(t('Unidad 3:')).toBe('Unidad 3:');
  });

  it('cuenta las lecciones dominadas de cada módulo', () => {
    expect(plan.conteoModulo(modulos[0])).toEqual({ dominadas: 2, total: 2 });
    expect(plan.conteoModulo(modulos[1])).toEqual({ dominadas: 0, total: 2 });
  });

  it('va después de Inicio, con alto limitado, en su componente, con nombres en dos líneas y sin los ids fijos de antes', () => {
    const menu = leer('components', 'layout', 'SidebarNav.vue');
    expect(menu.indexOf('<span>Inicio</span>')).toBeLessThan(menu.indexOf('<LayoutPlanDelCurso data-recorrido="plan" />'));
    expect(menu.indexOf('<LayoutPlanDelCurso data-recorrido="plan" />')).toBeLessThan(menu.indexOf('<span>Repasos</span>'));
    // 17/10, segunda vuelta (Jeider): un solo scroll, el de la barra; nada de un scroll dentro del plan.
    expect(leer('components', 'layout', 'PlanDelCurso.vue')).not.toMatch(/overflow-y-auto|max-h-/);
    expect(menu).not.toContain('openModules');
    const p = leer('components', 'layout', 'PlanDelCurso.vue');
    expect(p).toContain('M{{ i + 1 }}');
    expect(p).toContain('{{ i + 1 }}.{{ j + 1 }}');
    expect(p).toContain(':title="mod.title"');
    expect(p).toContain(":class=\"esActual(unit.id) ? 'line-clamp-2' : 'truncate'\"");
    expect(p).toContain(':aria-expanded="moduloAbierto === mod.id"');
    expect(p).toMatch(/:aria-expanded="planAbierto"[\s\S]*?localStorage\.setItem\(CLAVE_PLAN/);
    expect(p).not.toContain("split(':')[0] }}\n");
  });
});

describe('MOD-01: «Mi progreso» también dice lo que falta empezar', () => {
  it('agrupa por módulo las lecciones sin empezar', () => {
    expect(plan.sinEmpezarPorModulo(modulos).map((g) => [g.id, g.lecciones.map((l) => l.id)])).toEqual([[8, [4]], [9, [5]]]);
  });

  it('las muestra plegadas, para no llenar la pantalla', () => {
    const p = leer('pages', 'estudiante', 'progreso.vue');
    expect(p).toMatch(/<details v-if="sinEmpezar\.length"[\s\S]*?Te faltan por empezar \{\{ totalSinEmpezar \}\}/);
  });
});

describe('MOD-03: el resultado de una entrega, breve y claro', () => {
  const r = cargar<{ dominioCorto: (a: number | null, d: number | null) => string }>('resultadoEntrega');

  it('el dominio va en una línea junto al puntaje', () => {
    expect(r.dominioCorto(62, 70)).toBe('Dominio 62 % → 70 % (+8)');
    expect(r.dominioCorto(70, 66)).toBe('Dominio 70 % → 66 % (−4)');
    expect(r.dominioCorto(70, 70)).toBe('Dominio 70 %, igual');
    expect(r.dominioCorto(null, 70)).toBe('');
  });

  it('arriba lo que enseña y el siguiente paso; los detalles quedan plegados', () => {
    const v = leer('components', 'exercise', 'ResultadoEntrega.vue');
    const detalles = v.indexOf('<details v-if="hayDetalles"');
    expect(detalles).toBeGreaterThan(v.indexOf('@click="hacer(paso.primaria)"'));
    expect(v.indexOf('{{ CUANDO_VUELVE[calidad] }}')).toBeGreaterThan(detalles);
    expect(v.indexOf('<EstudianteMetaDeLaLeccion')).toBeGreaterThan(detalles);
    expect(v.indexOf('{{ calibracion.texto }}')).toBeLessThan(detalles);
    expect(v.indexOf('{{ x.texto }}')).toBeLessThan(detalles);
  });
});

describe('UI-01: «No me quedó claro» siempre deja otros caminos, no solo el chatbot', () => {
  type Op = { tipo: string; destino: string };
  const a = cargar<{
    opcionesDeAyuda: (e: { tituloLeccion: string; sencillo: { id: number; titulo: string; nivel: string; estado: string } | null; anterior: { id: number; titulo: string } | null; hayVivo: boolean; hayRecurso: boolean }) => Op[];
    ejercicioSencillo: (e: Array<{ id: number; titulo: string; nivel: string; estado: string }>) => { id: number } | null;
    leccionAnterior: (m: Array<{ units: Array<{ id: number; title: string }> }>, id: number) => { id: number; titulo: string } | null;
    busquedaDeVideo: (t: string) => string;
  }>('ayudaLeccion');

  it('sin nada en la lección quedan tres caminos: otro video, el docente y el Tutor', () => {
    const o = a.opcionesDeAyuda({ tituloLeccion: 'Ciclos', sencillo: null, anterior: null, hayVivo: false, hayRecurso: false });
    expect(o.map((x) => x.tipo)).toEqual(['video', 'docente', 'tutor']);
  });

  it('con todo, primero aprender haciéndolo y repasar la base; el Tutor al final', () => {
    const o = a.opcionesDeAyuda({ tituloLeccion: 'Ciclos', sencillo: { id: 5, titulo: 'Contar', nivel: 'basico', estado: 'por-hacer' }, anterior: { id: 2, titulo: 'Variables' }, hayVivo: true, hayRecurso: true });
    expect(o.map((x) => x.tipo)).toEqual(['practicar', 'vivo', 'anterior', 'recurso', 'video', 'docente', 'tutor']);
    expect(o[0].destino).toBe('/estudiante/evaluacion/5');
    expect(o[2].destino).toBe('/estudiante/unidad/2');
  });

  it('el ejercicio sencillo es el de nivel más bajo que aún puede hacer; la lección anterior sigue el plan', () => {
    expect(a.ejercicioSencillo([
      { id: 1, titulo: 'A', nivel: 'intermedio', estado: 'por-hacer' },
      { id: 2, titulo: 'B', nivel: 'basico', estado: 'hecho' },
      { id: 3, titulo: 'C', nivel: 'basico', estado: 'sin-intentos' },
    ])?.id).toBe(1);
    const plan = [{ units: [{ id: 1, title: 'Uno' }] }, { units: [{ id: 2, title: 'Dos' }] }];
    expect(a.leccionAnterior(plan, 2)).toEqual({ id: 1, titulo: 'Uno' });
    expect(a.leccionAnterior(plan, 1)).toBeNull();
    expect(a.busquedaDeVideo('Ciclos for')).toBe('https://www.youtube.com/results?search_query=Ciclos%20for%20explicaci%C3%B3n');
  });

  it('el panel ya no ofrece el diagrama ni «Escuchar» de la misma lección, y el docente recibe la duda escrita', () => {
    const v = leer('components', 'ValorarLeccion.vue');
    expect(v).toContain('<li v-for="op in opciones" :key="op.tipo">');
    expect(v).not.toContain('O míralo de otra forma en esta lección');
    expect(v).toContain("query: { redactar: '1', texto: `No me quedó clara la lección");
    expect(leer('pages', 'estudiante', 'mensajes.vue')).toMatch(/if \(route\.query\.redactar !== '1'\) return/);
  });
});

describe('UI-05: el Tutor acompaña cuando el estudiante se estanca', () => {
  const o = cargar<{ ayudaSegunFallos: (n: number) => { principal: string; otras: string[] } }>('ofertaTutor');

  it('desde el tercer fallo ofrece resolverlo juntos (no lo impone) y el modo dura toda la conversación', () => {
    expect(o.ayudaSegunFallos(3)).toMatchObject({ principal: 'acompanar', otras: ['ejemplo', 'explicacion', 'pista'] });
    const t = leer('stores', 'tutor.ts');
    expect(t).toContain("const modoEnvio = modoAcompanado.value ? 'acompanado' as const");
    expect(t).toContain('watch(() => workspaceStore.currentExercise?.activityId, () => { modoAcompanado.value = false })');
    expect(leer('components', 'tutor', 'AvisoAcompanado.vue')).toContain('tutorStore.terminarAcompanamiento()');
  });

  it('cada respuesta del Tutor se puede escuchar y la pregunta se puede dictar', () => {
    const d = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(d).toContain(`<TutorPieMensaje :de-estudiante="msg.sender === 'student'"`);
    expect(d).toContain(':escrito="inputQuery" :desactivado="tutorStore.isThinking');
    expect(d).toContain('<TutorAvisoAcompanado />');
    expect(leer('components', 'tutor', 'DictarPregunta.vue')).toContain("reconocedor.lang = 'es-CO'");
  });

  it('lo que se lee no incluye el código ni las marcas, y lo dictado se suma a lo escrito', () => {
    const v = cargar<{ textoDeMensaje: (t: string) => string; unirDictado: (a: string, b: string) => string; hayVozNatural: (v: Array<{ lang: string; name?: string }>) => boolean }>('vozTutor');
    expect(v.textoDeMensaje('**Mira** esto:\n```js\nlet x = 1\n```\n- Usa `for`')).toBe('Mira esto: (te dejé un código en el chat) Usa for');
    expect(v.unirDictado('Hola', ' cómo hago un ciclo ')).toBe('Hola cómo hago un ciclo');
    expect(v.unirDictado('', 'ciclo')).toBe('ciclo');
    expect(v.hayVozNatural([{ lang: 'es-CO', name: 'Microsoft Salome Online (Natural)' }])).toBe(true);
    expect(v.hayVozNatural([{ lang: 'es-ES', name: 'Microsoft Helena' }])).toBe(false);
  });

  // Jeider, 17/10: «no he podido hablar con el chatbot con la voz». El fallo del dictado solo lo oía un lector de pantalla.
  it('si el dictado falla, la pantalla dice por qué y qué hacer', () => {
    const v = cargar<{ mensajeErrorVoz: (e: string) => string | null }>('vozTutor');
    expect(v.mensajeErrorVoz('not-allowed')).toMatch(/permiso para el micrófono/);
    expect(v.mensajeErrorVoz('network')).toMatch(/Chrome o Edge/);
    expect(v.mensajeErrorVoz('no-speech')).toMatch(/No te escuché/);
    expect(v.mensajeErrorVoz('audio-capture')).toMatch(/micrófono/);
    expect(v.mensajeErrorVoz('aborted')).toBeNull();
    const d = leer('components', 'tutor', 'DictarPregunta.vue');
    expect(d).toContain('<p v-if="error" role="alert"');
    expect(d).not.toMatch(/<p v-if="error"[^>]*sr-only/);
  });

  // Jeider, 17/10: en el celular el dictado funcionó; en el computador, ni en Chrome ni en Brave. Allí se graba y Gemini
  // lo pasa a texto con la clave del estudiante.
  it('primero el dictado del navegador; si en ese navegador no sirve, se graba y Gemini lo pasa a texto', () => {
    const v = cargar<{ modoDeVoz: (d: boolean, g: boolean, f?: boolean) => string | null; dictadoNoSirve: (e: string) => boolean }>('vozTutor');
    expect(v.modoDeVoz(true, true)).toBe('dictado');
    expect(v.modoDeVoz(true, true, true)).toBe('grabacion');
    expect(v.modoDeVoz(false, true)).toBe('grabacion');
    expect(v.modoDeVoz(true, false, true)).toBe('dictado');
    expect(v.modoDeVoz(false, false)).toBeNull();
    expect(v.dictadoNoSirve('network')).toBe(true);
    expect(v.dictadoNoSirve('not-allowed')).toBe(false);
    expect(v.dictadoNoSirve('no-speech')).toBe(false);
    const d = leer('components', 'tutor', 'DictarPregunta.vue');
    expect(d).toMatch(/dictadoNoSirve\(e\.error\) && hayGrabadora\) \{[\s\S]*?modo\.value = 'grabacion'\s*void grabar\(\)/);
    expect(leer('stores', 'tutor.ts')).toContain("api.post<{ texto: string }>('/tutor/transcribir', datos)");
  });

  it('la grabación llega al servidor como WAV de 16 kHz, el formato que acepta', () => {
    const v = cargar<{ codificarWav: (m: Float32Array, f: number) => ArrayBuffer; remuestrear: (m: Float32Array, de: number, a?: number) => Float32Array }>('vozTutor');
    const m = v.remuestrear(new Float32Array(48000).fill(0.5), 48000);
    expect(m.length).toBe(16000);
    const wav = new DataView(v.codificarWav(m, 16000));
    const txt = (i: number, n: number) => String.fromCharCode(...Array.from({ length: n }, (_, k) => wav.getUint8(i + k)));
    expect(txt(0, 4)).toBe('RIFF');
    expect(txt(8, 4)).toBe('WAVE');
    expect(wav.getUint32(24, true)).toBe(16000);
    expect(wav.byteLength).toBe(44 + 16000 * 2);
  });

  it('el campo del chat no empuja los botones: un solo botón que es micrófono sin texto y enviar con texto', () => {
    const d = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(d).toContain('class="flex-1 min-w-0');
    expect(d).toContain('<TutorDictarPregunta v-show="!inputQuery.trim() || vozActiva"');
    expect(d).toContain('v-show="inputQuery.trim() && !vozActiva"');
  });
});
