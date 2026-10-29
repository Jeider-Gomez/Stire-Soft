import { readFileSync, readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Bloque A del plan para llevar la evaluación heurística a 5 (docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md), con el
// público de grado 10 a tercer semestre: lo que se mejora antes de que evalúe el equipo, sin esperar la remodelación.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

describe('Ítem 4: las palabras técnicas se explican donde aparecen', () => {
  // Cada pantalla del estudiante que habla de «dominio» lo explica ahí mismo, también en el celular (sin «title»).
  it.each([
    ['pages/estudiante/unidad/[id].vue'],
    ['pages/estudiante/index.vue'],
    ['pages/estudiante/progreso.vue'],
    ['components/estudiante/TuAvance.vue'],
    ['components/estudiante/MetaDeLaLeccion.vue'],
    ['components/exercise/SinIntentos.vue'],
  ])('%s explica «dominio» con el glosario', (archivo) => {
    expect(leer(archivo)).toMatch(/<Termino palabra="Dominio"/);
  });

  it('la pestaña de casos de prueba dice qué son, a la vista y sin jerga', () => {
    const pagina = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(pagina).toContain("{{ definicion('Casos de prueba') }}");
    expect(pagina).not.toContain('Casos públicos de verificación');
    expect(pagina).not.toContain('[▶ Probar código]');
  });
});

type D = { tipo: string; mensaje: string; linea?: number } | null;
const { diagnosticarSalida } = cargar<{ diagnosticarSalida: (e: string, o: string, i?: string) => D }>('diagnosticoSalida');

describe('Ítems 3 y 28: los errores frecuentes de JavaScript en palabras de estudiante', () => {
  it.each([
    ['TypeError: total.toFixd is not a function (línea 4)', '«total.toFixd»', 'is not a function'],
    ["ReferenceError: Cannot access 'suma' before initialization (línea 2)", 'más arriba', 'before initialization'],
    ['RangeError: Maximum call stack size exceeded', 'sin parar', 'call stack'],
    ['TypeError: numero is not iterable (línea 6)', 'no es una lista', 'iterable'],
  ])('%s', (obtenida, explica, jerga) => {
    const d = diagnosticarSalida('12', obtenida);
    expect(d?.mensaje).toContain(explica);
    expect(d?.mensaje).not.toContain(jerga);
  });

  it('un error raro avisa que el detalle viene en inglés, con la línea', () => {
    const d = diagnosticarSalida('12', 'RangeError: Invalid array length (línea 2)');
    expect(d?.mensaje).toContain('en la línea 2');
    expect(d?.mensaje).toContain('JavaScript lo dice en inglés');
  });
});

type Borrado = { deshacer: () => void };
type Opciones = { quitar: () => void; reponer: () => void; borrar: () => Promise<unknown>; alFallar?: (e: unknown) => void; programar?: (fn: () => void, ms: number) => unknown; cancelar?: (t: unknown) => void };
const { borrarConDeshacer, quitarDeLista } = cargar<{
  borrarConDeshacer: (o: Opciones) => Borrado;
  quitarDeLista: <T>(l: T[], f: (x: T) => boolean) => { quitar: () => void; reponer: () => void };
}>('borrarConDeshacer');

describe('Ítem 8: lo que se borra se puede deshacer', () => {
  // Un reloj de mentira: el borrado queda «programado» y la prueba decide cuándo pasa el tiempo.
  function reloj() {
    let fn: (() => void) | null = null;
    return { programar: (f: () => void) => { fn = f; return 1; }, cancelar: () => { fn = null; }, pasar: () => fn?.() };
  }

  it('desaparece al instante y el servidor lo borra cuando se cierra el aviso', async () => {
    const lista = ['a', 'b', 'c'];
    const r = reloj();
    const borrar = jest.fn().mockResolvedValue(undefined);
    borrarConDeshacer({ ...quitarDeLista(lista, (x) => x === 'b'), borrar, ...r });
    expect(lista).toEqual(['a', 'c']);
    expect(borrar).not.toHaveBeenCalled();
    r.pasar();
    await Promise.resolve();
    expect(borrar).toHaveBeenCalledTimes(1);
    expect(lista).toEqual(['a', 'c']);
  });

  it('«Deshacer» lo devuelve a su mismo lugar y el servidor no borra nada', () => {
    const lista = ['a', 'b', 'c'];
    const r = reloj();
    const borrar = jest.fn().mockResolvedValue(undefined);
    const { deshacer } = borrarConDeshacer({ ...quitarDeLista(lista, (x) => x === 'b'), borrar, ...r });
    deshacer();
    deshacer();
    r.pasar();
    expect(lista).toEqual(['a', 'b', 'c']);
    expect(borrar).not.toHaveBeenCalled();
  });

  it('si el servidor no pudo borrarlo, vuelve a la lista y se avisa', async () => {
    const lista = ['a', 'b'];
    const r = reloj();
    const alFallar = jest.fn();
    borrarConDeshacer({ ...quitarDeLista(lista, (x) => x === 'a'), borrar: () => Promise.reject(new Error('caído')), alFallar, ...r });
    r.pasar();
    await new Promise((ok) => setImmediate(ok));
    expect(lista).toEqual(['a', 'b']);
    expect(alFallar).toHaveBeenCalledTimes(1);
  });

  it('borrar módulos, temas, lecciones y avisos de clase ofrece «Deshacer»', () => {
    expect(leer('pages', 'docente', 'contenidos.vue')).toMatch(/borrarConDeshacer\([\s\S]*, deshacer \}\)/);
    expect(leer('composables', 'useAvisosClase.ts')).toContain('borrarConDeshacer(');
    expect(leer('components', 'mensajes', 'AvisosClase.vue')).toContain('borrado.`, deshacer })');
  });
});

const { vigilarCambios, PREGUNTA_SALIR } = cargar<{
  vigilarCambios: (d: () => unknown) => { sucio: () => boolean; guardado: () => void };
  PREGUNTA_SALIR: { titulo: string; accion: string; cancelar: string };
}>('cambiosSinGuardar');

describe('Ítem 13: salir sin guardar pregunta antes', () => {
  it('solo hay cambios si lo escrito difiere de lo que había al abrir o al último guardado', () => {
    const f = { titulo: 'Variables', cuerpo: '' };
    const { sucio, guardado } = vigilarCambios(() => ({ ...f }));
    expect(sucio()).toBe(false);
    f.cuerpo = 'let x = 1';
    expect(sucio()).toBe(true);
    guardado();
    expect(sucio()).toBe(false);
    f.cuerpo = '';
    expect(sucio()).toBe(true);
  });

  it('la pregunta deja seguir editando y no usa el cuadro del navegador para cambiar de página', () => {
    expect(PREGUNTA_SALIR.titulo).toBe('¿Salir sin guardar?');
    expect(PREGUNTA_SALIR.cancelar).toBe('Seguir editando');
    const c = leer('composables', 'useSalirSinGuardar.ts');
    expect(c).toContain('onBeforeRouteLeave(() => puedeSalir())');
    expect(c).toContain("addEventListener('beforeunload'");
    expect(c).toContain('confirmar({ ...PREGUNTA_SALIR })');
    expect(c).not.toContain('window.confirm');
  });

  it('la ventana base espera la respuesta antes de cerrarse con la X, Escape o el fondo', () => {
    expect(leer('components', 'admin', 'AdminDialogo.vue')).toContain('if (props.antesDeCerrar && !(await props.antesDeCerrar())) return');
  });

  it.each([
    ['components/docente/contenidos/VentanaEditarLeccion.vue'],
    ['components/docente/contenidos/VentanaEditarTema.vue'],
    ['components/docente/contenidos/VentanaEditarModulo.vue'],
    ['components/docente/contenidos/VentanaCrear.vue'],
    ['components/docente/ejercicios/VentanaEditarEjercicio.vue'],
  ])('%s pregunta al cerrar y al cancelar', (archivo) => {
    const v = leer(archivo);
    expect(v).toContain('useSalirSinGuardar(');
    expect(v).toContain(':antes-de-cerrar="puedeSalir"');
    expect(v).toContain('@click="cancelar"');
    expect(v).not.toMatch(/@click="\$?emit\('cerrar'\)">\s*Cancelar/);
  });

  it('el editor de la explicación y las páginas de crear ejercicio y refuerzo también preguntan', () => {
    expect(leer('components', 'docente', 'LessonEditor.vue')).toContain('if (await puedeSalir()) emit(\'cancel\')');
    // Tras guardar se toma la foto nueva, para que salir después no pregunte.
    expect(leer('pages', 'docente', 'ejercicios', 'crear.vue')).toMatch(/created\.value = \{[^\n]*\}\s*guardado\(\)/);
    expect(leer('pages', 'docente', 'refuerzos', 'nuevo.vue')).toMatch(/guardado\(\)\s*await navigateTo/);
  });

  it('el editor de ejercicios cuenta también los cambios en las respuestas', () => {
    expect(leer('components', 'docente', 'ejercicios', 'VentanaEditarEjercicio.vue')).toContain('respuestasCambiaron:');
  });
});

describe('Ítems 27 y 29: cada error se ve claro y trae una salida', () => {
  const comp = leer('components', 'MensajeError.vue');

  it('el mensaje de error lleva ícono y role="alert", no solo el color', () => {
    expect(comp).toContain('role="alert"');
    expect(comp).toMatch(/<CircleAlert[^>]*aria-hidden="true"/);
  });

  it('ofrece «Reintentar» y «Pedir ayuda al Tutor» cuando se le pasan', () => {
    expect(comp).toContain('v-if="reintentar"');
    expect(comp).toContain('Reintentar');
    expect(comp).toContain('Pedir ayuda al Tutor');
    expect(comp).toContain('openDrawer({ conPregunta: true })');
  });

  it('ya no quedan errores de una línea solo con color', () => {
    const sueltos = /<p v-(?:else-)?if="[^"]+"(?: id="[^"]+")? role="alert" class="[^"]*"(?: id="[^"]+")?>\{\{ [^}]+ \}\}<\/p>/;
    const vues: string[] = [];
    const recorrer = (dir: string) => readdirSync(dir).forEach((n) => {
      const p = path.join(dir, n);
      if (statSync(p).isDirectory()) recorrer(p); else if (p.endsWith('.vue')) vues.push(p);
    });
    ['pages', 'components', 'layouts'].forEach((d) => recorrer(path.join(raiz, d)));
    const conProblema = vues.filter((v) => sueltos.test(readFileSync(v, 'utf8'))).map((v) => path.relative(raiz, v));
    expect(conProblema).toEqual([]);
  });

  it.each([
    ['pages/estudiante/evaluacion/[activityId].vue', ':reintentar="initActivity"'],
    ['pages/estudiante/asistencia.vue', ':reintentar="cargarHistorial"'],
    ['pages/estudiante/proyectos/index.vue', ':reintentar="cargar"'],
    ['components/estudiante/EjerciciosDeLaLeccion.vue', ':reintentar="cargar"'],
    ['components/docente/UnitExercisesPanel.vue', ':reintentar="cargarYAbrir"'],
    ['components/docente/MapaDeCalor.vue', ':reintentar="cargar"'],
    ['pages/docente/entregas/[id].vue', ':reintentar="cargar"'],
  ])('%s: si no carga, se puede reintentar ahí mismo', (archivo, prop) => {
    expect(leer(archivo)).toContain(prop);
  });

  it('un caso que falla en un ejercicio de programar ofrece pedir ayuda al Tutor', () => {
    expect(leer('components', 'exercise', 'CasoPrueba.vue')).toContain('Pedir ayuda al Tutor');
  });
});

const { revisarFormatoClave } = cargar<{ revisarFormatoClave: (t: string) => string | null }>('claveGoogle');

describe('Ítem 7: activar el Tutor sin instrucciones de fuera', () => {
  it('la guía dentro de STIRE lleva los 5 pasos, el enlace y qué hacer si algo falla', () => {
    const g = leer('components', 'GuiaClaveGoogle.vue');
    expect((g.match(/titulo: '/g) ?? []).length).toBe(5);
    expect(g).toContain('Abrir Google AI Studio');
    expect(g).toContain('¿Algo no salió?');
    expect(g).toContain('18 años o más');
  });

  it('la usan el Tutor del estudiante y el Asistente del docente', () => {
    expect(leer('components', 'tutor', 'TutorKeyPanel.vue')).toContain('<GuiaClaveGoogle />');
    expect(leer('components', 'docente', 'asistente', 'Clave.vue')).toContain('<GuiaClaveGoogle />');
  });

  it.each([
    ['AIzaSyA1234567890abcdefghijklmnopqrstu', null],
    ['  AIzaSyA1234567890abcdefghijklmnopqrstu  ', null],
    ['AIza Sy123', 'espacios'],
    ['mi-proyecto-123', 'empiezan por «AIza»'],
    ['AIzaSy12345', 'incompleta'],
  ])('revisa la forma de «%s» antes de enviarla', (clave, esperado) => {
    const r = revisarFormatoClave(clave);
    if (esperado === null) expect(r).toBeNull(); else expect(r).toContain(esperado);
  });
});

describe('Ítem 31: el manual dice lo que hay hoy en el panel del docente', () => {
  const manual = leer('utils', 'manual.ts');

  it.each([['inicio-del-docente'], ['usar-la-biblioteca'], ['usar-el-asistente']])('tiene la tarea «%s»', (id) => {
    expect(manual).toContain(`id: '${id}'`);
  });

  it('usa los nombres del menú de hoy, no los viejos', () => {
    ['«Contenido del curso»', '«Estudiantes y avance»', '«Asistencia y notas»', '«Por revisar»', '«Aplicar en la clase»'].forEach((n) => expect(manual).toContain(n));
    ['«Contenidos»', '«Seguimiento»', '«Gestión de la clase»'].forEach((n) => expect(manual).not.toContain(n));
  });
});

type Evento = { tipo: string; texto?: string; message?: string; estado?: number; mensaje?: string };
const enVivo = cargar<{
  leerEventos: (a: string) => { eventos: Evento[]; resto: string };
  enviarEnVivo: (url: string, h: Record<string, string>, c: unknown, f: (t: string) => void) => Promise<Evento | null>;
}>('tutorEnVivo');

describe('Ítem 2: la respuesta del Tutor aparece a medida que llega', () => {
  const sse = (...eventos: object[]) => eventos.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
  const responder = (status: number, cuerpo: string) => {
    const bytes = new TextEncoder().encode(cuerpo);
    const body = new ReadableStream<Uint8Array>({ start(c) { for (let i = 0; i < bytes.length; i += 9) c.enqueue(bytes.slice(i, i + 9)); c.close(); } });
    return { status, ok: status >= 200 && status < 300, body, json: async () => JSON.parse(cuerpo) };
  };
  const realFetch = global.fetch;
  afterEach(() => { (global as unknown as { fetch: typeof fetch }).fetch = realFetch; });

  it('separa los eventos completos y guarda lo que llegó a medias', () => {
    const { eventos, resto } = enVivo.leerEventos('data: {"tipo":"trozo","texto":"Ho"}\n\ndata: {"tipo":"tro');
    expect(eventos).toEqual([{ tipo: 'trozo', texto: 'Ho' }]);
    expect(resto).toBe('data: {"tipo":"tro');
  });

  it('entrega cada trozo y termina con el mensaje definitivo, aunque los bytes lleguen partidos', async () => {
    (global as unknown as { fetch: unknown }).fetch = jest.fn().mockResolvedValue(responder(200, sse(
      { tipo: 'trozo', texto: '¿Qué ' }, { tipo: 'trozo', texto: 'ves?' }, { tipo: 'fin', message: '¿Qué ves?', suggestedActivity: null, guidanceLevel: 1 },
    )));
    const trozos: string[] = [];
    const fin = await enVivo.enviarEnVivo('http://api/tutor/chat/stream', { Authorization: 'Bearer x' }, { message: 'hola' }, (t) => trozos.push(t));
    expect(trozos).toEqual(['¿Qué ', 'ves?']);
    expect(fin).toMatchObject({ tipo: 'fin', message: '¿Qué ves?' });
  });

  it('si el servidor aún no tiene la ruta, avisa para volver al chat de siempre', async () => {
    (global as unknown as { fetch: unknown }).fetch = jest.fn().mockResolvedValue(responder(404, '{}'));
    await expect(enVivo.enviarEnVivo('u', {}, {}, () => undefined)).resolves.toBeNull();
  });

  it('un error del servidor llega con su código, para el mismo aviso de siempre (clave, límite…)', async () => {
    (global as unknown as { fetch: unknown }).fetch = jest.fn().mockResolvedValue(responder(429, '{"error":"Alcanzaste el límite"}'));
    await expect(enVivo.enviarEnVivo('u', {}, {}, () => undefined)).rejects.toMatchObject({ statusCode: 429, data: { error: 'Alcanzaste el límite' } });
  });

  it('el chat usa la ruta en vivo, vuelve a /tutor/chat si no está y reemplaza el texto por el definitivo', () => {
    const store = leer('stores', 'tutor.ts');
    expect(store).toContain('/tutor/chat/stream');
    expect(store).toContain("fin ?? await api.post");
    expect(store).toContain('m.text = texto || m.text');
  });
});

/** Todos los .vue de components, pages y layouts. */
function todosLosVue(): string[] {
  const vues: string[] = [];
  const recorrer = (dir: string) => readdirSync(dir).forEach((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) recorrer(p); else if (p.endsWith('.vue')) vues.push(p);
  });
  ['components', 'pages', 'layouts'].forEach((d) => recorrer(path.join(raiz, d)));
  return vues;
}

describe('Ítem 5: ningún botón es solo un ícono sin descripción', () => {
  it('todo botón sin texto visible lleva «title» (se ve al pasar el ratón)', () => {
    const sinDescripcion: string[] = [];
    for (const archivo of todosLosVue()) {
      const plantilla = readFileSync(archivo, 'utf8').split('<script')[0];
      for (const m of plantilla.matchAll(/<button\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/button>/g)) {
        const cuerpo = m[2]
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/<[A-Z]\w*\b(?:[^>"']|"[^"]*"|'[^']*')*\/>/g, '')
          .replace(/<(span|svg)[^>]*class="[^"]*sr-only[^"]*"[^>]*>[\s\S]*?<\/\1>/g, '');
        if (cuerpo.replace(/<[^>]+>/g, '').trim()) continue;
        if (!/(^|\s):?title=/.test(m[1])) sinDescripcion.push(`${path.relative(raiz, archivo)}: ${m[0].slice(0, 80)}`);
      }
    }
    expect(sinDescripcion).toEqual([]);
  });
});

describe('Ítem 11: las ventanas cierran con Escape y devuelven el foco', () => {
  const foco = cargar<{ recordarFoco: () => () => void }>('devolverFoco');

  it('el foco vuelve a lo que lo tenía al abrir, solo si sigue en la página', () => {
    jest.useFakeTimers();
    const boton = { isConnected: true, focus: jest.fn() };
    const g = global as unknown as { document?: unknown };
    const antes = g.document;
    g.document = { activeElement: boton, body: {} };
    try {
      const devolver = foco.recordarFoco();
      devolver();
      jest.runAllTimers();
      expect(boton.focus).toHaveBeenCalledTimes(1);

      boton.isConnected = false;
      foco.recordarFoco()();
      jest.runAllTimers();
      expect(boton.focus).toHaveBeenCalledTimes(1);
    } finally {
      g.document = antes;
      jest.useRealTimers();
    }
  });

  it('la ventana base devuelve el foco aunque no le digan a qué botón', () => {
    expect(leer('components', 'admin', 'AdminDialogo.vue')).toMatch(/else devolver\(\)/);
  });

  it.each([
    ['components/exercise/ResultadoEntrega.vue'],
    ['components/EscanerQrClase.vue'],
    ['components/asistencia/EscanerAsistencia.vue'],
  ])('%s cierra con Escape aunque el foco no esté dentro y devuelve el foco', (archivo) => {
    const v = leer(archivo);
    expect(v).toContain('useEscapeToClose(');
    expect(v).toContain('recordarFoco()');
  });

  it.each([['components/estudiante/IrALeccion.vue'], ['components/JuicioConfianza.vue']])('%s devuelve el foco al cerrar', (archivo) => {
    expect(leer(archivo)).toContain('devolver = recordarFoco()');
  });

  it('el resultado de una entrega pone el foco en el paso siguiente', () => {
    expect(leer('components', 'exercise', 'ResultadoEntrega.vue')).toContain("querySelector<HTMLElement>('[data-foco-inicial]')?.focus()");
  });

  it('Escape en el editor de lecciones pregunta si hay cambios sin guardar (no cierra directo)', () => {
    const panel = leer('components', 'docente', 'UnitLessonsModal.vue');
    expect(panel).toContain('else if (showForm.value) void editorRef.value?.cancelar()');
    expect(panel).not.toMatch(/else if \(showForm\.value\) cancelForm\(\)/);
    expect(leer('components', 'docente', 'LessonEditor.vue')).toContain('defineExpose({ cancelar })');
  });
});

describe('Ítem 21: en el celular, lo que el teclado hace con atajos se hace con el dedo', () => {
  it('«Probar» y «Entregar» bajan a una barra fija abajo en el celular', () => {
    expect(leer('layouts', 'workspace.vue')).toMatch(/barra-acciones fixed md:static inset-x-0 bottom-0/);
  });

  it('ir a cualquier lección: la barra de abajo abre el plan del curso, sin Ctrl+K', () => {
    const nav = leer('components', 'estudiante', 'NavegacionLeccion.vue');
    expect(nav).toContain('hojaAbierta');
    expect(nav).toContain('Cerrar el plan del curso');
  });
});
