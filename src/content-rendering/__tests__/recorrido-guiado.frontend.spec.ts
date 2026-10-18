import { readFileSync, readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Recorrido guiado dentro de STIRE (S10-J04, Jeider a cargo, 18/10): el SUS del equipo bajó sobre todo por «necesitaría
// ayuda de una persona técnica». La primera vez en cada pantalla, un recorrido corto señala sus partes.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Paso = { elemento: string; titulo: string; texto: string };
type Recorrido = { id: string; rol: string; pantalla: string; pasos: Paso[] };
const r = cargar<{
  RECORRIDOS: Recorrido[];
  recorridoDeRuta: (ruta: string, rol: string) => Recorrido | null;
  claveVisto: (id: string, usuario: number | null) => string;
}>('recorridos');

/** Todo el código de las pantallas, para comprobar que cada paso señala algo que existe. */
function vues(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? vues(p) : n.endsWith('.vue') ? [readFileSync(p, 'utf8')] : [];
  });
}
const pantallas = ['components', 'pages', 'layouts'].flatMap((d) => vues(path.join(raiz, d))).join('\n');

describe('recorrido guiado', () => {
  it('cada pantalla clave del estudiante y del docente tiene su recorrido', () => {
    expect(r.recorridoDeRuta('/estudiante', 'estudiante')?.id).toBe('estudiante-inicio');
    expect(r.recorridoDeRuta('/estudiante/unidad/12', 'estudiante')?.id).toBe('estudiante-leccion');
    expect(r.recorridoDeRuta('/estudiante/evaluacion/40', 'estudiante')?.id).toBe('estudiante-ejercicio');
    expect(r.recorridoDeRuta('/estudiante/progreso/', 'estudiante')?.id).toBe('estudiante-progreso');
    expect(r.recorridoDeRuta('/docente', 'docente')?.id).toBe('docente-inicio');
    expect(r.recorridoDeRuta('/docente/clase/5', 'docente')?.id).toBe('docente-clase');
    // Otra pantalla u otro rol: sin recorrido (y sin botón «?»).
    expect(r.recorridoDeRuta('/docente/clase/5/notas', 'docente')).toBeNull();
    expect(r.recorridoDeRuta('/estudiante', 'docente')).toBeNull();
  });

  it('cada paso señala un elemento que existe en las pantallas (data-recorrido o un id que ya estaba)', () => {
    for (const rec of r.RECORRIDOS) {
      for (const p of rec.pasos) {
        const marca = /data-recorrido="([^"]+)"/.exec(p.elemento)?.[1];
        const id = /^#([\w-]+)$/.exec(p.elemento)?.[1];
        const aria = /^\[aria-labelledby="([^"]+)"\]$/.exec(p.elemento)?.[1];
        const nav = /^nav\[aria-label="([^"]+)"\]$/.exec(p.elemento)?.[1];
        if (marca) expect(pantallas).toContain(`data-recorrido="${marca}"`);
        else if (id) expect(pantallas).toContain(`id="${id}"`);
        else if (aria) expect(pantallas).toContain(`aria-labelledby="${aria}"`);
        else if (nav) expect(pantallas).toContain(`aria-label="${nav}"`);
        else throw new Error(`Selector sin comprobar: ${p.elemento}`);
      }
    }
  });

  it('textos cortos, en palabras de usuario', () => {
    for (const rec of r.RECORRIDOS) {
      expect(rec.pasos.length).toBeLessThanOrEqual(5);
      for (const p of rec.pasos) expect(p.texto.length).toBeLessThanOrEqual(160);
    }
  });

  it('sale solo la primera vez (por persona y pantalla) y se repite desde «?» en la cabecera', () => {
    expect(r.claveVisto('estudiante-inicio', 7)).toBe('stire-recorrido-estudiante-inicio-7');
    const c = leer('composables', 'useRecorrido.ts');
    expect(c).toContain('if (!r || yaVisto(r)) return');
    expect(c).toContain('onDestroyed: () => marcarVisto(r)');
    expect(c).toContain('.filter((p) => seVe(p.elemento))');
    expect(c).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(c).toContain("setAttribute('aria-label', 'Cerrar el recorrido')");
    const h = leer('components', 'layout', 'HeaderNav.vue');
    expect(h).toContain('v-if="recorrido.actual.value"');
    expect(h).toContain('@click="recorrido.mostrar()"');
    for (const l of ['student.vue', 'teacher.vue', 'workspace.vue']) {
      expect(leer('layouts', l)).toContain('watch(() => rutaActual.path, primeraVez, { immediate: true })');
    }
  });
});
