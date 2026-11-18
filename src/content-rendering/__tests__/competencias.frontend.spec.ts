import { readFileSync } from 'fs';
import * as path from 'path';

// Competencias (P39), personalizar el siguiente ejercicio (P15) y «Practica esto primero» (P36): lo que pidió el profesor
// Toscano el 28/10, con la ecuación y las pantallas de los cuadros «E-Progreso-Competencias», «D3-Competencias» y
// «D3-Competencias-Modelo».
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('competencias en la pantalla', () => {
  it('la ecuación de Toscano se ve igual al diseño', () => {
    const e = leer('components', 'competencias', 'EcuacionNivel.vue');
    expect(e).toContain('puntos logrados + 1');
    expect(e).toContain('puntos posibles + 2');
    expect(e).toContain('Básico 1');
    expect(e).toContain('Intermedio 2');
    expect(e).toContain('Avanzado 3');
    expect(e).toContain('(3 + 1) ÷ (3 + 2) = 80 %');
  });

  it('los cuatro estados y los tres modos con los nombres del diseño', () => {
    const u = leer('utils', 'competencias.ts');
    for (const t of ["'Sin evidencia'", "'En camino'", "'Lo hace'", "'Lo domina'", "'Apagadas'", "'Solo ver'", "'Elegir ejercicios'"]) expect(u).toContain(t);
  });

  it('el estudiante ve «Competencias» en Mi progreso solo si el docente las activó', () => {
    const c = leer('composables', 'usePestanasProgreso.ts');
    expect(c).toContain("conCompetencias.value = datos?.modo === 'informar' || datos?.modo === 'recomendar'");
    expect(c).toContain("p.id !== 'competencias' || conCompetencias.value");
    const m = leer('components', 'estudiante', 'MisCompetencias.vue');
    expect(m).toContain('Practicar esta');
    expect(m).toContain('Elegido para ti');
    expect(m).toContain('no cambia tu nivel');
  });

  it('el docente tiene su pestaña con el modo, la clase por competencia y el banco', () => {
    const p = leer('pages', 'docente', 'clase', '[classId]', 'competencias.vue');
    expect(p).toContain('role="radiogroup"');
    expect(p).toContain('Ejercicios en el banco');
    expect(p).toContain('en camino');
    expect(leer('utils', 'pestanasClase.ts')).toContain("case 'competencias': return `/docente/clase/${classId}/competencias`");
  });

  it('tras dos intentos sin lograrlo, «Practica esto primero» manda a la explicación y a uno más sencillo, nunca a la solución', () => {
    expect(leer('components', 'exercise', 'ResultadoEntrega.vue')).toContain('<ExercisePracticarPrimero v-if="!exito && (ej.usedAttempts ?? 0) >= 2"');
    const pp = leer('components', 'exercise', 'PracticarPrimero.vue');
    expect(pp).toContain("datos.value = r.modo === 'recomendar' ? r : null");
    expect(pp).toContain('#explicacion');
    expect(pp).toContain('Uno más sencillo');
  });
});
