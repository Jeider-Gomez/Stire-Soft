import { Curso, conVariantes } from '../tipos';
import { seccion1 } from './seccion1';
import { seccion2 } from './seccion2';
import { seccion3 } from './seccion3';
import { seccion4 } from './seccion4';
import { variantesPensamiento } from './variantes';

/**
 * Curso general de fundamentos de algoritmia, sin depender de un lenguaje de programación: pensamiento
 * computacional, pseudocódigo (estilo PSeInt), diagramas de flujo, pruebas de escritorio, estructuras de
 * control y problemas clásicos. Sirve como base para cualquier curso introductorio.
 */
export const cursoPensamientoAlgoritmico: Curso = conVariantes({
  nombre: 'Pensamiento algorítmico desde cero',
  codigo: 'PENSAR-ALGO',
  descripcion:
    'Fundamentos de algoritmia para cualquier persona que empieza: resolver problemas paso a paso con pseudocódigo, ' +
    'diagramas de flujo y pruebas de escritorio, sin depender de un lenguaje de programación.',
  secciones: [seccion1, seccion2, seccion3, seccion4],
}, variantesPensamiento);
