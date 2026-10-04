import { readdirSync, readFileSync, statSync } from 'fs';
import * as path from 'path';

// Segunda versión de STIRE (v2.0.0) con las listas de chequeo del profesor (docs/calidad/listas-chequeo/PLAN_DE_MEJORA.md).
// Cada bloque prueba la propiedad que pide el ítem, no solo que exista el código.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const vues = (dir: string): string[] =>
  readdirSync(path.join(raiz, dir)).flatMap((f) => {
    const rel = path.join(dir, f);
    return statSync(path.join(raiz, rel)).isDirectory() ? vues(rel) : f.endsWith('.vue') ? [rel] : [];
  });
const plantilla = (rel: string) => {
  const s = readFileSync(path.join(raiz, rel), 'utf8');
  const i = s.indexOf('<template');
  return i < 0 ? '' : s.slice(i, s.lastIndexOf('</template>'));
};
const PANTALLAS = [...vues('pages'), ...vues('components'), ...vues('layouts')];

describe('UX-07 · contraste WCAG 2.1 AA (axe-core marcó estas clases en producción el 04/10)', () => {
  // Valores medidos: slate-400 2,5:1 · stire-success 2,3:1 · stire-warning 1,9:1 · stire-teal como texto 3,6:1 ·
  // blanco sobre stire-danger 3,8:1 · stire-teal-dark 3,6:1. AA pide 4,5:1 en texto normal.
  const PROHIBIDAS = [/\btext-slate-(300|400)\b/, /\btext-stire-success\b/, /\btext-stire-warning\b/, /\btext-stire-teal(-dark)?\b(?![-/])/, /\bbg-stire-danger\b(?![-/])/];
  it.each(PROHIBIDAS.map((re) => [re.source, re]))('ninguna pantalla usa %s', (_n, re) => {
    const con = PANTALLAS.filter((f) => (re as RegExp).test(plantilla(f)));
    expect(con).toEqual([]);
  });

  it('el texto secundario no va sobre el fondo gris secundario en el mismo elemento (4,3:1)', () => {
    const malos = PANTALLAS.flatMap((f) =>
      [...plantilla(f).matchAll(/class="([^"]*)"/g)]
        .map((m) => m[1])
        .filter((c) => /\bbg-base-bg-secundario\b/.test(c) && /\btext-base-texto-secundario\b/.test(c))
        .map((c) => `${f}: ${c}`),
    );
    expect(malos).toEqual([]);
  });

  it('el botón «Abrir la clase» y la insignia «Estudiante» llevan un tono que cumple AA', () => {
    expect(leer('pages', 'docente', 'index.vue')).toContain('class="btn-stire-teal !bg-teal-700 hover:!bg-teal-800"');
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain("return 'badge-estudiante !text-teal-800'");
  });
});

describe('UX-07 · teclado y lector de pantalla', () => {
  it.each(['student.vue', 'teacher.vue', 'admin.vue', 'workspace.vue'])('%s: «Saltar al contenido» es lo primero y lleva a <main id="contenido">', (layout) => {
    const s = leer('layouts', layout);
    const primerEnlace = s.indexOf('<a href="#contenido"');
    expect(primerEnlace).toBeGreaterThan(-1);
    const encabezado = s.indexOf('<LayoutHeaderNav');
    expect(encabezado === -1 || encabezado > primerEnlace).toBe(true);
    expect(s).toMatch(/<main id="contenido" tabindex="-1"/);
    expect(s).toMatch(/class="sr-only focus:not-sr-only/);
  });

  it('«Mi perfil»: el correo y el rol (solo lectura) tienen etiqueta asociada', () => {
    const s = leer('components', 'perfil', 'Form.vue');
    for (const id of ['perfil-correo', 'perfil-rol']) {
      expect(s).toContain(`for="${id}"`);
      expect(s).toContain(`id="${id}"`);
    }
  });
});

describe('MOB-02 y UX-06 · zona del pulgar y tamaño de los botones del ejercicio', () => {
  const ws = leer('layouts', 'workspace.vue');
  it('en el celular Probar y Entregar van en una barra fija abajo; en computador, en el encabezado', () => {
    expect(ws).toMatch(/barra-acciones fixed md:static inset-x-0 bottom-0/);
    expect(ws).toMatch(/\.barra-acciones \{ padding-bottom: calc\(0\.75rem \+ env\(safe-area-inset-bottom\)\); \}/);
    expect(ws).toMatch(/'pb-24 md:pb-0': isCodingActivity \|\| isHtmlCssActivity/);
  });
  it('los dos botones miden 48 px de alto en el celular y 44 px en computador', () => {
    const botones = [...ws.matchAll(/min-h-\[48px\] md:min-h-\[44px\]/g)];
    expect(botones.length).toBe(2);
  });
  it('el encabezado del ejercicio no usa desenfoque (haría que la barra fija se ubique respecto a él)', () => {
    expect(ws).not.toMatch(/<header[^>]*glass-header/);
  });
  it('el lanzador del Tutor sube por encima de la barra en el celular', () => {
    expect(ws).toContain('<TutorLanzadorTutor :sobre-barra="isCodingActivity || isHtmlCssActivity" />');
    expect(leer('components', 'tutor', 'LanzadorTutor.vue')).toMatch(/\.lanzador-tutor\.sobre-barra \{ bottom: calc\(5\.5rem/);
  });
});
