/**
 * Cursos pedagógicos de STIRE: cómo se describe un curso y cómo cada ejercicio se convierte en la
 * configuración que guarda la app (la misma que producen los constructores del docente).
 *
 * Cada ejercicio trae su solución y el ERROR COMÚN que comete un estudiante real. La prueba
 * src/seeds/__tests__/cursos-pedagogicos.spec.ts comprueba con el motor de evaluación y el juez reales
 * que la solución obtiene todos los puntos y que el error común no; el simulador de estudiantes usa
 * ese mismo error común para que los primeros intentos se parezcan a los de una persona.
 */

export type Dificultad = 'basico' | 'intermedio' | 'avanzado';

interface EjercicioBase {
  titulo: string;
  /** Enunciado en Markdown: lo que el estudiante lee arriba del ejercicio. */
  enunciado: string;
  dificultad: Dificultad;
  puntos?: number;
  intentos?: number;
}

export interface Mcq extends EjercicioBase {
  tipo: 'mcq';
  opciones: string[];
  /** Índice (desde 0) de la opción correcta. */
  correcta: number;
  /** Se muestra al estudiante después de responder. */
  explicacion: string;
  /** Índice del distractor que representa la confusión más frecuente. */
  errorComun: number;
}

export interface Ordenar extends EjercicioBase {
  tipo: 'ordering';
  /** Pasos EN EL ORDEN CORRECTO; la app los baraja al mostrarlos. */
  pasos: string[];
  /** Orden (índices de `pasos`) que entrega quien se equivoca. */
  errorComun: number[];
}

export interface Emparejar extends EjercicioBase {
  tipo: 'matching';
  /** [izquierda, derecha] correctas; la columna derecha se baraja. */
  parejas: Array<[string, string]>;
}

export interface Clasificar extends EjercicioBase {
  tipo: 'drag_drop';
  categorias: string[];
  /** [elemento, índice de su categoría] */
  elementos: Array<[string, number]>;
  /** Índices de `elementos` que el estudiante suele ubicar mal (se mandan a otra categoría). */
  errorComun: number[];
}

export interface Completar extends EjercicioBase {
  tipo: 'fill_code';
  lenguaje: 'javascript' | 'html' | 'css' | 'text';
  /** Código con huecos marcados como ___id___ */
  plantilla: string;
  /** Respuesta de cada hueco. Con `regex` se aceptan variantes (sin distinguir mayúsculas). */
  huecos: Record<string, string | { regex: string; ejemplo: string }>;
  errorComun: Record<string, string>;
}

export interface Programar extends EjercicioBase {
  tipo: 'coding';
  inicial: string;
  solucion: string;
  casos: Array<{ entrada: string; salida: string; publico: boolean }>;
  errorComun: string;
}

export interface ReglaHtmlCss {
  id: string;
  label: string;
  hint?: string;
  isPublic: boolean;
  weight: number;
  check: Record<string, unknown>;
}

export interface HtmlCss extends EjercicioBase {
  tipo: 'html_css';
  htmlInicial: string;
  cssInicial: string;
  solucion: { html: string; css: string };
  reglas: ReglaHtmlCss[];
  errorComun: { html: string; css: string };
}

export type Ejercicio = Mcq | Ordenar | Emparejar | Clasificar | Completar | Programar | HtmlCss;

export interface Unidad {
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  leccion: { titulo: string; cuerpo: string };
  ejercicios: Ejercicio[];
}

export interface Tema {
  titulo: string;
  descripcion: string;
  unidades: Unidad[];
}

export interface Seccion {
  titulo: string;
  descripcion: string;
  temas: Tema[];
}

export interface Curso {
  nombre: string;
  /** Código de matrícula: los estudiantes lo usan para unirse. */
  codigo: string;
  descripcion: string;
  secciones: Seccion[];
}

/** Lectura de la entrada estándar que se da hecha en los ejercicios de programar. */
export const LEER_ENTRADA =
  "// Lee la entrada: cada línea es un texto (no cambies esta línea)\n" +
  "const lineas = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\n";

const LETRAS = 'abcdefghij';

/** Configuración de la pregunta tal como la guarda la app. */
export function aConfig(e: Ejercicio): Record<string, unknown> {
  switch (e.tipo) {
    case 'mcq':
      return {
        options: e.opciones.map((text, i) => ({ id: LETRAS[i], text })),
        correctAnswerId: LETRAS[e.correcta],
        isMultipleChoice: false,
        explanation: e.explicacion,
      };
    case 'ordering':
      return {
        blocks: e.pasos.map((content, i) => ({ id: `p${i + 1}`, content })),
        correctOrder: e.pasos.map((_, i) => `p${i + 1}`),
      };
    case 'matching': {
      const pairs: Record<string, string> = {};
      e.parejas.forEach((_, i) => (pairs[`left_${i + 1}`] = `right_${i + 1}`));
      return {
        leftColumn: e.parejas.map(([text], i) => ({ id: `left_${i + 1}`, text })),
        rightColumn: e.parejas.map(([, text], i) => ({ id: `right_${i + 1}`, text })),
        pairs,
      };
    }
    case 'drag_drop': {
      const mappings: Record<string, string> = {};
      e.elementos.forEach(([, cat], i) => (mappings[`e${i + 1}`] = `c${cat + 1}`));
      return {
        items: e.elementos.map(([content], i) => ({ id: `e${i + 1}`, content })),
        targets: e.categorias.map((label, i) => ({ id: `c${i + 1}`, label })),
        mappings,
      };
    }
    case 'fill_code':
      return {
        codeTemplate: e.plantilla,
        language: e.lenguaje,
        blanks: Object.entries(e.huecos).map(([id, h]) =>
          // El evaluador arma ^respuesta$: sin el grupo, «a|b» aceptaría cualquier cosa que empiece por a.
          typeof h === 'string' ? { id, answer: h, regexMode: false } : { id, answer: `(?:${h.regex})`, regexMode: true },
        ),
      };
    case 'coding':
      return {
        language: 'javascript',
        starterCode: e.inicial,
        testCases: e.casos.map((c, i) => ({
          label: c.publico ? `Ejemplo ${i + 1}` : `Caso oculto ${i + 1}`,
          input: c.entrada,
          expected: c.salida,
          isPublic: c.publico,
        })),
      };
    case 'html_css':
      return {
        starterHtml: e.htmlInicial,
        starterCss: e.cssInicial,
        modelSolution: e.solucion,
        rules: e.reglas,
      };
  }
}

/** Respuesta correcta, con la forma que envía la pantalla del estudiante. */
export function respuestaCorrecta(e: Ejercicio): Record<string, unknown> {
  switch (e.tipo) {
    case 'mcq':
      return { selectedId: LETRAS[e.correcta] };
    case 'ordering':
      return { order: e.pasos.map((_, i) => `p${i + 1}`) };
    case 'matching': {
      const pairs: Record<string, string> = {};
      e.parejas.forEach((_, i) => (pairs[`left_${i + 1}`] = `right_${i + 1}`));
      return { pairs };
    }
    case 'drag_drop': {
      const mappings: Record<string, string> = {};
      e.elementos.forEach(([, cat], i) => (mappings[`e${i + 1}`] = `c${cat + 1}`));
      return { mappings };
    }
    case 'fill_code': {
      const blanks: Record<string, string> = {};
      for (const [id, h] of Object.entries(e.huecos)) blanks[id] = typeof h === 'string' ? h : h.ejemplo;
      return { blanks };
    }
    case 'coding':
      return { code: e.solucion };
    case 'html_css':
      return e.solucion;
  }
}

/** Respuesta con el error común: lo que entrega un estudiante que aún no domina el tema. */
export function respuestaConError(e: Ejercicio): Record<string, unknown> {
  switch (e.tipo) {
    case 'mcq':
      return { selectedId: LETRAS[e.errorComun] };
    case 'ordering':
      return { order: e.errorComun.map((i) => `p${i + 1}`) };
    case 'matching': {
      // Confunde las dos primeras parejas.
      const pairs: Record<string, string> = {};
      e.parejas.forEach((_, i) => (pairs[`left_${i + 1}`] = `right_${i + 1}`));
      pairs.left_1 = 'right_2';
      pairs.left_2 = 'right_1';
      return { pairs };
    }
    case 'drag_drop': {
      const mappings: Record<string, string> = {};
      e.elementos.forEach(([, cat], i) => {
        const mal = e.errorComun.includes(i);
        const n = e.categorias.length;
        mappings[`e${i + 1}`] = `c${(mal ? (cat + n - 1) % n : cat) + 1}`;
      });
      return { mappings };
    }
    case 'fill_code': {
      const blanks = respuestaCorrecta(e).blanks as Record<string, string>;
      return { blanks: { ...blanks, ...e.errorComun } };
    }
    case 'coding':
      return { code: e.errorComun };
    case 'html_css':
      return e.errorComun;
  }
}

export function todosLosEjercicios(c: Curso): Array<{ ruta: string; unidad: Unidad; ejercicio: Ejercicio }> {
  const out: Array<{ ruta: string; unidad: Unidad; ejercicio: Ejercicio }> = [];
  for (const s of c.secciones)
    for (const t of s.temas)
      for (const u of t.unidades)
        for (const e of u.ejercicios) out.push({ ruta: `${u.titulo} › ${e.titulo}`, unidad: u, ejercicio: e });
  return out;
}
