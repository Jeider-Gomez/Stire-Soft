import { EvaluationEngineService } from '../../evaluation-engine/evaluation-engine.service';
import { validateHtmlCssConfig } from '../../evaluation-engine/html-css/html-css.validator';
import { HardenedProcessSandboxAdapter } from '../../judge-engine/hardened-process-sandbox.adapter';
import { StudentQuestionDto } from '../../activity-questions/dto/student-question.dto';
import { QuestionType } from '../../common/enums/question-type.enum';
import { HIGHLIGHT_LANGUAGES } from '../../common/code-languages';
import { cursoFundamentos203413 } from '../cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../cursos/pensamiento-algoritmico';
import {
  aConfig,
  Curso,
  Ejercicio,
  Programar,
  respuestaConError,
  respuestaCorrecta,
  todosLosEjercicios,
} from '../cursos/tipos';

// Los dos cursos pedagógicos (src/seeds/cursos/) se crean en la app como lo haría un docente. Esta prueba comprueba,
// con el motor de evaluación y el juez REALES, que cada ejercicio está bien planteado: la solución obtiene todos los
// puntos, el error común no, y ninguna respuesta llega al estudiante. Un ejercicio mal planteado frustra a un
// estudiante real; por eso se prueba antes de crearlo.
jest.setTimeout(120_000);

const CURSOS: Curso[] = [cursoFundamentos203413, cursoPensamientoAlgoritmico];
const PUNTOS = 100;
const motor = new EvaluationEngineService();
const juez = new HardenedProcessSandboxAdapter();

function puntaje(e: Ejercicio, respuesta: Record<string, unknown>): number {
  return motor.evaluateAnswer(e.tipo as QuestionType, respuesta, aConfig(e), PUNTOS).score;
}

/** Cada caso lanza un proceso real de Node; con `hastaFallar` se detiene en el primero que falla. */
async function casosQuePasan(e: Programar, codigo: string, hastaFallar = false): Promise<boolean[]> {
  const resultados: boolean[] = [];
  for (const c of e.casos) {
    const r = await juez.executeIsolated(codigo, 'javascript', { input: c.entrada, expected: c.salida });
    resultados.push(r.status === 'accepted');
    if (hastaFallar && r.status !== 'accepted') break;
  }
  return resultados;
}

describe.each(CURSOS.map((c) => [c.nombre, c] as const))('Curso «%s»', (_nombre, curso) => {
  const ejercicios = todosLosEjercicios(curso);

  it('cada unidad tiene una lección con la plantilla pedagógica y al menos tres ejercicios', () => {
    for (const s of curso.secciones)
      for (const t of s.temas)
        for (const u of t.unidades) {
          for (const titulo of ['## La idea', '## Un ejemplo', '## Error común', '## Pruébalo']) {
            expect({ unidad: u.titulo, tiene: u.leccion.cuerpo.includes(titulo) }).toEqual({ unidad: u.titulo, tiene: true });
          }
          expect({ unidad: u.titulo, ejercicios: u.ejercicios.length >= 3 }).toEqual({ unidad: u.titulo, ejercicios: true });
          const titulos = u.ejercicios.map((e) => e.titulo);
          expect(new Set(titulos).size).toBe(titulos.length);
        }
  });

  it('los títulos caben en la base de datos (200 caracteres)', () => {
    for (const { ruta, ejercicio } of ejercicios) expect({ ruta, largo: ejercicio.titulo.length <= 200 }).toEqual({ ruta, largo: true });
  });

  it('las preguntas de opción múltiple, ordenar y completar son coherentes', () => {
    for (const { ruta, ejercicio: e } of ejercicios) {
      if (e.tipo === 'mcq') {
        expect({ ruta, ok: e.correcta >= 0 && e.correcta < e.opciones.length && e.correcta !== e.errorComun }).toEqual({ ruta, ok: true });
        expect(new Set(e.opciones).size).toBe(e.opciones.length);
      }
      if (e.tipo === 'ordering') {
        expect({ ruta, permutacion: [...e.errorComun].sort((a, b) => a - b) }).toEqual({ ruta, permutacion: e.pasos.map((_, i) => i) });
      }
      if (e.tipo === 'fill_code') {
        const enPlantilla = [...e.plantilla.matchAll(/___([a-z0-9]+)___/g)].map((m) => m[1]).sort();
        expect({ ruta, huecos: enPlantilla }).toEqual({ ruta, huecos: Object.keys(e.huecos).sort() });
        expect(HIGHLIGHT_LANGUAGES).toContain(e.lenguaje);
      }
    }
  });

  it('la respuesta correcta obtiene todos los puntos y el error común no (motor de evaluación real)', () => {
    for (const { ruta, ejercicio: e } of ejercicios) {
      if (e.tipo === 'coding') continue;
      expect({ ruta, correcta: puntaje(e, respuestaCorrecta(e)) }).toEqual({ ruta, correcta: PUNTOS });
      expect({ ruta, conError: puntaje(e, respuestaConError(e)) < PUNTOS }).toEqual({ ruta, conError: true });
    }
  });

  it('los ejercicios de HTML y CSS pasan la validación que hace la app al crearlos', () => {
    for (const { ruta, ejercicio: e } of ejercicios) {
      if (e.tipo !== 'html_css') continue;
      expect({ ruta, problemas: validateHtmlCssConfig(aConfig(e)) }).toEqual({ ruta, problemas: [] });
    }
  });

  it('ninguna respuesta llega al estudiante', () => {
    const PROHIBIDAS = ['correctAnswerId', 'explanation', 'correctOrder', 'pairs', 'mappings', 'modelSolution', 'rules', 'answer'];
    for (const { ruta, ejercicio: e } of ejercicios) {
      const dto = StudentQuestionDto.fromEntity({
        id: 1, activityId: 1, type: e.tipo as QuestionType, question: e.enunciado, points: PUNTOS, order: 0, config: aConfig(e),
      } as never);
      const texto = JSON.stringify(dto.config);
      for (const clave of PROHIBIDAS) expect({ ruta, filtra: texto.includes(`"${clave}"`) }).toEqual({ ruta, filtra: false });
    }
  });

  it('programar: la solución pasa todos los casos y el error común falla alguno (juez real)', async () => {
    for (const { ruta, ejercicio: e } of ejercicios) {
      if (e.tipo !== 'coding') continue;
      expect({ ruta, publico: e.casos.some((c) => c.publico) }).toEqual({ ruta, publico: true });
      const conSolucion = await casosQuePasan(e, e.solucion);
      expect({ ruta, pasan: conSolucion }).toEqual({ ruta, pasan: e.casos.map(() => true) });
      const conError = await casosQuePasan(e, e.errorComun, true);
      expect({ ruta, fallaAlguno: conError.includes(false) }).toEqual({ ruta, fallaAlguno: true });
      const conInicial = await casosQuePasan(e, e.inicial, true);
      expect({ ruta, inicialNoResuelve: conInicial.includes(false) }).toEqual({ ruta, inicialNoResuelve: true });
    }
  });
});
