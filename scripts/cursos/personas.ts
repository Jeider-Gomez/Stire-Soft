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
    descripcion: 'Promedio: acierta lo básico, en lo intermedio suele necesitar un segundo intento.',
    perfil: {
      primerIntento: { basico: 0.75, intermedio: 0.45, avanzado: 0.25 },
      mejoraPorIntento: 0.3,
      pruebaAntes: 0.6,
      unidades: { 'ALGO-203413': 8, 'PENSAR-ALGO': 7 },
    },
  },
  {
    nombre: 'Camila Díaz Ortega',
    email: 'camila.diaz@example.com',
    descripcion: 'Le cuesta: se equivoca con frecuencia, reintenta y avanza despacio.',
    perfil: {
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
