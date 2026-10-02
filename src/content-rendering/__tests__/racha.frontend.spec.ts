import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Estadísticas sin abrumar (BASE_TEORICA.md BT-21): racha y semana a la vista, el resto plegado. Archivos reales.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
const js = ts.transpileModule(leer('utils', 'racha.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { ultimaSemana, avisoDeRacha } = mod.exports as {
  ultimaSemana: (c: Array<{ dia: string; ejercicios: number }>) => Array<{ dia: string; letra: string; practico: boolean; esHoy: boolean }>;
  avisoDeRacha: (r: number, hoy: boolean, docente?: boolean) => { texto: string; urgente: boolean };
};

describe('Racha y semana', () => {
  it('la semana son los últimos 7 días del calendario, con su inicial y hoy al final', () => {
    const cal = ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01']
      .map((dia, i) => ({ dia, ejercicios: i % 2 }));
    const s = ultimaSemana(cal);
    expect(s.map((d) => d.letra).join('')).toBe('VSDLMMJ'); // 25 sep 2026 es viernes; 1 oct, jueves
    expect(s.map((d) => d.practico)).toEqual([true, false, true, false, true, false, true]);
    expect(s.filter((d) => d.esHoy).map((d) => d.dia)).toEqual(['2026-10-01']);
  });

  it('el aviso anima y nunca regaña: con racha y sin práctica hoy, avisa que se pierde', () => {
    expect(avisoDeRacha(0, false)).toEqual({ texto: 'Haz un ejercicio hoy y empiezas una racha.', urgente: false });
    expect(avisoDeRacha(3, false)).toEqual({ texto: 'Haz un ejercicio hoy para no perderla.', urgente: true });
    expect(avisoDeRacha(3, true).urgente).toBe(false);
    expect(avisoDeRacha(3, false, true)).toEqual({ texto: 'Aún no practica hoy.', urgente: false });
  });

  it('a la vista solo la racha; las demás estadísticas van plegadas en «Ver más estadísticas»', () => {
    const c = leer('components', 'EstadisticasEstudiante.vue');
    expect(c).toContain('<details class="group');
    expect(c).not.toMatch(/<details[^>]*\sopen/);
    expect(c.indexOf('de racha')).toBeLessThan(c.indexOf('<details'));
    expect(c.indexOf('Últimos 4 meses')).toBeGreaterThan(c.indexOf('<details'));
  });

  it('la ficha del docente usa la misma racha (hora de Colombia) y habla de «su», no de «tus»', () => {
    const ficha = leer('pages', 'docente', 'estudiante', '[studentId].vue');
    expect(ficha).toContain('vista="docente"');
    expect(ficha).not.toContain('streakDays }}');
    expect(leer('components', 'EstadisticasEstudiante.vue')).toContain("docente ? 'Sus lecciones' : 'Tus lecciones'");
  });

  it('en «Mi progreso», el color de cada lección sale del mismo estado que su nombre', () => {
    const p = leer('pages', 'estudiante', 'progreso.vue');
    expect(p).not.toContain('item.mastery >= 70');
    expect(p).toContain(':class="claseEstado(item.mastery)"');
    expect(p).toContain('Repasar ahora');
  });
});
