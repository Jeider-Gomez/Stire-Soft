import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Refuerzos y retos en pantalla (docs/DISENO_INTERVENCION_DOCENTE.md §4 y §10.4): la acción junto al dato, el mensaje
// que STIRE propone y el «¿funcionó?». Se prueban los archivos reales de frontend-nuxt.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
const js = ts.transpileModule(leer('utils', 'refuerzos.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { enlaceNuevoRefuerzo, idsDeConsulta, mensajeSugerido } = mod.exports as {
  enlaceNuevoRefuerzo: (c: number | null, t: string, e: number[], l?: number[]) => string;
  idsDeConsulta: (v: unknown) => number[];
  mensajeSugerido: (t: string, l: string[], n: string[]) => string;
};

describe('Refuerzos: enlaces y mensaje sugerido', () => {
  it('el enlace lleva la clase, el tipo, los estudiantes y las lecciones, sin repetir', () => {
    expect(enlaceNuevoRefuerzo(5, 'refuerzo', [16, 17, 16], [34])).toBe('/docente/refuerzos/nuevo?tipo=refuerzo&clase=5&estudiantes=16%2C17&lecciones=34');
    expect(enlaceNuevoRefuerzo(null, 'reto', [])).toBe('/docente/refuerzos/nuevo?tipo=reto');
    expect(idsDeConsulta('16,17,x,0')).toEqual([16, 17]);
  });

  it('el mensaje es corto, sobre la tarea, saluda por el nombre si es uno solo y dice qué hacer', () => {
    const m = mensajeSugerido('refuerzo', ['Varios caminos con else if'], ['Luisa Fernanda Rojas']);
    expect(m.startsWith('Hola, Luisa.')).toBe(true);
    expect(m).toContain('«Varios caminos con else if»');
    expect(m).toContain('haz uno a la vez');
    expect(mensajeSugerido('reto', [], ['A', 'B'])).toMatch(/^Hola\. Vas muy bien en esta parte del curso/);
  });
});

describe('Refuerzos: la acción junto al dato', () => {
  it('el mapa de calor ofrece refuerzo a bloqueados y a quien falló el reto, reforzar el tema difícil y un reto a los listos', () => {
    const mapa = leer('components', 'docente', 'MapaDeCalor.vue');
    expect(mapa).toContain("enlaceNuevoRefuerzo(classId, 'refuerzo', mapa.bloqueados.map((b) => b.studentId)");
    expect(mapa).toContain("enlaceNuevoRefuerzo(classId, 'refuerzo', mapa.segurosQueFallan.map((s) => s.studentId)");
    expect(mapa).toContain("enlaceNuevoRefuerzo(classId, 'refuerzo', mapa.estudiantes.map((e) => e.id), [mapa.temasDificiles[0]!.unitId])");
    expect(mapa).toContain("enlaceNuevoRefuerzo(classId, 'reto', mapa.listosParaMas.map((l) => l.studentId))");
  });

  it('la ficha del estudiante tiene «Asignar refuerzo» y «Reto»', () => {
    const ficha = leer('pages', 'docente', 'estudiante', '[studentId].vue');
    expect(ficha).toContain("enlaceNuevoRefuerzo(claseDeLaFicha, 'refuerzo', [Number(route.params.studentId)])");
    expect(ficha).toContain("enlaceNuevoRefuerzo(claseDeLaFicha, 'reto', [Number(route.params.studentId)])");
  });

  it('el docente ve «¿funcionó?» (antes → ahora) y el estudiante ve su refuerzo antes del siguiente paso', () => {
    expect(leer('pages', 'docente', 'refuerzos', 'index.vue')).toContain('¿Funcionó? Dominio antes → ahora');
    const inicio = leer('pages', 'estudiante', 'index.vue');
    expect(inicio.indexOf('v-for="r in refuerzos"')).toBeLessThan(inicio.indexOf('<!-- 1. EL SIGUIENTE PASO'));
  });

  it('en un ejercicio del refuerzo, el chat del Tutor dice que la ayuda está ampliada y por qué', () => {
    const chat = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(chat).toContain('v-if="tutorStore.guidanceLevel !== null && tutorStore.refuerzo"');
    expect(chat).toContain('Ayuda ampliada: este ejercicio es parte de tu refuerzo');
    expect(leer('stores', 'tutor.ts')).toContain('refuerzo.value = res?.refuerzo ?? null');
  });

  it('el formulario limita a 5 pasos y avisa que un borrador se publicará solo para esos estudiantes', () => {
    const form = leer('pages', 'docente', 'refuerzos', 'nuevo.vue');
    expect(form).toContain('v-if="f.pasos.length < 5"');
    expect(form).toContain('se publicará solo para estos estudiantes');
    // El mensaje propuesto sigue a la selección (lecciones, estudiantes, tipo) hasta que el docente lo escribe él.
    expect(form).toContain('if (!mensajeEditado.value && estudiantes.value.length) proponerMensaje()');
    expect(form).toContain('@input="mensajeEditado = true"');
  });
});
