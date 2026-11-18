import { QuestionType } from '../enums/question-type.enum';
import {
  calcularCompetencias,
  competenciaParaPracticar,
  competenciasDeActividad,
  nivelCompetencia,
  prioridadPorCompetencia,
  type ActividadEvaluable,
  type IntentoCompetencia,
} from './competencias';
import { cursoFundamentos203413 } from '../../seeds/cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../../seeds/cursos/pensamiento-algoritmico';

const DIA = 86_400_000;
const t0 = new Date('2026-11-02T15:00:00Z').getTime();
const dia = (n: number) => new Date(t0 + n * DIA);

const act = (id: number, leccion: string, questionType: QuestionType, difficulty = 'basico', codigo?: string): ActividadEvaluable => ({
  id, leccion, questionType, difficulty, codigo, totalPoints: 20, passingScore: 60,
});

describe('competencias (P39: ecuación de Toscano, cuadro D3-Competencias-Modelo)', () => {
  describe('qué competencias trabaja cada ejercicio', () => {
    it('toma las de su lección', () => {
      expect(competenciasDeActividad(act(1, 'Decidir con if y else', QuestionType.MCQ))).toEqual(['condicionales']);
      expect(competenciasDeActividad(act(1, 'Variables y tipos de datos', QuestionType.MCQ))).toEqual(['asignacion', 'variables', 'tipos']);
    });

    it('en programar, suma lo que usa el código', () => {
      const codigo = 'const n = leerNumero();\nlet suma = 0;\nfor (let i = 1; i <= n; i++) { suma += i; }\nconsole.log(suma);';
      expect(competenciasDeActividad(act(1, 'Repetir con for y while', QuestionType.CODING, 'basico', codigo)))
        .toEqual(['entrada', 'mostrar', 'ciclos', 'contar-acumular']);
      // En un ejercicio que no es de código, el texto no cuenta.
      expect(competenciasDeActividad(act(1, 'Repetir con for y while', QuestionType.MCQ, 'basico', codigo))).toEqual(['ciclos']);
    });

    it('una lección del docente se etiqueta por las palabras de su título', () => {
      expect(competenciasDeActividad(act(1, 'Ciclos anidados', QuestionType.MCQ))).toEqual(['ciclos']);
      expect(competenciasDeActividad(act(1, 'Repaso general del parcial', QuestionType.MCQ))).toEqual([]);
    });

    it('todas las lecciones de los dos cursos de STIRE trabajan al menos una competencia', () => {
      for (const curso of [cursoFundamentos203413, cursoPensamientoAlgoritmico]) {
        for (const s of curso.secciones) for (const t of s.temas) for (const u of t.unidades) {
          expect({ leccion: u.titulo, comps: competenciasDeActividad({ id: 1, leccion: u.titulo, questionType: QuestionType.MCQ }).length > 0 })
            .toEqual({ leccion: u.titulo, comps: true });
        }
      }
    });
  });

  describe('Nivel = (puntos logrados + 1) ÷ (puntos posibles + 2)', () => {
    const basico = act(1, 'Decidir con if y else', QuestionType.MCQ, 'basico');
    const intermedio = act(2, 'Decidir con if y else', QuestionType.ORDERING, 'intermedio');
    const avanzado = act(3, 'Varios caminos con else if', QuestionType.CODING, 'avanzado');
    const de = (intentos: IntentoCompetencia[]) => calcularCompetencias([basico, intermedio, avanzado], intentos).find((c) => c.id === 'condicionales')!;

    it('sin intentos: sin evidencia', () => {
      const c = de([]);
      expect(c.estado).toBe('sin-evidencia');
      expect(c.ejercicios).toBe(3);
    });

    it('el ejemplo del diseño: un avanzado bien, (3 + 1) ÷ (3 + 2) = 80 %: ya «Lo domina»', () => {
      const c = de([{ activityId: 3, score: 20, fecha: dia(0) }]);
      expect(c.logrados).toBe(3);
      expect(c.posibles).toBe(3);
      expect(c.nivel).toBeCloseTo(0.8, 5);
      expect(c.estado).toBe('lo-domina');
      expect(nivelCompetencia(3, 3)).toBeCloseTo(0.8, 5);
    });

    it('un básico bien es «Lo hace» (2 ÷ 3), no «Lo domina»', () => {
      const c = de([{ activityId: 1, score: 20, fecha: dia(0) }]);
      expect(c.nivel).toBeCloseTo(2 / 3, 2);
      expect(c.estado).toBe('lo-hace');
    });

    it('todo intento suma a posibles; solo los buenos a logrados', () => {
      const c = de([{ activityId: 2, score: 0, fecha: dia(0) }, { activityId: 2, score: 20, fecha: dia(1) }]);
      expect(c.logrados).toBe(2);
      expect(c.posibles).toBe(4);
      expect(c.nivel).toBeCloseTo(3 / 6, 5);
      expect(c.estado).toBe('lo-hace');
    });

    it('fallar al principio deja «En camino»', () => {
      const c = de([{ activityId: 1, score: 0, fecha: dia(0) }, { activityId: 2, score: 0, fecha: dia(0) }]);
      expect(c.estado).toBe('en-camino');
    });

    it('repetir uno ya resuelto no suma de nuevo', () => {
      const una = de([{ activityId: 1, score: 20, fecha: dia(0) }]);
      const repetida = de([{ activityId: 1, score: 20, fecha: dia(0) }, { activityId: 1, score: 20, fecha: dia(1) }, { activityId: 1, score: 0, fecha: dia(2) }]);
      expect(repetida).toEqual(una);
    });

    it('el mismo historial da el mismo resultado sin importar el orden en que llega', () => {
      const intentos = [{ activityId: 3, score: 12, fecha: dia(2) }, { activityId: 1, score: 20, fecha: dia(0) }, { activityId: 2, score: 0, fecha: dia(1) }];
      expect(de(intentos)).toEqual(de([...intentos].reverse()));
    });
  });

  describe('para qué sirve', () => {
    const actividades = [
      act(1, 'Decidir con if y else', QuestionType.MCQ),
      act(2, 'Repetir con for y while', QuestionType.MCQ),
      act(3, 'Repetir con for y while', QuestionType.ORDERING),
    ];
    const intentos = [{ activityId: 1, score: 20, fecha: dia(0) }, { activityId: 2, score: 0, fecha: dia(1) }];

    it('practicar: la más baja de las que ya empezó', () => {
      expect(competenciaParaPracticar(calcularCompetencias(actividades, intentos))?.id).toBe('ciclos');
    });

    it('sin nada empezado, la primera sin evidencia', () => {
      expect(competenciaParaPracticar(calcularCompetencias(actividades, []))?.id).toBe('condicionales');
    });

    it('prioridad: las actividades de la competencia más baja van primero', () => {
      const p = prioridadPorCompetencia(actividades, calcularCompetencias(actividades, intentos));
      expect(p.get(3)!).toBeLessThan(p.get(1)!);
    });
  });
});
