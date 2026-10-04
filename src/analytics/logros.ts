/**
 * Logros y medallas del estudiante (BASE_TEORICA.md BT-29; docs/DISENO_LOGROS.md).
 *
 * Estructura tomada de los referentes: categorías como Khan Academy, niveles bronce → plata → oro como Duolingo, meta
 * semanal en lugar de racha diaria como Codecademy, y criterios verificables como las medallas de Moodle. Con la
 * evidencia: las medallas aumentan la participación sin bajar la calidad (Denny, 2013); los rankings y la comparación
 * bajan la motivación intrínseca (Hanus y Fox, 2015). Por eso: privadas, sin ranking, y solo por aprendizaje real —un
 * ejercicio cuenta si se APRUEBA y si es distinto; repetir lo fácil no suma—.
 *
 * Se calculan con los datos que ya existen (entregas, dominio por lección, repasos). La tabla `logros_estudiante` solo
 * guarda cuándo se obtuvo cada uno y si el estudiante ya lo vio, para celebrarlo una vez.
 */
import { diaDe } from '../common/utils/dia-colombia';

export const DOMINIO_LOGRO = 85; // el mismo «dominado» de learning-progress/estadisticas.ts

export type Nivel = 'bronce' | 'plata' | 'oro';
export type Categoria = 'constancia' | 'practica' | 'dominio' | 'desafio' | 'persistencia' | 'memoria';

export interface EntregaParaLogros {
  activityId: number;
  learningUnitId: number;
  aprobada: boolean;
  avanzado: boolean;
  intento: number;
  fecha: Date;
}

export interface LeccionParaLogros {
  learningUnitId: number;
  moduloId: number;
  moduloTitulo: string;
  mastery: number;
  /** Última vez que cambió su dominio: aproxima cuándo se dominó. */
  fecha: Date | null;
}

export interface Logro {
  /** Única y estable: «constancia-plata», «modulo-12». Es la clave que se guarda. */
  clave: string;
  categoria: Categoria;
  titulo: string;
  descripcion: string;
  nivel: Nivel | null;
  /** Cuándo se obtuvo (ISO) o null si todavía no. */
  obtenido: string | null;
  /** Avance hacia este logro, para mostrar «2 de 3». */
  progreso: { actual: number; meta: number };
}

/** Cada categoría con sus niveles: la meta de cada nivel y su texto. */
const ESCALERAS: Array<{ categoria: Categoria; base: string; metas: [number, number, number]; titulo: (m: number) => string; descripcion: (m: number) => string }> = [
  {
    categoria: 'constancia', base: 'constancia', metas: [1, 4, 12],
    titulo: (m) => (m === 1 ? 'Semana de estudio' : `${m} semanas de estudio`),
    descripcion: (m) => `Estudia al menos 3 días distintos en una misma semana (lunes a domingo)${m > 1 ? `, ${m} semanas` : ''}. No tienen que ser seguidas.`,
  },
  {
    categoria: 'practica', base: 'practica', metas: [3, 5, 10],
    titulo: (m) => `${m} ejercicios en un día`,
    descripcion: (m) => `Aprueba ${m} ejercicios distintos el mismo día.`,
  },
  {
    categoria: 'dominio', base: 'lecciones', metas: [1, 5, 15],
    titulo: (m) => (m === 1 ? 'Primera lección dominada' : `${m} lecciones dominadas`),
    descripcion: (m) => `Llega a ${DOMINIO_LOGRO} % de dominio en ${m === 1 ? 'una lección' : `${m} lecciones`}.`,
  },
  {
    categoria: 'desafio', base: 'avanzados', metas: [1, 5, 15],
    titulo: (m) => (m === 1 ? 'Primer ejercicio avanzado' : `${m} ejercicios avanzados`),
    descripcion: (m) => `Aprueba ${m === 1 ? 'un ejercicio' : `${m} ejercicios distintos`} de nivel avanzado.`,
  },
  {
    categoria: 'persistencia', base: 'persistencia', metas: [1, 5, 15],
    titulo: () => 'No te rendiste',
    descripcion: (m) => `Aprueba ${m === 1 ? 'un ejercicio' : `${m} ejercicios`} en el tercer intento o después.`,
  },
  {
    categoria: 'memoria', base: 'repasos', metas: [10, 30, 100],
    titulo: (m) => `${m} repasos`,
    descripcion: (m) => `Haz ${m} repasos a tiempo: es lo que hace que no se olvide.`,
  },
];
const NIVELES: Nivel[] = ['bronce', 'plata', 'oro'];

function lunesDe(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/** Fechas (ISO) en que se alcanzó cada cantidad: la n-ésima vez que algo ocurrió. */
type Hitos = Array<{ cantidad: number; fecha: Date }>;
const cuandoLlego = (hitos: Hitos, meta: number): string | null => hitos.find((h) => h.cantidad >= meta)?.fecha.toISOString() ?? null;
const maximo = (hitos: Hitos) => hitos.reduce((m, h) => Math.max(m, h.cantidad), 0);

export function evaluarLogros(
  entregas: ReadonlyArray<EntregaParaLogros>,
  lecciones: ReadonlyArray<LeccionParaLogros>,
  repasos: ReadonlyArray<Date>,
  /** Días con práctica (cualquier entrega terminada), para la constancia. */
  diasDePractica: ReadonlyArray<Date>,
): Logro[] {
  const aprobadas = [...entregas].filter((e) => e.aprobada).sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  const hitos: Record<string, Hitos> = {};

  // Constancia: semanas con 3 días o más de práctica. El hito es el tercer día de cada semana.
  {
    const porSemana = new Map<string, Set<string>>();
    const tercerDia = new Map<string, Date>();
    for (const f of [...diasDePractica].sort((a, b) => a.getTime() - b.getTime())) {
      const dia = diaDe(f);
      const semana = lunesDe(dia);
      const dias = porSemana.get(semana) ?? new Set<string>();
      dias.add(dia);
      porSemana.set(semana, dias);
      if (dias.size === 3 && !tercerDia.has(semana)) tercerDia.set(semana, f);
    }
    hitos.constancia = [...tercerDia.values()].sort((a, b) => a.getTime() - b.getTime()).map((fecha, i) => ({ cantidad: i + 1, fecha }));
  }

  // Práctica intensa: ejercicios DISTINTOS aprobados en un mismo día (el mejor día cuenta).
  {
    const porDia = new Map<string, Set<number>>();
    hitos.practica = [];
    for (const e of aprobadas) {
      const dia = diaDe(e.fecha);
      const ej = porDia.get(dia) ?? new Set<number>();
      ej.add(e.activityId);
      porDia.set(dia, ej);
      hitos.practica.push({ cantidad: ej.size, fecha: e.fecha });
    }
  }

  // Dominio: lecciones dominadas, en el orden en que se dominaron.
  hitos.lecciones = lecciones
    .filter((l) => l.mastery >= DOMINIO_LOGRO)
    .sort((a, b) => (a.fecha?.getTime() ?? 0) - (b.fecha?.getTime() ?? 0))
    .map((l, i) => ({ cantidad: i + 1, fecha: l.fecha ?? new Date(0) }));

  // Desafío: ejercicios avanzados distintos aprobados.
  {
    const vistos = new Set<number>();
    hitos.avanzados = [];
    for (const e of aprobadas) {
      if (e.avanzado && !vistos.has(e.activityId)) {
        vistos.add(e.activityId);
        hitos.avanzados.push({ cantidad: vistos.size, fecha: e.fecha });
      }
    }
  }

  // Persistencia: ejercicios distintos aprobados en el tercer intento o después.
  {
    const vistos = new Set<number>();
    hitos.persistencia = [];
    for (const e of aprobadas) {
      if (e.intento >= 3 && !vistos.has(e.activityId)) {
        vistos.add(e.activityId);
        hitos.persistencia.push({ cantidad: vistos.size, fecha: e.fecha });
      }
    }
  }

  // Memoria: repasos hechos.
  hitos.repasos = [...repasos].sort((a, b) => a.getTime() - b.getTime()).map((fecha, i) => ({ cantidad: i + 1, fecha }));

  const logros: Logro[] = [];
  for (const esc of ESCALERAS) {
    const h = hitos[esc.base];
    const actual = maximo(h);
    esc.metas.forEach((meta, i) => {
      logros.push({
        clave: `${esc.base}-${NIVELES[i]}`,
        categoria: esc.categoria,
        titulo: esc.titulo(meta),
        descripcion: esc.descripcion(meta),
        nivel: NIVELES[i],
        obtenido: cuandoLlego(h, meta),
        progreso: { actual: Math.min(actual, meta), meta },
      });
    });
  }

  // Módulos: uno por módulo dominado por completo (como los parches de unidad de Khan Academy), y «Módulo en una
  // semana» si todas sus lecciones se dominaron dentro de los 7 días siguientes a la primera entrega en él.
  const modulos = new Map<number, { titulo: string; lecciones: LeccionParaLogros[] }>();
  for (const l of lecciones) {
    if (!modulos.has(l.moduloId)) modulos.set(l.moduloId, { titulo: l.moduloTitulo, lecciones: [] });
    modulos.get(l.moduloId)!.lecciones.push(l);
  }
  let rapidos = 0;
  let primerRapido: Date | null = null;
  for (const [id, m] of modulos) {
    const dominadas = m.lecciones.filter((l) => l.mastery >= DOMINIO_LOGRO);
    const completo = m.lecciones.length > 0 && dominadas.length === m.lecciones.length;
    const fin = completo ? new Date(Math.max(...m.lecciones.map((l) => l.fecha?.getTime() ?? 0))) : null;
    logros.push({
      clave: `modulo-${id}`,
      categoria: 'dominio',
      titulo: `Dominaste «${m.titulo}»`,
      descripcion: `Domina las ${m.lecciones.length} lecciones del módulo.`,
      nivel: null,
      obtenido: fin ? fin.toISOString() : null,
      progreso: { actual: dominadas.length, meta: m.lecciones.length },
    });
    if (fin) {
      const unidades = new Set(m.lecciones.map((l) => l.learningUnitId));
      const primera = entregas.filter((e) => unidades.has(e.learningUnitId)).reduce<Date | null>((min, e) => (!min || e.fecha < min ? e.fecha : min), null);
      if (primera && fin.getTime() - primera.getTime() <= 7 * 86_400_000) {
        rapidos++;
        if (!primerRapido || fin < primerRapido) primerRapido = fin;
      }
    }
  }
  logros.push({
    clave: 'modulo-en-una-semana',
    categoria: 'dominio',
    titulo: 'Módulo en una semana',
    descripcion: 'Domina todas las lecciones de un módulo en los 7 días siguientes a tu primera entrega en él.',
    nivel: null,
    obtenido: primerRapido ? primerRapido.toISOString() : null,
    progreso: { actual: Math.min(rapidos, 1), meta: 1 },
  });

  return logros;
}

/**
 * La meta más cercana que aún no tiene, para el inicio: la de mayor avance proporcional (sin contar las que no ha
 * empezado). Una sola, para no abrumar.
 */
export function siguienteLogro(logros: ReadonlyArray<Logro>): Logro | null {
  const pendientes = logros.filter((l) => !l.obtenido && l.progreso.actual > 0);
  const candidatos = pendientes.length ? pendientes : logros.filter((l) => !l.obtenido && (l.nivel === 'bronce' || l.nivel === null));
  return [...candidatos].sort((a, b) => b.progreso.actual / b.progreso.meta - a.progreso.actual / a.progreso.meta)[0] ?? null;
}
