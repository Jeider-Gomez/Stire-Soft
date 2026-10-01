import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Proyectos corre en el navegador (docs/DISENO_PROYECTOS.md): se prueban las funciones reales de frontend-nuxt/utils.
function cargar<T>(archivo: string): T {
  const file = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', archivo);
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

const { crc32, crearZip } = cargar<{ crc32: (d: Uint8Array) => number; crearZip: (a: Array<{ nombre: string; contenido: string }>) => Uint8Array }>('zip.ts');
const { fuenteDelWorker, documentoWeb } = cargar<{ fuenteDelWorker: (c: string, e: string) => string; documentoWeb: (a: Array<{ nombre: string; contenido: string }>, c?: boolean) => string }>('proyectoNavegador.ts');

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

describe('Enviar al docente (fase 2)', () => {
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
    const revision = leer('pages/docente/proyectos/[envioId].vue');
    expect(revision).toMatch(/<CodeEditor[^>]*read-only/);
    expect(revision).toContain('<ProyectosResultadoProyecto');
    const resultado = leer('components/proyectos/ResultadoProyecto.vue');
    expect(resultado).toContain('sandbox="allow-scripts allow-modals"');
    expect(resultado).not.toMatch(/sandbox="[^"]*allow-same-origin/);
    expect(resultado).toContain('e.source !== vistaRef.value?.contentWindow');
  });

  it('el estudiante envía desde su editor, y solo cuando sus cambios ya están guardados', () => {
    expect(leer('pages/estudiante/proyectos/[id].vue')).toContain(`<ProyectosEnviarAlDocente :proyecto-id="proyecto.id" :puede-enviar="estadoGuardado === 'guardado'" />`);
  });

  it('el docente llega desde el menú', () => {
    expect(leer('components/layout/SidebarNav.vue')).toContain('to="/docente/proyectos"');
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
