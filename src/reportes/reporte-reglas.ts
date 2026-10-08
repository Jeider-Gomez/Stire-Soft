/** Reportes desde la app (docs/calidad/PRUEBA_DOS_SEMANAS.md). Funciones puras: el servicio las aplica. */

export const TIPOS_REPORTE = ['problema', 'confuso', 'idea'] as const;
export type TipoReporte = (typeof TIPOS_REPORTE)[number];
export const ESTADOS_REPORTE = ['nuevo', 'visto', 'resuelto', 'descartado'] as const;
export type EstadoReporte = (typeof ESTADOS_REPORTE)[number];

export const LIMITES_REPORTE = { textoMinimo: 5, textoMaximo: 2000, ruta: 300, dispositivo: 300, nota: 1000, porDia: 30 } as const;

export class ReporteInvalidoError extends Error {}

export interface DatosReporte {
  tipo: TipoReporte;
  gravedad: number | null;
  texto: string;
  ruta: string;
  dispositivo: string;
}

export function validarReporte(entrada: Record<string, unknown>): DatosReporte {
  const tipo = entrada.tipo as TipoReporte;
  if (!(TIPOS_REPORTE as readonly string[]).includes(tipo)) throw new ReporteInvalidoError('Elige si es un problema, algo confuso o una idea.');
  const texto = typeof entrada.texto === 'string' ? entrada.texto.trim() : '';
  if (texto.length < LIMITES_REPORTE.textoMinimo) throw new ReporteInvalidoError('Cuéntanos un poco más de lo que pasó.');
  if (texto.length > LIMITES_REPORTE.textoMaximo) throw new ReporteInvalidoError(`Máximo ${LIMITES_REPORTE.textoMaximo} caracteres.`);
  let gravedad: number | null = null;
  if (tipo !== 'idea') {
    gravedad = Number(entrada.gravedad ?? 2);
    if (![1, 2, 3].includes(gravedad)) throw new ReporteInvalidoError('La gravedad es 1 (detalle), 2 (confunde) o 3 (no me deja seguir).');
  }
  // La ruta y el dispositivo los anota la app; se recortan y se guardan como texto plano.
  const ruta = String(entrada.ruta ?? '').slice(0, LIMITES_REPORTE.ruta);
  if (!ruta.startsWith('/')) throw new ReporteInvalidoError('Falta la pantalla donde estabas.');
  const dispositivo = String(entrada.dispositivo ?? '').slice(0, LIMITES_REPORTE.dispositivo);
  return { tipo, gravedad, texto, ruta, dispositivo };
}

export function validarRevision(entrada: Record<string, unknown>): { estado: EstadoReporte; nota: string | null } {
  const estado = entrada.estado as EstadoReporte;
  if (!(ESTADOS_REPORTE as readonly string[]).includes(estado)) throw new ReporteInvalidoError('Estado no válido.');
  const nota = typeof entrada.nota === 'string' && entrada.nota.trim() ? entrada.nota.trim().slice(0, LIMITES_REPORTE.nota) : null;
  // Resolver sin decir cómo no le sirve a quien lo envió ni al equipo después (07/10).
  if (estado === 'resuelto' && !nota) throw new ReporteInvalidoError('Escribe cómo se resolvió: lo lee quien lo envió.');
  return { estado, nota };
}

/**
 * El aviso opcional a quien envió la sugerencia cuando el equipo la revisa (08/10, Jeider: que sepa que su sugerencia
 * se resolvió, se revisó o su idea se tomó en cuenta, y pueda leer lo que el equipo escribió). Lleva a su inicio con
 * «Lo que he enviado» abierto (?sugerencias=mias). La clave evita avisar dos veces el mismo cambio.
 */
export function avisoDeRevision(r: { id: number; texto: string; estado: EstadoReporte; nota: string | null; rol: string }): {
  titulo: string;
  mensaje: string;
  enlace: string;
  clave: string;
} | null {
  if (r.estado === 'nuevo') return null;
  const titulo = r.estado === 'resuelto' ? 'Tu sugerencia ya está resuelta' : r.estado === 'visto' ? 'El equipo revisó tu sugerencia' : 'El equipo respondió tu sugerencia';
  const corto = r.texto.length > 80 ? `${r.texto.slice(0, 77).trimEnd()}…` : r.texto;
  const respuesta = r.nota ? ` Respuesta: ${r.nota.length > 160 ? `${r.nota.slice(0, 157).trimEnd()}…` : r.nota}` : '';
  const inicio = r.rol === 'docente' ? '/docente' : r.rol === 'admin' ? '/admin' : '/estudiante';
  return { titulo, mensaje: `«${corto}».${respuesta}`, enlace: `${inicio}?sugerencias=mias`, clave: `sugerencia-${r.id}-${r.estado}` };
}
