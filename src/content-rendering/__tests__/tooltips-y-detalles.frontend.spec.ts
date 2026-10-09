import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// JEIDER-S08-13 (09/10): «casi no hay tooltips». Un tooltip no sirve en el celular ni con el teclado: ningún botón depende
// de él (todos tienen nombre). Pero un ícono solo no siempre se entiende con el mouse: los botones y enlaces que solo
// muestran un ícono llevan `title`. Y errores visuales pequeños encontrados recorriendo producción con navegador.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const vues = (dir: string): string[] =>
  readdirSync(path.join(raiz, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? vues(path.join(dir, e.name)) : e.name.endsWith('.vue') ? [path.join(dir, e.name)] : []);

describe('tooltips donde un ícono solo no se entiende', () => {
  it('todo botón o enlace que solo muestra un ícono tiene title (además de su nombre para el lector de pantalla)', () => {
    const sinTitulo: string[] = [];
    for (const f of [...vues('components'), ...vues('pages'), ...vues('layouts')]) {
      const s = leer(f);
      for (const m of s.matchAll(/<(button|NuxtLink|a)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
        const [, , attrs, inner] = m;
        if (/\s:?title=/.test(attrs)) continue;
        const texto = inner.replace(/<[^>]+>/g, '').replace(/\{\{[\s\S]*?\}\}/g, 'x').trim();
        if (texto || !/<[A-Z]\w+[^>]*:size/.test(inner)) continue;
        sinTitulo.push(`${f}:${s.slice(0, m.index).split('\n').length}`);
      }
    }
    expect(sinTitulo).toEqual([]);
  });

  it('el botón «Más» de Contenidos y el del menú en el celular dicen qué son al pasar el mouse', () => {
    expect(leer('components', 'MenuMas.vue')).toContain('title="Más acciones"');
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('title="Menú"');
  });
});

describe('errores visuales pequeños', () => {
  it('en el celular, el título largo del ejercicio no se sale de la pantalla y «Volver» no se parte en tres líneas', () => {
    const w = leer('layouts', 'workspace.vue');
    expect(w).toContain('<div class="flex items-center gap-3 min-w-0 flex-1">');
    expect(w).toContain('<span class="sm:hidden">Volver</span><span class="hidden sm:inline">Volver a la lección</span>');
    expect(w).toContain('<div class="min-w-0">');
  });

  it('con muchas medallas nuevas, el inicio muestra 3 y «y N más» (antes, un párrafo que estiraba las tarjetas)', () => {
    const js = ts.transpileModule(leer('utils', 'logros.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const mod = { exports: {} as Record<string, unknown> };
    new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
    const { listaNuevos } = mod.exports as { listaNuevos: (n: Array<{ titulo: string }>) => string };
    const m = (n: number) => Array.from({ length: n }, (_, i) => ({ titulo: `M${i + 1}` }));
    expect(listaNuevos(m(2))).toBe('M1 · M2');
    expect(listaNuevos(m(16))).toBe('M1 · M2 · M3 y 13 más');
    expect(leer('components', 'estudiante', 'LogrosInicio.vue')).toContain('listaNuevos(nuevos)');
  });
});
