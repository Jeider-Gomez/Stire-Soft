import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Proyectos corre en el navegador (docs/DISENO_PROYECTOS.md): se prueban las funciones reales de frontend-nuxt/utils.
function cargar<T>(archivo: string): T {
  const file = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', archivo);
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  // Un util puede importar otro (`~/utils/pseudocodigo`): se carga igual, con el mismo transpilado.
  const requerir = (ruta: string) => cargar(ruta.replace(/^~\/utils\//, '') + '.ts');
  new Function('module', 'exports', 'require', js)(mod, mod.exports, requerir);
  return mod.exports as T;
}

const { crc32, crearZip } = cargar<{ crc32: (d: Uint8Array) => number; crearZip: (a: Array<{ nombre: string; contenido: string }>) => Uint8Array }>('zip.ts');
const { fuenteDelWorker, documentoWeb } = cargar<{ fuenteDelWorker: (c: string, e: string) => string; documentoWeb: (a: Array<{ nombre: string; contenido: string }>, c?: boolean, o?: { pagina?: string; almacen?: Record<string, string>; ancla?: string }) => string }>('proyectoNavegador.ts');

describe('zip: descargar el proyecto', () => {
  it('CRC-32 con el vector de prueba estándar («123456789» → cbf43926)', () => {
    expect(crc32(new TextEncoder().encode('123456789')).toString(16)).toBe('cbf43926');
  });

  it('el .zip tiene una entrada por archivo, con su nombre y su contenido tal cual', () => {
    const zip = Buffer.from(crearZip([{ nombre: 'index.html', contenido: '<h1>Hola ñ</h1>' }, { nombre: 'script.js', contenido: 'console.log(1)' }]));
    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    const fin = zip.length - 22;
    expect(zip.readUInt32LE(fin)).toBe(0x06054b50);
    expect(zip.readUInt16LE(fin + 10)).toBe(2);
    const tam = zip.readUInt32LE(18);
    const largoNombre = zip.readUInt16LE(26);
    expect(zip.subarray(30, 30 + largoNombre).toString('utf8')).toBe('index.html');
    expect(zip.subarray(30 + largoNombre, 30 + largoNombre + tam).toString('utf8')).toBe('<h1>Hola ñ</h1>');
    expect(zip.readUInt32LE(14)).toBe(crc32(new TextEncoder().encode('<h1>Hola ñ</h1>')));
  });
});

describe('JavaScript en el navegador (Worker)', () => {
  function correr(codigo: string, entrada = '') {
    const mensajes: Array<{ tipo: string; texto?: string }> = [];
    const self = { postMessage: (m: { tipo: string; texto?: string }) => mensajes.push(m) };
    new Function('self', fuenteDelWorker(codigo, entrada))(self);
    return mensajes;
  }

  it('console.log llega como líneas y al final avisa «fin»', () => {
    expect(correr('console.log("hola", 2); console.log({ a: 1 })')).toEqual([
      { tipo: 'log', texto: 'hola 2' }, { tipo: 'log', texto: '{"a":1}' }, { tipo: 'fin' },
    ]);
  });

  it('la entrada se lee con leerEntrada() o con el estilo de los ejercicios (fs.readFileSync(0))', () => {
    expect(correr('console.log(leerEntrada())', '4 5')[0]).toEqual({ tipo: 'log', texto: '4 5' });
    expect(correr('const fs = require("fs"); const [a,b] = fs.readFileSync(0,"utf8").split(" ").map(Number); console.log(a+b)', '4 5')[0]).toEqual({ tipo: 'log', texto: '9' });
  });

  it('un error se informa con su tipo y la ejecución termina', () => {
    expect(correr('null.x')).toEqual([{ tipo: 'error', texto: expect.stringContaining('TypeError') }, { tipo: 'fin' }]);
    expect(correr('require("child_process")')[0].texto).toContain('solo está disponible el módulo fs');
  });

  it('la entrada no puede romper el código que la rodea (se inserta como texto JSON)', () => {
    expect(correr('console.log(leerEntrada())', '"); self.postMessage({tipo:"hackeo"}); ("')[0].texto).toContain('hackeo');
    expect(correr('console.log(leerEntrada())', '"); self.postMessage({tipo:"hackeo"}); ("').some((m) => m.tipo === 'hackeo')).toBe(false);
  });
});

describe('Entregas (docs/DISENO_INTERVENCION_DOCENTE.md §3)', () => {
  const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
  const leer = (archivo: string) => readFileSync(path.join(raiz, archivo), 'utf8');

  it('el nombre de la descarga no lleva tildes ni caracteres raros', () => {
    const file = path.join(raiz, 'utils', 'descargaProyecto.ts');
    const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const mod = { exports: {} as Record<string, unknown> };
    new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
    const nombreDeArchivo = mod.exports.nombreDeArchivo as (t: string) => string;
    expect(nombreDeArchivo('Luisa Rojas Calculadora v2')).toBe('Luisa-Rojas-Calculadora-v2');
    expect(nombreDeArchivo('Diseño: ¿página?')).toBe('Diseno-pagina');
    expect(nombreDeArchivo('¿¿??')).toBe('proyecto');
  });

  it('el docente ve el código en solo lectura y la vista previa en el mismo iframe aislado que el estudiante', () => {
    const revision = leer('pages/docente/entregas/revision/[envioId].vue');
    expect(revision).toMatch(/<CodeEditor[^>]*read-only/);
    expect(revision).toContain('<ProyectosResultadoProyecto');
    const resultado = leer('components/proyectos/ResultadoProyecto.vue');
    expect(resultado).toContain('sandbox="allow-scripts allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox"');
    expect(resultado).not.toMatch(/sandbox="[^"]*allow-same-origin/);
    expect(resultado).toContain('e.source !== vistaRef.value?.contentWindow');
  });

  it('el estudiante envía desde su editor, y solo cuando sus cambios ya están guardados', () => {
    expect(leer('pages/estudiante/proyectos/[id].vue')).toContain(`<ProyectosEnviarAlDocente :proyecto-id="proyecto.id" :puede-enviar="estadoGuardado === 'guardado'" />`);
  });

  it('el docente llega desde la pestaña «Entregas» de su clase', () => {
    expect(leer('utils/pestanasClase.ts')).toContain("case 'entregas': return `/docente/entregas?clase=${classId}`");
  });

  it('en la revisión, el comentario va antes que la nota, y la nota solo aparece si la entrega lleva nota', () => {
    const revision = leer('pages/docente/entregas/revision/[envioId].vue');
    expect(revision.indexOf('id="revision-comentario"')).toBeLessThan(revision.indexOf('id="revision-nota"'));
    expect(revision).toMatch(/<div v-if="envio\.entrega\?\.conNota"/);
    expect(revision).toContain('Siguiente sin revisar');
    expect(revision).toContain('textoEvento(h)');
  });

  it('el estudiante ve el comentario antes que la nota en cada versión', () => {
    const pagina = leer('pages/estudiante/entregas/[id].vue');
    expect(pagina.indexOf('v.comentario }}')).toBeLessThan(pagina.indexOf('notaTexto(v.nota)'));
  });

  it('el formulario del docente: 3 versiones por defecto, sin nota por defecto y lección opcional', () => {
    const form = leer('components/docente/EntregaForm.vue');
    expect(form).toContain('maxVersiones: i?.maxVersiones ?? 3');
    expect(form).toContain('conNota: i?.conNota ?? false');
    expect(form).toContain('<option :value="null">Ninguna: es una entrega de la materia</option>');
  });
});

describe('Historial de una entrega en palabras', () => {
  const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
  const mod = { exports: cargar<Record<string, unknown>>('entregas.ts') };
  const { textoEvento, notaTexto } = mod.exports as { textoEvento: (e: { tipo: string; detalle: Record<string, unknown> | null }) => string; notaTexto: (n: number | null) => string };

  it('cada evento se lee como una frase, con la nota en coma decimal', () => {
    expect(textoEvento({ tipo: 'enviada', detalle: { version: 2, tarde: true } })).toBe('Versión 2 enviada (tarde)');
    expect(textoEvento({ tipo: 'nota_cambiada', detalle: { antes: 4, despues: 4.5 } })).toBe('Nota cambiada: 4,0 → 4,5');
    expect(textoEvento({ tipo: 'revisada', detalle: { nota: null, comentario: 'Bien' } })).toBe('Revisada con comentario');
    expect(textoEvento({ tipo: 'reabierta', detalle: null })).toBe('El docente dio una versión más');
    expect(notaTexto(null)).toBe('');
  });
});

describe('Código inicial de una entrega', () => {
  const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
  const mod = { exports: cargar<Record<string, unknown>>('entregas.ts') };
  const { codigoInicialPorDefecto, lenguajeDeArchivo } = mod.exports as {
    codigoInicialPorDefecto: (t: string) => Array<{ nombre: string; contenido: string }>;
    lenguajeDeArchivo: (n: string) => string;
  };

  it('propone los mismos archivos que un proyecto nuevo de ese tipo, con el editor del lenguaje de cada uno', () => {
    expect(codigoInicialPorDefecto('web').map((a) => a.nombre)).toEqual(['index.html', 'estilos.css', 'script.js']);
    expect(codigoInicialPorDefecto('javascript').map((a) => a.nombre)).toEqual(['main.js']);
    expect(codigoInicialPorDefecto('javascript')[0].contenido).toContain('leerEntrada()');
    expect(['index.html', 'estilos.css', 'script.js', 'notas.txt'].map(lenguajeDeArchivo)).toEqual(['html', 'css', 'javascript', 'text']);
    // Pseudocódigo (fase 4): un algoritmo.psc con el ejemplo, en el editor con colores de pseudocódigo.
    expect(codigoInicialPorDefecto('pseudocodigo')).toEqual([{ nombre: 'algoritmo.psc', contenido: expect.stringMatching(/^Algoritmo MiAlgoritmo\n/) }]);
    expect(lenguajeDeArchivo('algoritmo.psc')).toBe('pseudocodigo');
  });

  it('el docente lo activa en el formulario (solo web o JavaScript) y se manda como plantilla; sin activarlo va null', () => {
    const form = readFileSync(path.join(raiz, 'components', 'docente', 'EntregaForm.vue'), 'utf8');
    expect(form).toContain(`<fieldset v-if="f.tipoProyecto !== 'cualquiera'" class="space-y-2">`);
    expect(form).toContain("plantilla: usarCodigoInicial.value && f.tipoProyecto !== 'cualquiera' ? codigoInicial.value : null,");
  });
});

describe('Página web: un solo documento para la vista previa y la descarga', () => {
  const archivos = [
    { nombre: 'index.html', contenido: '<html><head><title>T</title></head><body><h1>Hola</h1></body></html>' },
    { nombre: 'estilos.css', contenido: 'h1 { color: red }' },
    { nombre: 'script.js', contenido: 'document.title = "</script><b>x</b>"' },
  ];

  it('el CSS va en <head> y el JS al final de <body>', () => {
    const doc = documentoWeb(archivos);
    expect(doc.indexOf('h1 { color: red }')).toBeLessThan(doc.indexOf('</head>'));
    expect(doc.indexOf('document.title')).toBeGreaterThan(doc.indexOf('<h1>Hola</h1>'));
  });

  it('un «</script>» dentro del código no cierra la etiqueta antes de tiempo', () => {
    const doc = documentoWeb(archivos);
    expect(doc).toContain('<\\/script><b>x</b>');
  });

  it('la consola solo se engancha en la vista previa, no en la descarga', () => {
    expect(documentoWeb(archivos, true)).toContain('stireProyecto');
    expect(documentoWeb(archivos, false)).not.toContain('stireProyecto');
  });
});

// Lo que antes fallaba en la vista previa (aislada): enlaces entre páginas, localStorage y formularios.
describe('Vista previa de un sitio de varias páginas (un OVA)', () => {
  const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
  const sitio = [
    { nombre: 'index.html', contenido: '<html><head><link rel="stylesheet" href="./estilos.css"><script src="menu.js" defer></script></head><body><h1>Inicio</h1><a href="tema1.html#parte2">Tema 1</a><script src="index.js"></script></body></html>' },
    { nombre: 'tema1.html', contenido: '<html><head><link rel="stylesheet" href="estilos.css"></head><body><h1>Tema 1</h1></body></html>' },
    { nombre: 'estilos.css', contenido: 'h1 { color: green }' },
    { nombre: 'menu.js', contenido: 'console.log("menu")' },
    { nombre: 'index.js', contenido: 'console.log("index")' },
    { nombre: 'tema1.js', contenido: 'console.log("solo del tema")' },
  ];

  it('cada <link> y <script src> del proyecto se reemplaza por su archivo, en su lugar; defer va al final', () => {
    const doc = documentoWeb(sitio);
    expect(doc).not.toMatch(/<link[^>]*estilos\.css/);
    expect(doc.indexOf('h1 { color: green }')).toBeLessThan(doc.indexOf('</head>'));
    expect(doc.indexOf('console.log("index")')).toBeLessThan(doc.indexOf('console.log("menu")'));
    expect(doc.indexOf('console.log("menu")')).toBeGreaterThan(doc.indexOf('<h1>Inicio</h1>'));
    // La página ya nombra sus scripts: no se le meten los demás (tema1.js no corre en el inicio).
    expect(doc).not.toContain('solo del tema');
  });

  it('se puede pedir otra página; una que no nombra scripts recibe todos, como antes', () => {
    const tema = documentoWeb(sitio, false, { pagina: './Tema1.html' });
    expect(tema).toContain('<h1>Tema 1</h1>');
    expect(tema).toContain('solo del tema');
  });

  it('el arranque va antes que cualquier script del estudiante y repone localStorage, los enlaces y los formularios', () => {
    const doc = documentoWeb(sitio, true, { almacen: { visitas: '3' }, ancla: 'parte2' });
    const arranque = doc.indexOf('stireProyecto');
    expect(arranque).toBeGreaterThan(-1);
    expect(arranque).toBeLessThan(doc.indexOf('h1 { color: green }'));
    expect(doc).toContain("Object.defineProperty(window,'localStorage'");
    expect(doc).toContain('var datos={"visitas":"3"}');
    expect(doc).toContain("tipo:'navegar'");
    expect(doc).toContain("window.addEventListener('submit'");
    expect(doc).toContain('var ancla="parte2"');
  });

  it('el arranque es JavaScript válido (un escape mal hecho en la plantilla lo rompía entero)', () => {
    const doc = documentoWeb(sitio, true);
    const i = doc.indexOf('<script>(function(){');
    const codigo = doc.slice(i + '<script>'.length, doc.indexOf('</script>', i));
    expect(() => new Function(codigo)).not.toThrow();
  });

  it('lo guardado no puede cerrar el <script> del arranque', () => {
    expect(documentoWeb(sitio, true, { almacen: { x: '</script><img src=x onerror=alert(1)>' } })).not.toContain('</script><img');
  });

  it('el marco deja enviar formularios y abrir enlaces externos, pero sigue sin allow-same-origin', () => {
    const c = readFileSync(path.join(raiz, 'components', 'proyectos', 'ResultadoProyecto.vue'), 'utf8');
    const sandbox = /sandbox="([^"]*)"/.exec(c)?.[1] ?? '';
    expect(sandbox.split(' ')).toEqual(expect.arrayContaining(['allow-scripts', 'allow-forms', 'allow-popups']));
    expect(sandbox).not.toContain('allow-same-origin');
    expect(c).toContain("if (e.source !== vistaRef.value?.contentWindow) return");
  });

  it('«Ampliar» pone el resultado a pantalla completa, con anchos de celular y tableta, y Esc sale', () => {
    const c = readFileSync(path.join(raiz, 'components', 'proyectos', 'ResultadoProyecto.vue'), 'utf8');
    expect(c).toContain("{{ ampliado ? 'Salir (Esc)' : 'Ampliar' }}");
    expect(c).toContain("width: ancho === 'celular' ? '375px' : '768px'");
    expect(c).toContain("if (e.key === 'Escape' && ampliado.value) alternarAmpliado()");
  });
});
