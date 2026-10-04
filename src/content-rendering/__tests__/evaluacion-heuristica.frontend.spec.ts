import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Hallazgos de la evaluación heurística del 30/09 (docs/calidad/auditorias/EVALUACION_HEURISTICA_2026-09-30.md). Jest no compila
// frontend-nuxt/: se transpila la función de títulos y se leen las pantallas reales.
const FRONT = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...r: string[]) => readFileSync(path.join(FRONT, ...r), 'utf8');

function cargarTitulo(): (ruta: string) => string {
  const js = ts.transpileModule(leer('utils', 'tituloPagina.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports['tituloPagina'] as (ruta: string) => string;
}

describe('Evaluación heurística: hallazgos corregidos', () => {
  it('cada pantalla tiene su título de pestaña (antes todas decían lo mismo)', () => {
    const titulo = cargarTitulo();
    expect(titulo('/estudiante/progreso')).toBe('Mi progreso · STIRE-Soft');
    expect(titulo('/estudiante/evaluacion/12')).toBe('Ejercicio · STIRE-Soft');
    expect(titulo('/docente/rendimiento')).toBe('Rendimiento del grupo · STIRE-Soft');
    expect(titulo('/estudiante')).toBe('Inicio · STIRE-Soft');
    expect(new Set(['/estudiante', '/estudiante/repasos', '/docente', '/docente/contenidos'].map(titulo)).size).toBe(4);
    expect(leer('app.vue')).toMatch(/useHead\(\{ title: computed\(\(\) => tituloPagina\(route\.path\)\) \}\)/);
  });

  it('«repasos para hoy» cuenta solo los vencidos o críticos (Luisa tenía 5 para mañana y decía «5 para hoy»)', () => {
    const store = leer('stores', 'student.ts');
    expect(store).toMatch(/reviewsDueToday = computed\(\(\) => reviews\.value\.filter\(\(r\) => r\.urgency === 'vencido' \|\| r\.urgency === 'critico'\)\)/);
    expect(leer('pages', 'estudiante', 'progreso.vue')).toMatch(/studentStore\.reviewsDueToday\.length/);
    expect(leer('pages', 'estudiante', 'index.vue')).toMatch(/studentStore\.reviewsDueToday\.length/);
    // la insignia roja del menú lateral tenía el mismo problema
    const menu = leer('components', 'layout', 'SidebarNav.vue');
    expect(menu).toMatch(/v-if="studentStore\.reviewsDueToday\.length > 0"/);
    expect(menu).not.toMatch(/studentStore\.reviews\.length/);
  });

  it('mientras carga se muestra «—», no un 0 que parece real', () => {
    const progreso = leer('pages', 'estudiante', 'progreso.vue');
    expect(progreso).toMatch(/studentStore\.hasLoaded \? studentStore\.reviewsDueToday\.length : '—'/);
    expect(leer('stores', 'student.ts')).toMatch(/hasLoaded\.value = true/);
  });

  it('los nombres de estado de dominio usan los mismos cortes que el servidor (85, 60, 20)', () => {
    const progreso = leer('pages', 'estudiante', 'progreso.vue');
    const funcion = progreso.slice(progreso.indexOf('function getMasteryLevelName'));
    expect(funcion).toMatch(/>= 85\) return 'Dominado'[\s\S]*>= 60\) return 'Comprensión parcial'[\s\S]*>= 20\) return 'En práctica'/);
    expect(progreso).not.toMatch(/Umbral de maestría: 70%/);
  });

  it('el inicio del estudiante no usa emojis como íconos ni muestra el peso interno de cada ejercicio', () => {
    const inicio = leer('pages', 'estudiante', 'index.vue');
    const plantilla = inicio.slice(0, inicio.indexOf('<script'));
    expect(plantilla).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    expect(plantilla).not.toMatch(/adaptiveWeight|Actividades ponderadas/);
  });

  it('el botón del tutor en la pantalla del ejercicio tiene nombre accesible', () => {
    // Desde el 03/10 es el lanzador flotante, el mismo en todas las pantallas (P-UI-04).
    expect(leer('layouts', 'workspace.vue')).toContain('<TutorLanzadorTutor />');
    expect(leer('components', 'tutor', 'LanzadorTutor.vue')).toContain('aria-label="Abrir el Tutor IA"');
  });

  it('los porcentajes del docente se escriben enteros y con espacio («97 %», no «97.36%»)', () => {
    const js = ts.transpileModule(leer('utils', 'porcentaje.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const mod = { exports: {} as Record<string, unknown> };
    new Function('module', 'exports', js)(mod, mod.exports);
    const porcentaje = mod.exports['porcentaje'] as (v: unknown) => string;
    expect(porcentaje(97.36)).toBe('97 %');
    expect(porcentaje(undefined)).toBe('—');
    expect(leer('pages', 'docente', 'rendimiento.vue')).not.toMatch(/\}\}%/);
  });
});

