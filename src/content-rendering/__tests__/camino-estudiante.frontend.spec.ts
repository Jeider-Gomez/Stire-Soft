import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// El camino del estudiante (docs/DISENO_INTERVENCION_DOCENTE.md §10.1 y §10.2): nombres, avance honesto, la lección
// antes del ejercicio y la evaluación implícita. Se prueban los archivos reales de frontend-nuxt.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
const plantilla = (archivo: string) => archivo.slice(0, archivo.indexOf('<script'));

function cargar<T>(archivo: string): T {
  const js = ts.transpileModule(leer('utils', archivo), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Leccion = { status: string; masteryPercentage: number; empezada?: boolean };
const { calcularAvance } = cargar<{ calcularAvance: (l: Leccion[]) => { total: number; dominadas: number; trabajadas: number; dominioTrabajado: number } }>('avanceCurso.ts');
const { contar, DOMINADO } = cargar<{ contar: (n: number, t: string, m?: boolean) => string; DOMINADO: number }>('terminos.ts');

describe('Avance honesto del curso', () => {
  it('5 lecciones dominadas de 17 no se leen como «100 %»: se cuenta sobre todo el curso', () => {
    const lecciones: Leccion[] = [
      ...Array.from({ length: 5 }, () => ({ status: 'dominado', masteryPercentage: 100, empezada: true })),
      ...Array.from({ length: 12 }, () => ({ status: 'por-iniciar', masteryPercentage: 0, empezada: false })),
    ];
    expect(calcularAvance(lecciones)).toEqual({ total: 17, dominadas: 5, trabajadas: 5, dominioTrabajado: 100 });
  });

  it('una lección empezada con 0 % cuenta como trabajada (no como «sin empezar»)', () => {
    const r = calcularAvance([{ status: 'en-progreso', masteryPercentage: 0, empezada: true }, { status: 'dominado', masteryPercentage: 90, empezada: true }]);
    expect(r).toMatchObject({ trabajadas: 2, dominioTrabajado: 45, dominadas: 1 });
    expect(calcularAvance([])).toEqual({ total: 0, dominadas: 0, trabajadas: 0, dominioTrabajado: 0 });
  });

  it('el umbral de «dominada» es el del servidor (85) y lo usa el plan del estudiante', () => {
    expect(DOMINADO).toBe(85);
    expect(leer('stores', 'student.ts')).not.toMatch(/mastery >= 80/);
  });

  it('el inicio muestra «x de N lecciones», no un dominio suelto', () => {
    const inicio = plantilla(leer('pages', 'estudiante', 'index.vue'));
    expect(inicio).toContain('studentStore.avanceCurso.dominadas');
    expect(inicio).toContain('Dominio en lo que has trabajado');
    expect(inicio).not.toContain('Ya dominas lo que llevas');
  });
});

describe('Nombres: módulo → tema → lección', () => {
  it('cuenta en singular y plural', () => {
    expect(contar(1, 'leccion')).toBe('1 lección');
    expect(contar(17, 'leccion')).toBe('17 lecciones');
    expect(contar(3, 'modulo', true)).toBe('3 Módulos');
  });

  it('el estudiante ya no ve «Unidad 1 … 6 Unidades»: el plan cuenta lecciones y muestra los temas que agrupan varias', () => {
    const inicio = plantilla(leer('pages', 'estudiante', 'index.vue'));
    expect(inicio).not.toMatch(/'Unidad' : 'Unidades'/);
    expect(inicio).toMatch(/v-for="tema in mod\.topics"/);
    expect(inicio).toMatch(/v-if="tema\.units\.length > 1"/);
  });
});

describe('La lección antes del ejercicio y la evaluación implícita', () => {
  it('una lección sin empezar abre la lección (la explicación), no un ejercicio suelto', () => {
    const inicio = plantilla(leer('pages', 'estudiante', 'index.vue'));
    expect(inicio).toMatch(/v-if="!studentStore\.activeUnit\.empezada \|\| !recommendedExerciseId \|\| recommendedReason === 'pausa'" :to="`\/estudiante\/unidad\/\$\{studentStore\.activeUnit\.id\}`"/);
    expect(inicio).toMatch(/<NuxtLink :to="`\/estudiante\/unidad\/\$\{unit\.id\}`"/);
  });

  it('no se pregunta «¿Cómo te sientes?»: se ofrece tomar un reto en cualquier momento, con el mismo reto de salto (confianza 3)', () => {
    const leccion = leer('pages', 'estudiante', 'unidad', '[id].vue');
    expect(plantilla(leccion)).not.toContain('¿Cómo te sientes');
    expect(leccion).toContain('¿Te sientes seguro? Toma un reto');
    expect(leccion).toContain('/next-activity?reto=1');
    // primero se busca el reto; la confianza solo se marca si lo hay
    expect(leccion.indexOf('/next-activity?reto=1')).toBeLessThan(leccion.indexOf('confidence`, { confianza: 3 }'));
    expect(leccion).toContain("reto.reason === 'reto'");
    // tras varios fallos seguidos, el tope va primero y se dice por qué no hay reto
    expect(leccion).toContain("reto?.reason === 'pausa'");
    // mientras no esté dominada (antes, solo antes de empezar)
    expect(leccion).toContain('puedeSaltar.value = !!rec && !rec.allCompleted && (progress?.mastery ?? 0) < DOMINADO');
  });

  it('el docente ve «Intentó saltar con un reto y falló», no «dijo sentirse seguro»', () => {
    const mapa = leer('components', 'docente', 'MapaDeCalor.vue');
    expect(mapa).toContain('Intentó saltar con un reto y falló');
    expect(mapa).not.toContain('Dijo «me siento seguro»');
  });
});

describe('Estadísticas al estilo de Anki en pantalla', () => {
  it('las ve el estudiante en «Mi progreso» y el docente en la ficha, de la clase desde la que la abrió', () => {
    expect(leer('pages', 'estudiante', 'progreso.vue')).toContain('<EstadisticasEstudiante :student-id="authStore.user?.id" :class-id="studentStore.currentClassId" />');
    const ficha = leer('pages', 'docente', 'estudiante', '[studentId].vue');
    expect(ficha).toContain(':class-id="claseDeLaFicha"');
    expect(leer('components', 'docente', 'MapaDeCalor.vue')).toContain('?clase=${classId}');
  });

  it('el calendario y el pronóstico tienen un texto para lectores de pantalla', () => {
    const comp = leer('components', 'EstadisticasEstudiante.vue');
    expect(comp).toMatch(/role="img" :aria-label="`Calendario de práctica/);
    expect(comp).toMatch(/role="img" :aria-label="textoPronostico"/);
  });
});

describe('Mi progreso con avance honesto', () => {
  it('ya no muestra «Dominio general 99.2 %»: muestra lecciones dominadas de todas', () => {
    const progreso = plantilla(leer('pages', 'estudiante', 'progreso.vue'));
    expect(progreso).not.toContain('Dominio general');
    expect(progreso).toContain('studentStore.avanceCurso.dominadas} de ${studentStore.avanceCurso.total}');
  });
});
