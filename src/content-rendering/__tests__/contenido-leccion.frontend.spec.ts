import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { IMAGEN_EN_LINEA as IMAGEN_SERVIDOR, RECURSO_EN_LINEA as RECURSO_SERVIDOR } from '../../content/recursos/insertados';

// Imágenes, recursos y ejemplos en vivo DENTRO del texto de la lección. Se prueba el archivo real de frontend-nuxt.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
// Carga un archivo de utils/ con sus importaciones relativas (contenidoLeccion.ts usa algoritmoMultiformato.ts).
function cargarUtil(nombre: string): Record<string, unknown> {
  const codigo = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} as Record<string, unknown> };
  const requerir = (ruta: string) => cargarUtil(ruta.replace(/^\.\//, ''));
  new Function('module', 'exports', 'require', codigo)(m, m.exports, requerir);
  return m.exports;
}
const mod = { exports: cargarUtil('contenidoLeccion') };
const { partirContenido, marcaDeImagen, marcaDeRecurso, EJEMPLO_EN_VIVO, IMAGEN_EN_LINEA, RECURSO_EN_LINEA, insertadosDe } = mod.exports as {
  partirContenido: (t: string) => Array<Record<string, unknown>>;
  marcaDeImagen: (a: string, u: string, p?: string) => string;
  marcaDeRecurso: (t: string, u: string) => string;
  EJEMPLO_EN_VIVO: string;
  IMAGEN_EN_LINEA: RegExp;
  RECURSO_EN_LINEA: RegExp;
  insertadosDe: (m: Record<string, unknown> | null) => unknown;
};

describe('Contenido de la lección con recursos en su lugar', () => {
  it('reconoce las mismas marcas que valida el servidor', () => {
    expect(IMAGEN_EN_LINEA.source).toBe(IMAGEN_SERVIDOR.source);
    expect(RECURSO_EN_LINEA.source).toBe(RECURSO_SERVIDOR.source);
  });

  it('parte el texto en el orden en que el docente lo escribió', () => {
    const texto = '## La idea\nUna variable guarda un valor.\n\n![Una caja con la etiqueta edad](/media/abc "La variable edad")\n\nMira el video:\n@[Variables](https://youtu.be/dQw4w9WgXcQ)\n\n```vivo\n<p>Hola</p>\n```\nFin.';
    expect(partirContenido(texto)).toEqual([
      { tipo: 'texto', markdown: '## La idea\nUna variable guarda un valor.\n' },
      { tipo: 'imagen', alt: 'Una caja con la etiqueta edad', url: '/media/abc', pie: 'La variable edad' },
      { tipo: 'texto', markdown: '\nMira el video:' },
      { tipo: 'recurso', titulo: 'Variables', url: 'https://youtu.be/dQw4w9WgXcQ' },
      { tipo: 'texto', markdown: '' + '\n' },
      { tipo: 'vivo', codigo: '<p>Hola</p>' },
      { tipo: 'texto', markdown: 'Fin.' },
    ].filter((s) => s.tipo !== 'texto' || String(s.markdown).trim()));
  });

  it('dentro de un bloque de código las marcas son un ejemplo para leer; en medio de una frase tampoco cuentan', () => {
    const texto = '```markdown\n![foto](https://x.co/a.png)\n```\nUn @[video](https://youtu.be/x) en una frase.';
    expect(partirContenido(texto)).toEqual([{ tipo: 'texto', markdown: texto }]);
  });

  it('los botones del editor escriben marcas que se vuelven a leer igual, sin romperse con corchetes o comillas', () => {
    const img = marcaDeImagen('Diagrama [v2]', 'https://x.co/a.png', 'Pie con "comillas"');
    expect(partirContenido(img)).toEqual([{ tipo: 'imagen', alt: 'Diagrama  v2', url: 'https://x.co/a.png', pie: 'Pie con  comillas' }]);
    expect(partirContenido(marcaDeRecurso('Video [1]', 'https://youtu.be/dQw4w9WgXcQ'))).toEqual([{ tipo: 'recurso', titulo: 'Video  1', url: 'https://youtu.be/dQw4w9WgXcQ' }]);
    expect(partirContenido(EJEMPLO_EN_VIVO)[0]).toMatchObject({ tipo: 'vivo', codigo: expect.stringContaining('<script>') });
  });

  it('solo se usa un «insertados» con forma de objeto', () => {
    expect(insertadosDe({ insertados: [] })).toBeNull();
    expect(insertadosDe(null)).toBeNull();
    expect(insertadosDe({ insertados: { a: { url: 'a', provider: 'youtube', embedUrl: null } } })).toEqual({ a: { url: 'a', provider: 'youtube', embedUrl: null } });
  });

  it('el ejemplo en vivo corre aislado: allow-scripts sin allow-same-origin', () => {
    const vivo = leer('components', 'EjemploEnVivo.vue');
    const sandboxes = [...vivo.matchAll(/sandbox="([^"]*)"/g)].map((m) => m[1]);
    expect(sandboxes).toEqual(['allow-scripts allow-modals']);
  });

  it('la lección del estudiante y la vista previa del editor usan el mismo componente', () => {
    expect(leer('pages', 'estudiante', 'unidad', '[id].vue')).toContain('<ContenidoLeccion v-else :texto="content.body" :insertados="insertadosDe(content.metadata)" />');
    const editor = leer('components', 'docente', 'LessonEditor.vue');
    expect(editor).toContain('<ContenidoLeccion v-if="body.trim()" :texto="body" :insertados="insertados" borrador');
    expect(editor).toContain("api.post<{ url: string; proveedor: string; embedUrl: string | null }>('/content/recursos/vista-previa'");
  });
});
