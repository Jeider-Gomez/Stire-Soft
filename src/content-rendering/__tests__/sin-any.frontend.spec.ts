import { readdirSync, readFileSync, statSync } from 'fs';
import * as path from 'path';

// `any` en el frontend (05/10): CLAUDE.md prohíbe `as any`; los `any` como anotación se van quitando y este contador
// solo puede bajar. Se quitaron todos los `catch (err: any)` (30; de 68 `any` quedan 35): los errores se leen con useApiErrorMessage().extract, que
// acepta `unknown` y no devuelve el texto crudo de ofetch.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const CARPETAS = ['components', 'pages', 'composables', 'utils', 'stores', 'layouts', 'plugins', 'middleware'];
const PATRON = /:\s*any\b|<any>|, any>|as any|any\[\]/g;
/** El techo de hoy. Si bajas el número de `any`, baja también este. */
const TECHO = 35;

function archivos(dir: string): string[] {
  let todos: string[] = [];
  let entradas: string[] = [];
  try { entradas = readdirSync(dir); } catch { return []; }
  for (const e of entradas) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) todos = todos.concat(archivos(p));
    else if (/\.(vue|ts)$/.test(e)) todos.push(p);
  }
  return todos;
}
const fuentes = CARPETAS.flatMap((c) => archivos(path.join(raiz, c)));

describe('sin «any» en el frontend', () => {
  it('ningún «as any» (CLAUDE.md)', () => {
    expect(fuentes.filter((f) => readFileSync(f, 'utf8').includes('as any')).map((f) => path.relative(raiz, f))).toEqual([]);
  });

  it('ningún «catch (err: any)»: el error es unknown y se lee con useApiErrorMessage', () => {
    expect(fuentes.filter((f) => /catch \(\w+: any\)/.test(readFileSync(f, 'utf8'))).map((f) => path.relative(raiz, f))).toEqual([]);
  });

  it(`los «any» restantes no pasan de ${TECHO}`, () => {
    const total = fuentes.reduce((n, f) => n + (readFileSync(f, 'utf8').match(PATRON)?.length ?? 0), 0);
    expect(total).toBeLessThanOrEqual(TECHO);
  });

  it('useApiErrorMessage lee el error sin «any»', () => {
    const c = readFileSync(path.join(raiz, 'composables', 'useApiErrorMessage.ts'), 'utf8');
    expect(c).toContain('function extract(err: unknown)');
    expect(c).toContain('function messageOf(err: unknown, fallback: string)');
    expect(c).not.toMatch(PATRON);
  });

  it('crear ejercicio: sin «any» y las lecciones se piden en paralelo, no una tras otra', () => {
    const pagina = readFileSync(path.join(raiz, 'pages', 'docente', 'ejercicios', 'crear.vue'), 'utf8');
    expect(pagina).not.toMatch(PATRON);
    expect(pagina).not.toMatch(/api\.(get|post|patch|put|del)\(/);
    const c = readFileSync(path.join(raiz, 'composables', 'useCrearEjercicio.ts'), 'utf8');
    expect(c).toContain('await Promise.all(');
    expect(c).not.toMatch(/for \(const .+\) \{\s*\n\s*const .+ = await api/);
  });
});
