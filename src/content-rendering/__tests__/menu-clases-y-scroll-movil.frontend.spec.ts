import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 07/10, Jeider: (1) con el menú del docente plegado, todas las clases tenían el mismo ícono; (2) en el celular, al bajar
// por las notificaciones también bajaba la página de atrás.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

const { siglasDeClases } = cargar<{ siglasDeClases: (c: Array<{ id: number; name: string }>) => Record<number, string> }>('contextoAcademico');

describe('iniciales de cada clase en el menú del docente', () => {
  it('toma las palabras con peso, sin «de», «la», «y»…, y sin tildes', () => {
    expect(siglasDeClases([{ id: 1, name: 'Fundamentos de Algoritmia' }, { id: 2, name: 'Pensamiento Algorítmico' }, { id: 3, name: 'Énfasis en la Programación' }]))
      .toEqual({ 1: 'FA', 2: 'PA', 3: 'EP' });
  });

  it('las clases con el mismo nombre se numeran en orden, para que nunca se vean iguales', () => {
    const s = siglasDeClases([{ id: 11, name: 'Fundamentos de Algoritmia' }, { id: 7, name: 'Lógica' }, { id: 12, name: 'Fundamentos de Algoritmia' }, { id: 13, name: 'fundamentos de algoritmia' }]);
    expect(s).toEqual({ 11: 'FA1', 7: 'LO', 12: 'FA2', 13: 'FA3' });
    expect(new Set(Object.values(s)).size).toBe(4);
  });

  it('el menú usa las iniciales y, plegado, deja el nombre para el lector de pantalla y en el título', () => {
    const menu = leer('components', 'layout', 'ClasesDelMenu.vue');
    expect(menu).toContain('{{ siglas[c.id] }}');
    expect(menu).toContain(":class=\"{ 'md:sr-only': colapsado }\"");
    expect(menu).toContain(':title="c.code ? `${c.name} · ${c.code}` : c.name"');
    expect(menu).not.toContain('<BookOpen');
    expect(menu).toContain('misClases()');
  });
});

describe('notificaciones en el celular', () => {
  it('con el panel abierto en el celular, la página de atrás no se desplaza, y se suelta al cerrar', () => {
    const c = leer('composables', 'useBloqueoScrollMovil.ts');
    expect(c).toContain("MEDIA_MOVIL = '(max-width: 639px)'");
    expect(c).toContain("document.documentElement.style.overflow = 'hidden'");
    expect(c).toContain('onUnmounted(soltar)');
    expect(leer('components', 'layout', 'NotificationBell.vue')).toContain('useBloqueoScrollMovil(() => isOpen.value)');
  });
});
