import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// La Biblioteca del docente (pages/docente/biblioteca.vue, utils/biblioteca.ts): los cursos que otros compartieron,
// para revisarlos por dentro y copiarlos a una clase nueva. Usa lo que el servidor ya tenía (/reuse/plantillas y
// /reuse/classes/:id/modulos): no necesita despliegue del backend.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

interface P { classId: number; nombre: string; docente: string; enfoque: string | null; asignatura: { id: number; nombre: string } | null; modulos: number; lecciones: number; ejercicios: number; vecesCopiada: number; valoracion: { utiles: number; total: number } | null; actualizada: string; cercania: number }
type Orden = 'cercania' | 'copiadas' | 'utiles' | 'recientes';
const b = cargar<{
  filtrarBiblioteca: (l: P[], o: { texto?: string; asignaturaId?: number | null; orden?: Orden }) => P[];
  asignaturasDeLaBiblioteca: (l: P[]) => Array<{ id: number; nombre: string }>;
  utilidadPlantilla: (p: P) => number | null;
  enlaceUsarPlantilla: (id: number) => string;
}>('biblioteca');

const base = { modulos: 4, lecciones: 12, ejercicios: 30, valoracion: null, actualizada: '2026-10-01T00:00:00Z', cercania: 1 };
const lista: P[] = [
  { ...base, classId: 1, nombre: 'Algoritmia 1', docente: 'Laura Martínez', enfoque: 'Con pseudocódigo', asignatura: { id: 10, nombre: 'Fundamentos de Algoritmia' }, vecesCopiada: 2, cercania: 0 },
  { ...base, classId: 2, nombre: 'Pensar', docente: 'Pedro Gómez', enfoque: 'Con JavaScript', asignatura: { id: 20, nombre: 'Pensamiento Algorítmico' }, vecesCopiada: 9, valoracion: { utiles: 18, total: 20 }, actualizada: '2026-10-20T00:00:00Z' },
  { ...base, classId: 3, nombre: 'Libre', docente: 'Julio Ruiz', enfoque: null, asignatura: null, vecesCopiada: 0, valoracion: { utiles: 1, total: 2 } },
];

describe('buscar, filtrar y ordenar', () => {
  it('busca sin importar acentos ni mayúsculas, en enfoque, docente y asignatura', () => {
    expect(b.filtrarBiblioteca(lista, { texto: 'PSEUDOCODIGO' }).map((p) => p.classId)).toEqual([1]);
    expect(b.filtrarBiblioteca(lista, { texto: 'algorítmico' }).map((p) => p.classId)).toEqual([2]);
    expect(b.filtrarBiblioteca(lista, { texto: 'julio' }).map((p) => p.classId)).toEqual([3]);
  });
  it('filtra por asignatura', () => expect(b.filtrarBiblioteca(lista, { asignaturaId: 20 }).map((p) => p.classId)).toEqual([2]));
  it('ordena por cercanía, copias, utilidad o fecha', () => {
    expect(b.filtrarBiblioteca(lista, { orden: 'cercania' })[0].classId).toBe(1);
    expect(b.filtrarBiblioteca(lista, { orden: 'copiadas' })[0].classId).toBe(2);
    expect(b.filtrarBiblioteca(lista, { orden: 'utiles' })[0].classId).toBe(2);
    expect(b.filtrarBiblioteca(lista, { orden: 'recientes' })[0].classId).toBe(2);
  });
  it('la utilidad solo con 5 votos o más; con menos un porcentaje engaña', () => {
    expect(b.utilidadPlantilla(lista[1])).toBe(90);
    expect(b.utilidadPlantilla(lista[2])).toBeNull();
  });
  it('el filtro de asignaturas no repite y va en orden alfabético', () => {
    expect(b.asignaturasDeLaBiblioteca(lista).map((a) => a.nombre)).toEqual(['Fundamentos de Algoritmia', 'Pensamiento Algorítmico']);
  });
});

describe('de la Biblioteca a una clase nueva', () => {
  it('«Usar en una clase nueva» abre «Crear clase» con la plantilla ya elegida', () => {
    expect(b.enlaceUsarPlantilla(7)).toBe('/docente?crear=1&plantilla=7');
    const inicio = leer('pages', 'docente', 'index.vue');
    expect(inicio).toContain('if (Number(q.plantilla) > 0) plantillaInicial.value = Number(q.plantilla)');
    expect(inicio).toContain(':plantilla-inicial="plantillaInicial"');
    expect(leer('components', 'docente', 'VentanaCrearClase.vue')).toContain('sourceClassId: props.plantillaInicial ?? null');
  });
  it('«Revisar por dentro» muestra los módulos que trae antes de decidir', () => {
    const pag = leer('pages', 'docente', 'biblioteca.vue');
    expect(pag).toContain('estado.modulosDePlantilla(classId)');
    expect(pag).toContain(':aria-expanded="abierta === p.classId"');
    expect(leer('composables', 'useClasesDocente.ts')).toContain('`/reuse/classes/${classId}/modulos`');
  });
  it('se llega desde el menú y desde el inicio', () => {
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('to="/docente/biblioteca"');
    expect(leer('pages', 'docente', 'index.vue')).toContain('to="/docente/biblioteca"');
    expect(leer('utils', 'tituloPagina.ts')).toContain("'Biblioteca'");
  });
});
