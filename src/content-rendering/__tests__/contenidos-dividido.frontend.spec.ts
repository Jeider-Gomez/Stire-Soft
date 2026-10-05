import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Contenidos del curso dividido (PAT-01 y PAT-04; 05/10): la página organiza, el composable habla con la API y cada
// ventana es su propio componente con la base común. Mismo patrón que el panel del admin y Mensajes.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}
type Arbol = Array<{ id: number; title: string; order: number; isPublished: boolean; topics?: Array<{ id: number; title: string; order: number; description?: string; learningUnits?: Array<{ id: number; title: string; order: number; difficulty: string; description?: string }> }> }>;
const c = cargar<{
  mayorOrden: (l?: Array<{ order?: number | null }>) => number;
  resumenDeLeccion: (e?: number, j?: number) => string;
  aplicarTema: (a: Arbol, id: number, d: { title: string; description: string; order: number }) => boolean;
  quitarTema: (a: Arbol, id: number) => boolean;
  aplicarLeccion: (a: Arbol, id: number, d: { title: string; description: string; difficulty: string; order: number }) => boolean;
  textoImportacion: (r: { sections: number; learningUnits: number; activities: number }) => string;
}>('contenidosCurso');

describe('reglas del árbol de contenidos', () => {
  const arbol = (): Arbol => [{ id: 1, title: 'M1', order: 1, isPublished: true, topics: [{ id: 10, title: 'T', order: 1, learningUnits: [{ id: 100, title: 'L', order: 1, difficulty: 'basico' }] }] }];

  it('lo nuevo va al final y el resumen dice lo que hay', () => {
    expect(c.mayorOrden([{ order: 2 }, { order: 5 }, {}])).toBe(5);
    expect(c.mayorOrden(undefined)).toBe(0);
    expect(c.resumenDeLeccion(1, 3)).toBe('1 explicación · 3 ejercicios');
    expect(c.resumenDeLeccion(undefined, 1)).toBe('1 ejercicio');
  });

  it('editar y archivar cambian el árbol sin recargarlo', () => {
    const a = arbol();
    expect(c.aplicarTema(a, 10, { title: ' Nuevo ', description: ' d ', order: 3 })).toBe(true);
    expect(a[0].topics![0]).toMatchObject({ title: 'Nuevo', description: 'd', order: 3 });
    expect(c.aplicarLeccion(a, 100, { title: 'X', description: '', difficulty: 'avanzado', order: 2 })).toBe(true);
    expect(a[0].topics![0].learningUnits![0]).toMatchObject({ title: 'X', difficulty: 'avanzado', order: 2 });
    expect(c.quitarTema(a, 10)).toBe(true);
    expect(a[0].topics).toHaveLength(0);
    expect(c.quitarTema(a, 999)).toBe(false);
  });

  it('lo traído de otra clase, en una frase y en singular cuando es uno', () => {
    expect(c.textoImportacion({ sections: 1, learningUnits: 3, activities: 1 })).toBe('Se trajeron 1 módulo, 3 lecciones y 1 ejercicio. Revísalos y publícalos cuando quieras.');
  });
});

describe('la página organiza; el composable habla con la API; una ventana por componente', () => {
  const pagina = leer('pages', 'docente', 'contenidos.vue');
  const arbol = leer('components', 'docente', 'ArbolContenidos.vue');

  it('la página no llama a la API y ya no es un «Blob» (antes 1131 líneas)', () => {
    expect(pagina).not.toMatch(/api\.(get|post|patch|put|del)\(/);
    expect(pagina).toContain('provide(CLAVE_CONTENIDOS, estado)');
    expect(pagina.split('\n').length).toBeLessThan(420);
  });

  it('una ventana a la vez, cada una sobre la base común (foco, Tab atrapado, Escape)', () => {
    for (const v of ['VentanaEditarTema', 'VentanaArchivarTema', 'VentanaEditarLeccion', 'VentanaImportar']) {
      expect(pagina).toContain(`<DocenteContenidos${v}`);
      expect(leer('components', 'docente', 'contenidos', `${v}.vue`)).toContain('<AdminDialogo');
    }
    expect(pagina).toContain("const ventana = ref<Ventana | null>(null)");
  });

  it('archivar explica qué pasa en palabras (antes «soft delete») y el foco vuelve a «Traer de otra clase»', () => {
    const archivar = leer('components', 'docente', 'contenidos', 'VentanaArchivarTema.vue');
    expect(archivar).not.toContain('soft delete');
    expect(archivar).toContain('Sí, archivar el tema');
    expect(leer('components', 'docente', 'contenidos', 'VentanaImportar.vue')).toContain('devolver-foco="abrir-importar"');
    expect(pagina).toContain('id="abrir-importar"');
  });

  it('editar y archivar un tema van detrás de «Más» y, al cerrar la ventana, el foco vuelve a ese botón', () => {
    const menu = leer('components', 'MenuMas.vue');
    expect(menu).toContain(':aria-expanded="abierto"');
    expect(menu).toContain('@keydown.esc.stop="cerrar(true)"');
    expect(menu).toContain("document.addEventListener('click', alClicAfuera)");
    expect(arbol).toContain('<MenuMas :id-boton="`mas-tema-${topic.id}`"');
    expect(arbol).toContain('Archivar tema…');
    // «Archivar» ya no es un botón rojo suelto junto a «Nueva lección».
    expect(arbol).not.toMatch(/:aria-label="`Archivar tema/);
    for (const v of ['VentanaEditarTema', 'VentanaArchivarTema']) {
      expect(leer('components', 'docente', 'contenidos', `${v}.vue`)).toContain(':devolver-foco="`mas-tema-${tema.id}`"');
    }
  });

  it('en el celular el selector de clase no se sale y el botón de publicar dice qué hace', () => {
    expect(pagina).toMatch(/id="class-selector"[\s\S]{0,120}class="min-w-0 flex-1/);
    expect(arbol).toContain('flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b');
    expect(arbol).toContain('Pulsa para publicarlo');
  });

  it('sin «any»', () => {
    expect(pagina).not.toMatch(/:\s*any\b/);
    expect(leer('composables', 'useContenidosCurso.ts')).not.toMatch(/:\s*any\b/);
  });
});
