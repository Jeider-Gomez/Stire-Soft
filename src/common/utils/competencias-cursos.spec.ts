import { competenciasDeActividad } from './competencias';
import { cursoFundamentos203413 } from '../../seeds/cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../../seeds/cursos/pensamiento-algoritmico';
import type { Curso } from '../../seeds/cursos/tipos';

/** Cada ejercicio real de los dos cursos, como lo ve el motor de competencias (lección, tipo y su código). */
function ejercicios(curso: Curso) {
  return curso.secciones.flatMap((s) =>
    s.temas.flatMap((t) =>
      t.unidades.flatMap((u) =>
        u.ejercicios.map((e) => {
          const x = e as unknown as Record<string, unknown>;
          return {
            titulo: e.titulo,
            leccion: u.titulo,
            questionType: e.tipo,
            codigo: [e.enunciado, String(x.inicial ?? ''), String(x.plantilla ?? '')].join('\n'),
          };
        }),
      ),
    ),
  );
}

describe('Competencias de los ejercicios reales de los dos cursos', () => {
  const todos = [...ejercicios(cursoFundamentos203413), ...ejercicios(cursoPensamientoAlgoritmico)].map((e, i) => ({
    ...e,
    comps: competenciasDeActividad({ id: i, leccion: e.leccion, questionType: e.questionType, codigo: e.codigo }),
  }));

  it('todo ejercicio cuenta para al menos una competencia', () => {
    expect(todos.filter((e) => e.comps.length === 0).map((e) => `${e.leccion} › ${e.titulo}`)).toEqual([]);
  });

  it('«Arreglos» solo sale en ejercicios de lecciones que los enseñan o que los usan de verdad', () => {
    // Antes del Módulo 3 un ejercicio no debería contar para arreglos solo porque su enunciado o su código traen corchetes.
    const leccionesDeArreglos = new Set(['La lógica de un cuestionario', 'Buscar en una lista', 'Contadores y acumuladores', 'Repetir con for y while']);
    const fuera = todos.filter((e) => e.comps.includes('arreglos') && !leccionesDeArreglos.has(e.leccion));
    expect(fuera.map((e) => `${e.leccion} › ${e.titulo}`)).toEqual([]);
  });
});
