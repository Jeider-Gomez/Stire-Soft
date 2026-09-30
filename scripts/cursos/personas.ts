/**
 * Personas de la simulación. Son ficticias; los correos usan el dominio reservado example.com.
 * Cada perfil describe cómo estudia alguien real: qué tan seguido acierta al primer intento según la
 * dificultad, y hasta dónde llega en el curso.
 */
export const PASSWORD_PRUEBAS = 'Test123.';

export const DOCENTE = { nombre: 'Laura Martínez Petro', email: 'laura.martinez.docente@example.com' };

export interface Perfil {
  /** Probabilidad de acertar al primer intento, por dificultad. */
  primerIntento: { basico: number; intermedio: number; avanzado: number };
  /** Cuánto sube la probabilidad en cada nuevo intento (aprende del error). */
  mejoraPorIntento: number;
  /** Probabilidad de usar «Probar» antes de entregar un ejercicio de programar. */
  pruebaAntes: number;
  /** Cuántas unidades de aprendizaje alcanza a trabajar en cada curso (en orden). */
  unidades: Record<string, number>;
  /**
   * Qué responde a «¿Cómo te sientes con este tema?» al abrir cada unidad (1 = nuevo, 2 = dudas, 3 = seguro).
   * Sin este campo se salta la pregunta, como puede hacerlo un estudiante real. Que no coincida con cómo le va
   * (primerIntento) es a propósito: así se ve si el recomendador se adapta a lo que hace y no solo a lo que dice.
   */
  confianza?: 1 | 2 | 3;
}

export interface Estudiante {
  nombre: string;
  email: string;
  descripcion: string;
  perfil: Perfil;
}

export const ESTUDIANTES: Estudiante[] = [
  {
    nombre: 'Valentina Pérez Hoyos',
    email: 'valentina.perez@example.com',
    descripcion: 'Aplicada: casi siempre acierta y va al día en los dos cursos.',
    perfil: {
      primerIntento: { basico: 0.9, intermedio: 0.75, avanzado: 0.55 },
      mejoraPorIntento: 0.35,
      pruebaAntes: 0.9,
      unidades: { 'ALGO-203413': 17, 'PENSAR-ALGO': 10 },
    },
  },
  {
    nombre: 'Andrés Felipe Montes',
    email: 'andres.montes@example.com',
    descripcion: 'Promedio y sobreconfiado: dice sentirse seguro, pero en lo intermedio suele necesitar otro intento.',
    perfil: {
      confianza: 3,
      primerIntento: { basico: 0.75, intermedio: 0.45, avanzado: 0.25 },
      mejoraPorIntento: 0.3,
      pruebaAntes: 0.6,
      unidades: { 'ALGO-203413': 8, 'PENSAR-ALGO': 7 },
    },
  },
  {
    nombre: 'Camila Díaz Ortega',
    email: 'camila.diaz@example.com',
    descripcion: 'Le cuesta y se siente insegura: se equivoca con frecuencia, reintenta y avanza despacio.',
    perfil: {
      confianza: 1,
      primerIntento: { basico: 0.5, intermedio: 0.25, avanzado: 0.1 },
      mejoraPorIntento: 0.25,
      pruebaAntes: 0.3,
      unidades: { 'ALGO-203413': 5, 'PENSAR-ALGO': 4 },
    },
  },
  {
    nombre: 'Santiago Ruiz Galván',
    email: 'santiago.ruiz@example.com',
    descripcion: 'Llegó tarde al curso: solo ha trabajado las primeras unidades.',
    perfil: {
      primerIntento: { basico: 0.7, intermedio: 0.5, avanzado: 0.3 },
      mejoraPorIntento: 0.3,
      pruebaAntes: 0.5,
      unidades: { 'ALGO-203413': 3, 'PENSAR-ALGO': 2 },
    },
  },
  {
    nombre: 'Mariana Suárez Lora',
    email: 'mariana.suarez@example.com',
    descripcion: 'Constante: avanza a buen ritmo solo en Fundamentos de Algoritmia.',
    perfil: {
      primerIntento: { basico: 0.8, intermedio: 0.6, avanzado: 0.4 },
      mejoraPorIntento: 0.3,
      pruebaAntes: 0.7,
      unidades: { 'ALGO-203413': 9, 'PENSAR-ALGO': 0 },
    },
  },
];

/**
 * Segundo salón de Laura: «Fundamentos de Algoritmia — grupo 2», creado copiando ALGO-203413 con «Traer de otra
 * clase» (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.5). Estos estudiantes siguen la recomendación de «Continuar» en lugar
 * del orden de la lista, y cada uno tiene una relación distinta entre lo que dice y lo que hace.
 */
export const GRUPO_2 = { codigo: 'ALGO-203413-G2', nombre: 'Fundamentos de Algoritmia — grupo 2', origen: 'ALGO-203413' };

export const ESTUDIANTES_GRUPO_2: Estudiante[] = [
  {
    nombre: 'Julián Ortega Ríos',
    email: 'julian.ortega@example.com',
    descripcion: 'Sobreconfiado: dice sentirse seguro en todo y acierta poco lo intermedio y lo avanzado.',
    perfil: {
      confianza: 3,
      primerIntento: { basico: 0.7, intermedio: 0.35, avanzado: 0.15 },
      mejoraPorIntento: 0.25,
      pruebaAntes: 0.3,
      unidades: { 'ALGO-203413-G2': 5 },
    },
  },
  {
    nombre: 'Daniela Castro Mejía',
    email: 'daniela.castro@example.com',
    descripcion: 'Insegura pero capaz: dice que todo es nuevo para ella y casi siempre acierta.',
    perfil: {
      confianza: 1,
      primerIntento: { basico: 0.9, intermedio: 0.8, avanzado: 0.6 },
      mejoraPorIntento: 0.3,
      pruebaAntes: 0.8,
      unidades: { 'ALGO-203413-G2': 5 },
    },
  },
  {
    nombre: 'Sebastián Vargas Peña',
    email: 'sebastian.vargas@example.com',
    descripcion: 'Calibrado: dice tener dudas y le va como a alguien con dudas.',
    perfil: {
      confianza: 2,
      primerIntento: { basico: 0.75, intermedio: 0.5, avanzado: 0.3 },
      mejoraPorIntento: 0.3,
      pruebaAntes: 0.6,
      unidades: { 'ALGO-203413-G2': 5 },
    },
  },
  {
    nombre: 'Luisa Fernanda Rojas',
    email: 'luisa.rojas@example.com',
    descripcion: 'Salta la pregunta de confianza: el recomendador solo cuenta con lo que hace.',
    perfil: {
      primerIntento: { basico: 0.75, intermedio: 0.5, avanzado: 0.3 },
      mejoraPorIntento: 0.3,
      pruebaAntes: 0.6,
      unidades: { 'ALGO-203413-G2': 5 },
    },
  },
];
