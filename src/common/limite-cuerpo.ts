import { LIMITES_PROYECTOS } from '../proyectos/proyecto-reglas';

/**
 * Tamaño máximo de un cuerpo JSON. Un proyecto lleno (200 KB de código) va en una sola petición, y el JSON lo agranda
 * al escapar saltos de línea y comillas (cada uno pasa a ocupar 2 bytes): el doble del proyecto más margen cubre ese
 * caso. El valor por defecto de Express (100 KB) cortaba un proyecto grande con un 413.
 */
export const LIMITE_CUERPO_JSON_BYTES = 2 * LIMITES_PROYECTOS.bytesPorProyecto + 64 * 1024;
export const LIMITE_CUERPO_JSON = `${LIMITE_CUERPO_JSON_BYTES / 1024}kb`;
