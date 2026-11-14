// «Mi clase» y «Mi cuenta» v3 (Fase D, paso 5; cuadros «E-Clase-*» y «E-Cuenta»).
import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Entrega = { estado: 'sin_entregar' | 'revisada' | 'por_revisar'; cierraAt: string | null; versionesUsadas: number; limite: number };
type Refuerzo = { id: number; totalPasos: number; pasosHechos: number; fechaLimite: string | null };
const C = cargar<{
  PESTANAS_CLASE: ReadonlyArray<{ ruta: string; texto: string }>;
  pestanaDeRuta: (r: string) => string | null;
  enMiClase: (r: string) => boolean;
  filaEntrega: (e: Entrega, nota: string | null, ahora?: number) => { detalle: string; pastilla: string; tono: string };
  ordenarRefuerzos: (l: Refuerzo[]) => { pendientes: Refuerzo[]; terminados: Refuerzo[] };
}>('miClase');

describe('«Mi clase»: una cabecera y cinco pestañas', () => {
  it('Notas, Asistencia, Entregas, Refuerzos y retos, Avisos y mensajes, como en el cuadro', () => {
    expect(C.PESTANAS_CLASE.map((p) => p.texto)).toEqual(['Notas', 'Asistencia', 'Entregas', 'Refuerzos y retos', 'Avisos y mensajes']);
    expect(C.pestanaDeRuta('/estudiante/clase/')).toBe('/estudiante/clase');
    expect(C.pestanaDeRuta('/estudiante/progreso')).toBeNull();
  });
  it('el menú marca «Mi clase» en sus pestañas y dentro de una entrega o un refuerzo', () => {
    expect(['/estudiante/asistencia', '/estudiante/mensajes', '/estudiante/entregas/4', '/estudiante/refuerzos/2'].every(C.enMiClase)).toBe(true);
    expect(C.enMiClase('/estudiante/repasos')).toBe(false);
    const menu = leer('components', 'layout', 'SidebarNav.vue');
    expect(menu).toContain('<NuxtLink to="/estudiante/clase" class="item-menu tono-rosa" :class="{ activo: enMiClase }">');
    expect(menu).toContain('Mi código de asistencia');
  });
  it('cada pantalla de la clase lleva la cabecera, y la pestaña actual se anuncia', () => {
    for (const p of [['clase', 'index.vue'], ['clase', 'entregas.vue'], ['clase', 'refuerzos.vue'], ['asistencia.vue'], ['mensajes.vue']]) {
      expect(leer('pages', 'estudiante', ...p)).toContain('<EstudianteClaseCabecera />');
    }
    expect(leer('components', 'estudiante', 'clase', 'Cabecera.vue')).toContain(":aria-current=\"actual === p.ruta ? 'page' : undefined\"");
  });
  it('no inventa una «próxima sesión»: en STIRE las sesiones las abre el profe', () => {
    // (el comentario lo explica; en la pantalla no aparece)
    const plantilla = leer('components', 'estudiante', 'clase', 'Cabecera.vue').replace(/<!--[\s\S]*?-->/g, '');
    expect(plantilla).not.toMatch(/próxima sesión/i);
  });
});

describe('Entregas, refuerzos y notas', () => {
  const ahora = Date.parse('2026-11-14T15:00:00Z');
  it('una entrega dice qué falta, sin rojo', () => {
    expect(C.filaEntrega({ estado: 'revisada', cierraAt: null, versionesUsadas: 1, limite: 3 }, '4,5')).toEqual({ detalle: 'Revisada por tu profe', pastilla: '4,5', tono: 'menta' });
    expect(C.filaEntrega({ estado: 'por_revisar', cierraAt: null, versionesUsadas: 1, limite: 3 }, null).pastilla).toBe('Por revisar');
    expect(C.filaEntrega({ estado: 'sin_entregar', cierraAt: '2026-11-14T20:00:00Z', versionesUsadas: 0, limite: 3 }, null, ahora).pastilla).toBe('Vence hoy');
    expect(C.filaEntrega({ estado: 'sin_entregar', cierraAt: '2026-11-10T20:00:00Z', versionesUsadas: 0, limite: 3 }, null, ahora)).toEqual(expect.objectContaining({ pastilla: 'Cerrada', tono: 'gris' }));
  });
  it('los refuerzos que faltan van arriba, el de fecha más cercana primero; los terminados, aparte', () => {
    const r = C.ordenarRefuerzos([
      { id: 1, totalPasos: 3, pasosHechos: 3, fechaLimite: null },
      { id: 2, totalPasos: 2, pasosHechos: 0, fechaLimite: null },
      { id: 3, totalPasos: 2, pasosHechos: 1, fechaLimite: '2026-11-20' },
    ]);
    expect(r.pendientes.map((x) => x.id)).toEqual([3, 2]);
    expect(r.terminados.map((x) => x.id)).toEqual([1]);
  });
  it('si el profe no muestra las notas, la pestaña lo dice (en otras pantallas no aparece nada)', () => {
    const n = leer('components', 'MiNota.vue');
    expect(n).toContain('v-else-if="vacio && cargada"');
    expect(n).toContain('Tu profe todavía no muestra las notas en STIRE.');
    expect(leer('pages', 'estudiante', 'clase', 'index.vue')).toContain('<MiNota :class-id="studentStore.currentClassId" vacio />');
  });
});

describe('«Mi cuenta» del estudiante', () => {
  it('portada con la foto y el nombre, y las tarjetas de siempre acomodadas en columnas', () => {
    const p = leer('pages', 'estudiante', 'perfil.vue');
    expect(p).toContain('<a href="#perfil-foto-titulo"');
    expect(p).toContain('<div class="cuenta-v3">');
    expect(leer('assets', 'css', 'cuenta-v3.css')).toContain('.cuenta-v3 section {');
  });
});
