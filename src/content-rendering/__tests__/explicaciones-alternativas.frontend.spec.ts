import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Explicaciones alternativas (27/10; nombre elegido por Jeider): el docente dice cuándo ve el estudiante cada explicación
// y el estudiante ve la alternativa cuando la necesita. Las reglas son las mismas que en el servidor.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const js = ts.transpileModule(leer('utils', 'explicacionesAlternativas.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const u = mod.exports as { laVe: (c: string | null, s: string) => boolean; esAlternativa: (c?: string | null) => boolean; textoCuando: (c?: string) => string };

describe('explicaciones alternativas', () => {
  it('las mismas reglas que el servidor: «si no entendió» también al fallar dos veces', () => {
    expect(u.laVe('siempre', 'entendio')).toBe(true);
    expect(u.laVe('noclaro', 'entendio')).toBe(false);
    expect(u.laVe('noclaro', 'falla2')).toBe(true);
    expect(u.laVe('falla2', 'noclaro')).toBe(false);
    expect(u.laVe('repaso', 'repaso')).toBe(true);
    expect(u.esAlternativa(null)).toBe(false);
    expect(u.textoCuando('falla2')).toBe('Si falla dos veces');
  });
  it('el docente elige en cada explicación cuándo la ve el estudiante', () => {
    expect(leer('components', 'docente', 'UnitLessonsModal.vue')).toContain('<DocenteCuandoExplicacion :id="item.id"');
    expect(leer('composables', 'useCuandoExplicacion.ts')).toContain('api.patch(`/content/${explicacionId}`, { cuando })');
  });
  it('«Ver como estudiante» deja elegir la situación del estudiante', () => {
    const v = leer('components', 'docente', 'contenidos', 'VistaEstudiante.vue');
    expect(v).toContain('laVe(x.cuando, situacion.value)');
    expect(v).toContain('aria-label="Situación del estudiante"');
  });
  it('el estudiante ve «Otra forma de verlo» y, al decir «No me quedó claro», la alternativa aparece', () => {
    const p = leer('pages', 'estudiante', 'unidad', '[id].vue');
    expect(p).toContain('Otra forma de verlo');
    expect(p).toContain('@no-claro="buscarAlternativa"');
    expect(leer('components', 'ValorarLeccion.vue')).toContain("if (!util) emit('no-claro')");
  });
});
