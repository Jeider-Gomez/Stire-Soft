/**
 * Reglas de «Proyectos» (docs/DISENO_PROYECTOS.md): el espacio de programación propio del estudiante. Todo lo que se
 * guarda pasa por aquí; los límites están pensados para ser prácticos (el código pesa muy poco) y para que 100
 * estudiantes con todo lleno ocupen ~0,4 GB.
 */

export const LIMITES_PROYECTOS = {
  proyectosPorUsuario: 20,
  archivosPorProyecto: 10,
  bytesPorProyecto: 200 * 1024,
  largoTitulo: 100,
} as const;

export const TIPOS_PROYECTO = ['web', 'javascript'] as const;
export type TipoProyecto = (typeof TIPOS_PROYECTO)[number];

export interface ArchivoProyecto {
  nombre: string;
  contenido: string;
}

/** Extensiones permitidas por tipo: solo texto, sin imágenes ni binarios. */
const EXTENSIONES: Record<TipoProyecto, string[]> = {
  web: ['html', 'css', 'js', 'txt'],
  javascript: ['js', 'txt'],
};

const NOMBRE = /^[A-Za-z0-9_-]{1,40}\.([a-z]{1,4})$/;

export class ProyectoInvalidoError extends Error {}

export function esTipoProyecto(valor: unknown): valor is TipoProyecto {
  return typeof valor === 'string' && (TIPOS_PROYECTO as readonly string[]).includes(valor);
}

/** Tamaño real en bytes (UTF-8) de lo que ocupa el proyecto. */
export function bytesDeArchivos(archivos: ArchivoProyecto[]): number {
  return archivos.reduce((total, a) => total + Buffer.byteLength(a.nombre, 'utf8') + Buffer.byteLength(a.contenido, 'utf8'), 0);
}

export function validarTitulo(titulo: unknown): string {
  if (typeof titulo !== 'string' || !titulo.trim()) throw new ProyectoInvalidoError('Ponle un nombre al proyecto.');
  const limpio = titulo.trim();
  if (limpio.length > LIMITES_PROYECTOS.largoTitulo) {
    throw new ProyectoInvalidoError(`El nombre admite como máximo ${LIMITES_PROYECTOS.largoTitulo} caracteres.`);
  }
  return limpio;
}

/** Valida y normaliza la lista de archivos que manda la pantalla. Lanza con el motivo, en palabras del estudiante. */
export function validarArchivos(tipo: TipoProyecto, entrada: unknown): ArchivoProyecto[] {
  if (!Array.isArray(entrada) || entrada.length === 0) throw new ProyectoInvalidoError('El proyecto necesita al menos un archivo.');
  if (entrada.length > LIMITES_PROYECTOS.archivosPorProyecto) {
    throw new ProyectoInvalidoError(`Un proyecto admite como máximo ${LIMITES_PROYECTOS.archivosPorProyecto} archivos.`);
  }
  const vistos = new Set<string>();
  const archivos = entrada.map((a: unknown) => {
    const { nombre, contenido } = (typeof a === 'object' && a !== null ? a : {}) as Record<string, unknown>;
    if (typeof nombre !== 'string' || typeof contenido !== 'string') throw new ProyectoInvalidoError('Cada archivo necesita nombre y contenido.');
    const m = NOMBRE.exec(nombre);
    if (!m) {
      throw new ProyectoInvalidoError(`«${nombre}» no es un nombre válido: usa letras, números, guion o guion bajo y una extensión (index.html).`);
    }
    if (!EXTENSIONES[tipo].includes(m[1])) {
      throw new ProyectoInvalidoError(`Un proyecto ${tipo === 'web' ? 'web' : 'de JavaScript'} admite archivos ${EXTENSIONES[tipo].map((e) => '.' + e).join(', ')}.`);
    }
    if (vistos.has(nombre.toLowerCase())) throw new ProyectoInvalidoError(`Hay dos archivos llamados «${nombre}».`);
    vistos.add(nombre.toLowerCase());
    return { nombre, contenido };
  });
  if (bytesDeArchivos(archivos) > LIMITES_PROYECTOS.bytesPorProyecto) {
    throw new ProyectoInvalidoError('El proyecto pasa de 200 KB. Divide el código o borra lo que no uses.');
  }
  return archivos;
}

/** Archivos con los que arranca un proyecto nuevo. */
export function plantillaInicial(tipo: TipoProyecto, titulo: string): ArchivoProyecto[] {
  if (tipo === 'javascript') {
    return [{ nombre: 'main.js', contenido: `// ${titulo}\n// Lee la entrada con leerEntrada() y muestra resultados con console.log().\nconst entrada = leerEntrada();\nconsole.log('Hola, ' + (entrada || 'mundo'));\n` }];
  }
  return [
    { nombre: 'index.html', contenido: `<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="utf-8">\n  <title>${titulo.replace(/[<>&"]/g, '')}</title>\n</head>\n<body>\n  <h1>${titulo.replace(/[<>&"]/g, '')}</h1>\n  <p>Edita index.html, estilos.css y script.js.</p>\n</body>\n</html>\n` },
    { nombre: 'estilos.css', contenido: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n' },
    { nombre: 'script.js', contenido: "console.log('Tu página está lista');\n" },
  ];
}

/**
 * ¿Puede este usuario usar Proyectos? Mientras está en prueba («piloto»), solo docentes, administradores y estudiantes
 * matriculados en una clase piloto (PROYECTOS_CLASES_PILOTO). «todos» lo abre a todos; «apagado» lo cierra.
 */
export function accesoAProyectos(opciones: {
  modo: string | undefined;
  rol: string;
  codigosDeSusClases: string[];
  clasesPiloto: string | undefined;
}): boolean {
  const modo = (opciones.modo ?? 'piloto').trim().toLowerCase();
  if (modo === 'apagado') return false;
  if (modo === 'todos') return true;
  if (opciones.rol === 'docente' || opciones.rol === 'admin' || opciones.rol === 'administrador') return true;
  const piloto = new Set((opciones.clasesPiloto ?? '').split(',').map((c) => c.trim().toUpperCase()).filter(Boolean));
  return opciones.codigosDeSusClases.some((c) => piloto.has(c.toUpperCase()));
}
