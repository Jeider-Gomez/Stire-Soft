import type { RunResult } from './sandbox-adapter.interface';

// P61, versión sin IA (Jeider, 03/11, evaluación heurística, pregunta 37): al entregar, el estudiante veía «Pasaron 1 de
// 3 casos» y qué casos fallaron, pero no qué revisar, y de un caso oculto no ve ningún dato. Aquí se reconoce el tipo de
// diferencia del primer caso que falla y se da una orientación GENERAL: nunca la entrada, la salida esperada ni lo que
// mostró el programa, para que valga también en los ocultos y no dé la solución. Los mismos errores de concepto que
// reconoce «Probar código» (frontend-nuxt/utils/diagnosticoSalida.ts), pero sin valores.

const sinEspacios = (t: string) => t.replace(/\s+/g, '');
const sinSignos = (t: string) => t.replace(/[.,;:¡!¿?«»"'()]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const numero = (t: string): number | null => {
  const s = t.trim().replace(',', '.');
  return s !== '' && /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
};

function orientarError(stderr: string): string {
  const tipo = /^([A-Za-z]*Error)/.exec(stderr.trim())?.[1];
  if (tipo === 'SyntaxError') {
    return 'hay un error de escritura en el código (un paréntesis, una llave o una comilla sin cerrar, o un signo de más). Usa «Probar código» para ver en qué línea.';
  }
  if (tipo === 'ReferenceError') {
    return 'usas un nombre que no existe. Revisa que esté escrito igual que donde lo creaste, con las mismas mayúsculas.';
  }
  if (tipo === 'TypeError') {
    return 'usas un dato de una forma que no permite, por ejemplo un valor vacío o un texto como si fuera otra cosa. Revisa que leas cada dato antes de usarlo.';
  }
  return 'tu programa se detuvo con un error. Pruébalo con «Probar código» para ver el mensaje y la línea.';
}

/** Qué revisar en un caso que falló, sin ningún dato del caso. null si el caso pasó. */
export function orientacionDeFallo(
  resultado: Pick<RunResult, 'status' | 'stdout' | 'stderr'>,
  caso: { input?: unknown; expected?: unknown },
): string | null {
  if (resultado.status === 'accepted') return null;
  if (resultado.status === 'time_limit') {
    return 'tu programa tardó demasiado. Si hay un ciclo, revisa que siempre llegue a terminar.';
  }
  if (resultado.status === 'runtime_error' || resultado.status === 'compile_error') return orientarError(resultado.stderr);

  const e = String(caso.expected ?? '').trim();
  const o = resultado.stdout.trim();
  if (o === '') {
    return 'tu programa no mostró nada. Revisa que llegue a un console.log con el resultado en todos los caminos (también dentro de cada if o else).';
  }
  if (/\bNaN\b/.test(o) && !/\bNaN\b/.test(e)) {
    return 'salió NaN («no es un número»): una cuenta usó un dato que no es número. Revisa que conviertas los datos con Number(...) o que uses leerNumero().';
  }
  if (/\bundefined\b/.test(o) && !/\bundefined\b/.test(e)) {
    return 'salió undefined: mostraste algo que está vacío. Revisa que leas todos los datos, en orden, antes de usarlos.';
  }
  const datos = String(caso.input ?? '').split(/\s+/).filter(Boolean);
  if (datos.length >= 2 && datos.every((d) => numero(d) !== null) && o === datos.join('') && numero(e) !== null) {
    return 'los números se juntaron como texto en vez de sumarse. Lo que llega de la entrada es texto: conviértelo a número antes de operar.';
  }
  if (sinEspacios(e) === sinEspacios(o)) return 'casi: la diferencia está en espacios o saltos de línea.';
  if (e.toLowerCase() === o.toLowerCase()) return 'casi: cambia alguna mayúscula o minúscula. La salida debe ser exactamente igual.';
  if (sinSignos(e) === sinSignos(o)) return 'casi: falta o sobra un signo (punto, coma, dos puntos…).';

  const ne = numero(e);
  const no = numero(o);
  if (ne !== null && no !== null) {
    if (Math.abs(ne - no) === 1) return 'el número se pasa o se queda corto por 1. Si hay un ciclo, revisa dónde empieza y dónde termina (¿< o <=?).';
    if (Math.trunc(ne) === Math.trunc(no) || Math.round(ne) === Math.round(no)) {
      return 'el número es cercano pero no igual: revisa los decimales, la división o el redondeo.';
    }
    return 'el número no es el esperado. Revisa la operación y el orden en que haces los pasos.';
  }
  const lineasE = e.split('\n').length;
  const lineasO = o.split('\n').length;
  if (lineasO !== lineasE) {
    return `tu programa mostró ${lineasO < lineasE ? 'menos' : 'más'} líneas de las que pide el enunciado. Revisa cuántas veces escribes con console.log.`;
  }
  return 'lo que muestra tu programa no coincide. Piensa qué tiene de distinto este caso (su nombre da una pista) y pruébalo con «Probar con mis datos».';
}
