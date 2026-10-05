import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Plantillas compartidas en pantalla (docs/DISENO_CLASES_Y_DOCENTES.md; BASE_TEORICA.md BT-18). Desde el 04/10 se
// comparten por alcance y se agrupan por asignatura (DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3; organizacion-academica.frontend.spec.ts).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (r: string) => cargar(r.replace(/^\.\//, '')));
  return mod.exports as T;
}
const { textoPlantilla } = cargar<{ textoPlantilla: (p: unknown) => string }>('plantillas');

describe('Plantillas compartidas', () => {
  it('cada plantilla dice su enfoque, de quién es y cuánto contenido trae; sin el código de ingreso de la clase', () => {
    const p = { classId: 3, nombre: 'Fundamentos de Algoritmia', docente: 'Laura Martínez', enfoque: null, modulos: 3, lecciones: 1, ejercicios: 40 };
    expect(textoPlantilla(p)).toBe('Fundamentos de Algoritmia — Laura Martínez · 3 módulos, 1 lección');
    expect(textoPlantilla({ ...p, enfoque: 'Solo pseudocódigo' })).toBe('Solo pseudocódigo — Laura Martínez · 3 módulos, 1 lección');
  });

  it('el docente elige con quién compartir en Ajustes, y se copia al crear una clase o con «Traer de otra clase»', () => {
    expect(leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue')).toContain('body: { alcancePlantilla: alcanceElegido.value');
    expect(leer('pages', 'docente', 'index.vue')).toContain('<DocenteElegirPlantilla');
    const contenidos = leer('pages', 'docente', 'contenidos.vue');
    expect(leer('components', 'docente', 'contenidos', 'VentanaImportar.vue')).toContain('<optgroup v-for="g in gruposDePlantillas"');
    // los módulos de una plantilla ajena se leen por reuse (no por /sections, que es solo del dueño)
    expect(leer('composables', 'useContenidosCurso.ts')).toContain('`/reuse/classes/${origenId}/modulos`');
    expect(contenidos).toContain('v-if="selectedClassId && (otherClasses.length > 0 || plantillas.length > 0)"');
  });
});
