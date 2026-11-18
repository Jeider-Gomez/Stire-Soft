import { QuestionType } from '../enums/question-type.enum';

/**
 * Competencias (P39; profesor Toscano, audio del 28/10; diseño v3, cuadros «D3-Competencias», «D3-Competencias-Modelo»
 * y «E-Progreso-Competencias»; decidido con Jeider el 12/11).
 *
 * El dominio responde «¿cuánto le falta a esta lección?»; la competencia responde «¿qué sabe hacer?» (asignar, convertir
 * tipos, usar arreglos…), en cualquier lección. Son dos motores aparte: no se mezclan.
 *
 * La ecuación es la de Toscano (ejercicios bien resueltos sobre ejercicios intentados, por competencia), pesada por la
 * dificultad y suavizada para que pocos datos no den 0 % ni 100 %:
 *
 *     Nivel = (puntos logrados + 1) ÷ (puntos posibles + 2)
 *
 * - Cada ejercicio de esa competencia vale por su dificultad: básico 1, intermedio 2, avanzado 3.
 * - Un intento bien resuelto suma sus puntos a «logrados»; todo intento suma a «posibles».
 * - Repetir un ejercicio ya resuelto no suma de nuevo.
 * - La autoevaluación («¿qué tan seguro estás?») no entra.
 *
 * Ejemplo del diseño: un ejercicio avanzado bien, (3 + 1) ÷ (3 + 2) = 80 %: ya «Lo domina». No hacen falta 10.
 *
 * Cortes (REGLAS_COMPETENCIA, se pueden cambiar): «Lo domina» desde 80 %, «Lo hace» desde 50 %, «En camino» por debajo,
 * y «Sin evidencia» si todavía no ha intentado ningún ejercicio de esa competencia.
 *
 * El nivel no se guarda: se calcula desde los intentos. Si cambian las reglas, se recalcula para todos sin perder nada.
 * Las competencias salen del plan de curso oficial de Fundamentos de Algoritmia (FDOC-088) y de lo que pidió Toscano;
 * cada ejercicio se etiqueta por su lección y, en los de programar, por lo que usa su código. Un ejercicio que no encaja
 * en ninguna no cuenta.
 */

export interface Competencia {
  id: string;
  nombre: string;
  /** La pista corta que se ve debajo del nombre («Number("2") pasa texto a número»). */
  ejemplo: string;
  /** Módulo del plan de curso al que pertenece (FDOC-088). */
  grupo: 'Módulo 1 · Algoritmos y datos' | 'Módulo 2 · Programar' | 'Módulo 3 · Construir recursos';
}

export const COMPETENCIAS: readonly Competencia[] = [
  { id: 'pasos-precisos', nombre: 'Pasos precisos y en orden', ejemplo: 'un algoritmo no deja dudas en ningún paso', grupo: 'Módulo 1 · Algoritmos y datos' },
  { id: 'descomponer', nombre: 'Descomponer el problema', ejemplo: 'entradas, proceso y salidas', grupo: 'Módulo 1 · Algoritmos y datos' },
  { id: 'representar', nombre: 'Pseudocódigo y diagramas', ejemplo: 'Leer, calcular, Escribir', grupo: 'Módulo 1 · Algoritmos y datos' },
  { id: 'prueba-escritorio', nombre: 'Prueba de escritorio', ejemplo: 'seguir el valor de cada variable paso a paso', grupo: 'Módulo 1 · Algoritmos y datos' },
  { id: 'asignacion', nombre: 'Asignación simple', ejemplo: 'a = 2, b = 3, sumar', grupo: 'Módulo 1 · Algoritmos y datos' },
  { id: 'variables', nombre: 'Constantes y variables', ejemplo: 'const no cambia; let sí', grupo: 'Módulo 1 · Algoritmos y datos' },
  { id: 'tipos', nombre: 'Tipos de datos y conversión', ejemplo: 'Number("2") pasa texto a número', grupo: 'Módulo 1 · Algoritmos y datos' },
  { id: 'operadores', nombre: 'Operadores y orden', ejemplo: 'primero × y ÷, luego + y −', grupo: 'Módulo 1 · Algoritmos y datos' },
  { id: 'entrada', nombre: 'Leer los datos que entran', ejemplo: 'leerNumero(), leerTexto()', grupo: 'Módulo 2 · Programar' },
  { id: 'mostrar', nombre: 'Mostrar resultados', ejemplo: 'console.log(resultado)', grupo: 'Módulo 2 · Programar' },
  { id: 'condicionales', nombre: 'Decidir con condicionales', ejemplo: 'if (nota >= 3) { … } else { … }', grupo: 'Módulo 2 · Programar' },
  { id: 'ciclos', nombre: 'Repetir con ciclos', ejemplo: 'for (let i = 1; i <= 5; i++)', grupo: 'Módulo 2 · Programar' },
  { id: 'contar-acumular', nombre: 'Contar y acumular', ejemplo: 'suma += nota; contador++', grupo: 'Módulo 2 · Programar' },
  { id: 'funciones', nombre: 'Funciones', ejemplo: 'function area(b, h) { return b * h }', grupo: 'Módulo 2 · Programar' },
  { id: 'pagina-web', nombre: 'Página con HTML y CSS', ejemplo: '<h1>, <p> y una regla de estilo', grupo: 'Módulo 2 · Programar' },
  { id: 'eventos', nombre: 'Eventos en la página', ejemplo: 'boton.addEventListener("click", …)', grupo: 'Módulo 2 · Programar' },
  { id: 'arreglos', nombre: 'Arreglos y posiciones', ejemplo: 'la lista empieza en 0', grupo: 'Módulo 3 · Construir recursos' },
  { id: 'ova', nombre: 'Construir un OVA', ejemplo: 'la lógica y la navegación de un recurso', grupo: 'Módulo 3 · Construir recursos' },
];

export type IdCompetencia = (typeof COMPETENCIAS)[number]['id'];

const POR_ID = new Map(COMPETENCIAS.map((c) => [c.id, c]));
export const competenciaPorId = (id: string): Competencia | undefined => POR_ID.get(id);

const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Lecciones de los dos cursos de STIRE con sus competencias (títulos normalizados). Una lección que no está aquí se
 * etiqueta por las palabras de su título (PALABRAS_DE_LECCION): así sirven también las lecciones que crea el docente.
 */
const POR_LECCION: Record<string, IdCompetencia[]> = {
  // Fundamentos de Algoritmia (203413)
  'algoritmos en la vida diaria': ['pasos-precisos'],
  'pseudocodigo y diagramas de flujo': ['representar', 'pasos-precisos'],
  'variables y tipos de datos': ['variables', 'tipos', 'asignacion'],
  'operadores y expresiones': ['operadores', 'asignacion'],
  'mi primera pagina html': ['pagina-web'],
  'reparar una pagina con errores': ['pagina-web'],
  'entradas, proceso y salidas': ['descomponer', 'entrada', 'mostrar'],
  'decidir con if y else': ['condicionales'],
  'varios caminos con else if': ['condicionales'],
  'repetir con for y while': ['ciclos'],
  'contadores y acumuladores': ['contar-acumular', 'ciclos'],
  'crear y usar funciones': ['funciones'],
  'el dom y los eventos': ['eventos'],
  'dar estilo con css': ['pagina-web'],
  '¿que es un ova y que lo hace bueno?': ['ova'],
  'la logica de un cuestionario': ['ova', 'arreglos'],
  'estructura y navegacion de un ova': ['ova', 'pagina-web'],
  // Pensamiento algorítmico
  'descomponer, reconocer patrones y abstraer': ['descomponer'],
  'el robot que sigue ordenes': ['pasos-precisos'],
  'leer, calcular y escribir': ['representar', 'entrada', 'mostrar'],
  'leer un diagrama de flujo': ['representar'],
  'seguir un algoritmo con lapiz y papel': ['prueba-escritorio'],
  'si, sino y condiciones compuestas': ['condicionales'],
  'para, mientras y repetir': ['ciclos'],
  'contadores, acumuladores y banderas': ['contar-acumular'],
  'mayor, menor y promedio': ['operadores', 'condicionales'],
  'buscar en una lista': ['arreglos', 'ciclos'],
};

/** Para lecciones que no están en POR_LECCION (las del docente): palabras del título. */
const PALABRAS_DE_LECCION: Array<[RegExp, IdCompetencia]> = [
  [/pseudocodigo|diagrama/, 'representar'],
  [/prueba de escritorio|lapiz y papel|traza/, 'prueba-escritorio'],
  [/descompo|patron|abstra/, 'descomponer'],
  [/algoritmo|instruccion|pasos/, 'pasos-precisos'],
  [/asignaci/, 'asignacion'],
  [/variable|constante/, 'variables'],
  [/tipos? de dato|conversi/, 'tipos'],
  [/operador|expresion|calcul/, 'operadores'],
  [/entrada|leer/, 'entrada'],
  [/salida|mostrar|imprimir/, 'mostrar'],
  [/condicion|decisi|decidir|\bif\b|\bsi\b/, 'condicionales'],
  [/ciclo|repet|\bfor\b|while|mientras|bucle/, 'ciclos'],
  [/contador|acumulador|bandera/, 'contar-acumular'],
  [/funcion|procedimiento|modular/, 'funciones'],
  [/html|css|pagina|estilo|maquetac/, 'pagina-web'],
  [/\bdom\b|evento|clic/, 'eventos'],
  [/arreglo|lista|vector|matriz|array/, 'arreglos'],
  [/\bova\b|reda|recurso educativo/, 'ova'],
];

/** En los ejercicios de programar y completar, lo que usa el código también dice qué competencia muestra. */
// La asignación no se toma del código: las líneas de lectura que trae cada ejercicio («const x = leerNumero()») la
// harían aparecer en todos. Se cuenta por sus lecciones (Variables y Operadores).
const SENALES_DE_CODIGO: Array<[RegExp, IdCompetencia]> = [
  [/\bNumber\s*\(|parseInt\s*\(|parseFloat\s*\(|String\s*\(/, 'tipos'],
  [/\bleer(Numero|Texto|Lineas)\s*\(|readFileSync/, 'entrada'],
  [/console\.log\s*\(/, 'mostrar'],
  [/\bif\s*\(/, 'condicionales'],
  [/\b(for|while)\s*\(/, 'ciclos'],
  [/\+=|\+\+/, 'contar-acumular'],
  [/\bfunction\b|=>/, 'funciones'],
  [/\.push\(|\.length\b|\w\[\s*\w+\s*\]/, 'arreglos'],
  [/addEventListener|document\./, 'eventos'],
];

export interface ActividadCompetencias {
  id: number;
  questionType?: string | null;
  /** Título de la lección a la que pertenece. */
  leccion: string;
  /** Enunciado y código inicial o plantilla (solo cuenta en programar y completar). */
  codigo?: string | null;
}

/** Qué competencias trabaja un ejercicio (sin repetir, en el orden del catálogo). Vacío: no cuenta. */
export function competenciasDeActividad(a: ActividadCompetencias): IdCompetencia[] {
  const titulo = normalizar(a.leccion.trim());
  const ids = new Set<IdCompetencia>(POR_LECCION[titulo] ?? []);
  if (ids.size === 0) {
    for (const [patron, id] of PALABRAS_DE_LECCION) if (patron.test(titulo)) ids.add(id);
  }
  const conCodigo = a.questionType === QuestionType.CODING || a.questionType === QuestionType.FILL_CODE;
  if (conCodigo && a.codigo) {
    for (const [patron, id] of SENALES_DE_CODIGO) if (patron.test(a.codigo)) ids.add(id);
  }
  if (a.questionType === QuestionType.HTML_CSS) ids.add('pagina-web');
  return COMPETENCIAS.map((c) => c.id).filter((id) => ids.has(id));
}

export const REGLAS_COMPETENCIA = {
  /** Puntos de un ejercicio según su dificultad. */
  puntos: { basico: 1, intermedio: 2, avanzado: 3 } as Record<string, number>,
  /** Desde este nivel (0 a 1), «Lo domina». */
  corteDomina: 0.8,
  /** Desde este nivel, «Lo hace». */
  corteHace: 0.5,
} as const;

export type EstadoNivel = 'sin-evidencia' | 'en-camino' | 'lo-hace' | 'lo-domina';

export const NOMBRE_ESTADO: Record<EstadoNivel, string> = {
  'sin-evidencia': 'Sin evidencia',
  'en-camino': 'En camino',
  'lo-hace': 'Lo hace',
  'lo-domina': 'Lo domina',
};

/** Qué dificultad toca practicar en cada estado (cuadro D3-Competencias, «Qué ejercicio sigue»). */
export const DIFICULTAD_SEGUN_ESTADO: Record<EstadoNivel, 'basico' | 'intermedio' | 'avanzado'> = {
  'sin-evidencia': 'basico',
  'en-camino': 'basico',
  'lo-hace': 'intermedio',
  'lo-domina': 'avanzado',
};

export interface ActividadEvaluable extends ActividadCompetencias {
  difficulty?: string | null;
  totalPoints: number;
  passingScore: number;
}

export interface IntentoCompetencia {
  activityId: number;
  score: number;
  fecha: Date;
}

export interface EstadoCompetencia {
  id: IdCompetencia;
  nombre: string;
  ejemplo: string;
  grupo: Competencia['grupo'];
  logrados: number;
  posibles: number;
  /** (logrados + 1) ÷ (posibles + 2), de 0 a 1. Con «sin evidencia» es 0,5 (sin datos), y no se muestra. */
  nivel: number;
  estado: EstadoNivel;
  /** Ejercicios de la clase que la trabajan. */
  ejercicios: number;
  /** Lecciones donde se trabaja, en el orden de la clase. */
  lecciones: string[];
}

/** Puntos de un ejercicio por su dificultad (1, 2 o 3). */
export const puntosDe = (difficulty?: string | null) => REGLAS_COMPETENCIA.puntos[difficulty ?? 'basico'] ?? 1;

/** La ecuación del nivel. */
export const nivelCompetencia = (logrados: number, posibles: number) => (logrados + 1) / (posibles + 2);

export function estadoDeNivel(posibles: number, nivel: number): EstadoNivel {
  if (posibles === 0) return 'sin-evidencia';
  if (nivel >= REGLAS_COMPETENCIA.corteDomina) return 'lo-domina';
  if (nivel >= REGLAS_COMPETENCIA.corteHace) return 'lo-hace';
  return 'en-camino';
}

/** Aprueba con el mismo criterio que el resto de STIRE: el puntaje de aprobación es un porcentaje del total. */
function aprueba(a: ActividadEvaluable, score: number): boolean {
  return a.totalPoints > 0 && (score / a.totalPoints) * 100 >= a.passingScore;
}

/**
 * Las competencias de un estudiante a partir de sus intentos calificados en las actividades de la clase. Solo aparecen
 * las competencias que la clase trabaja (alguna actividad las tiene), en el orden del catálogo.
 */
export function calcularCompetencias(actividades: ActividadEvaluable[], intentos: IntentoCompetencia[]): EstadoCompetencia[] {
  const porActividad = new Map(actividades.map((a) => [a.id, { a, comps: competenciasDeActividad(a) }]));
  const trabajadas = new Map<IdCompetencia, { ejercicios: number; lecciones: string[] }>();
  for (const { a, comps } of porActividad.values()) {
    for (const id of comps) {
      const t = trabajadas.get(id) ?? { ejercicios: 0, lecciones: [] };
      t.ejercicios++;
      if (!t.lecciones.includes(a.leccion)) t.lecciones.push(a.leccion);
      trabajadas.set(id, t);
    }
  }

  const puntos = new Map<IdCompetencia, { logrados: number; posibles: number }>();
  const resuelta = new Set<number>();
  for (const intento of [...intentos].sort((x, y) => x.fecha.getTime() - y.fecha.getTime())) {
    const fila = porActividad.get(intento.activityId);
    // Repetir uno ya resuelto no suma de nuevo.
    if (!fila || fila.comps.length === 0 || resuelta.has(intento.activityId)) continue;
    const valor = puntosDe(fila.a.difficulty);
    const ok = aprueba(fila.a, intento.score);
    for (const id of fila.comps) {
      const p = puntos.get(id) ?? { logrados: 0, posibles: 0 };
      p.posibles += valor;
      if (ok) p.logrados += valor;
      puntos.set(id, p);
    }
    if (ok) resuelta.add(intento.activityId);
  }

  return COMPETENCIAS.filter((c) => trabajadas.has(c.id)).map((c) => {
    const p = puntos.get(c.id) ?? { logrados: 0, posibles: 0 };
    const nivel = nivelCompetencia(p.logrados, p.posibles);
    const t = trabajadas.get(c.id)!;
    return {
      id: c.id,
      nombre: c.nombre,
      ejemplo: c.ejemplo,
      grupo: c.grupo,
      logrados: p.logrados,
      posibles: p.posibles,
      nivel: Math.round(nivel * 1000) / 1000,
      estado: estadoDeNivel(p.posibles, nivel),
      ejercicios: t.ejercicios,
      lecciones: t.lecciones,
    };
  });
}

/**
 * La competencia que más conviene practicar: la más baja de las que ya empezó y todavía no domina; si no empezó
 * ninguna, la primera sin evidencia. «Lo domina» deja de pedirse.
 */
export function competenciaParaPracticar(estados: EstadoCompetencia[]): EstadoCompetencia | null {
  const empezadas = estados.filter((e) => e.estado === 'en-camino' || e.estado === 'lo-hace');
  if (empezadas.length > 0) return [...empezadas].sort((a, b) => a.nivel - b.nivel)[0];
  return estados.find((e) => e.estado === 'sin-evidencia') ?? null;
}

/**
 * Prioridad de cada actividad para el recomendador (#6, personalizar: Toscano, 28/10, «mismo ejercicio para todos no es
 * personalizar»): las que trabajan la competencia más baja del estudiante van primero. Devuelve, por actividad, el
 * nivel más bajo entre sus competencias (0 a 1; menos es más prioritario). Las que no trabajan ninguna no aparecen.
 */
export function prioridadPorCompetencia(actividades: ActividadCompetencias[], estados: EstadoCompetencia[]): Map<number, number> {
  const nivel = new Map(estados.map((e) => [e.id, e.estado === 'lo-domina' ? 1 : e.nivel]));
  const prioridad = new Map<number, number>();
  for (const a of actividades) {
    const valores = competenciasDeActividad(a).map((id) => nivel.get(id)).filter((v): v is number => v !== undefined);
    if (valores.length > 0) prioridad.set(a.id, Math.min(...valores));
  }
  return prioridad;
}
