import { Curso, conVariantes } from '../tipos';
import { seccion1 } from './seccion1';
import { seccion2 } from './seccion2';
import { seccion3 } from './seccion3';
import { variantesFundamentos } from './variantes';

/**
 * Curso alineado con el plan de curso FDOC-088 de la Universidad de Córdoba:
 * Fundamentos de Algoritmia (203413), Licenciatura en Informática, III semestre.
 * Las tres secciones son las tres unidades del plan; usa JavaScript, HTML5 y CSS como lenguajes.
 */
export const cursoFundamentos203413: Curso = conVariantes({
  nombre: 'Fundamentos de Algoritmia (203413)',
  codigo: 'ALGO-203413',
  descripcion:
    'Curso de III semestre de la Licenciatura en Informática, alineado con el plan de curso 203413 de la Universidad de Córdoba. ' +
    'Desarrolla el pensamiento lógico para construir algoritmos y aplicarlos al desarrollo web con HTML5, CSS y JavaScript, ' +
    'hasta crear objetos virtuales de aprendizaje.',
  secciones: [seccion1, seccion2, seccion3],
}, variantesFundamentos);
