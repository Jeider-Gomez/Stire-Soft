import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Diagramas de flujo ejecutables (docs/DISENO_PROYECTOS.md, fase 4). Se prueban los archivos reales de frontend-nuxt.
function cargar(archivo: string): Record<string, unknown> {
  const file = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', archivo);
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (r: string) => cargar(r.replace(/^\.\//, '') + '.ts'));
  return mod.exports;
}
type Figura = { id: string; tipo: string; texto: string; x: number; y: number; siguiente?: string | null; si?: string | null; no?: string | null };
type Diagrama = { version: 1; figuras: Figura[] };
const { traducirDiagrama, diagramaInicial, leerDiagrama } = cargar('diagramaFlujo.ts') as {
  traducirDiagrama: (d: Diagrama) => { ok: true; js: string } | { ok: false; error: { figura: number; figuraId: string | null; mensaje: string } };
  diagramaInicial: () => Diagrama;
  leerDiagrama: (j: string) => { ok: true; diagrama: Diagrama } | { ok: false; mensaje: string };
};

function correr(d: Diagrama, entrada = ''): { salida: string[]; error?: string } {
  const t = traducirDiagrama(d);
  if (!t.ok) return { salida: [], error: `Figura ${t.error.figura}: ${t.error.mensaje}` };
  const salida: string[] = [];
  try {
    new Function('leerEntrada', 'console', t.js)(() => entrada, { log: (x: string) => salida.push(x) });
    return { salida };
  } catch (e) {
    const err = e as Error;
    return { salida, error: `${err.name}: ${err.message}` };
  }
}
const f = (id: string, tipo: string, texto: string, mas: Partial<Figura> = {}): Figura => ({ id, tipo, texto, x: 0, y: 0, ...mas });

describe('Diagrama de flujo ejecutable', () => {
  it('el diagrama de un proyecto nuevo corre: lee un nombre y saluda', () => {
    expect(correr(diagramaInicial(), 'Ana')).toEqual({ salida: ['Hola, Ana'] });
  });

  it('el rombo decide por el Sí o por el No (el algoritmo «Votar» del curso)', () => {
    const votar: Diagrama = { version: 1, figuras: [
      f('i', 'inicio', 'Inicio', { siguiente: 'e' }),
      f('e', 'entrada', 'edad', { siguiente: 'd' }),
      f('d', 'decision', 'edad >= 18', { si: 's1', no: 's2' }),
      f('s1', 'salida', '"Puede votar"', { siguiente: 'fin' }),
      f('s2', 'salida', '"Aún no"', { siguiente: 'fin' }),
      f('fin', 'fin', 'Fin'),
    ] };
    expect(correr(votar, '20').salida).toEqual(['Puede votar']);
    expect(correr(votar, '15').salida).toEqual(['Aún no']);
  });

  it('una flecha que vuelve atrás hace un ciclo, y un proceso admite varias líneas', () => {
    const contar: Diagrama = { version: 1, figuras: [
      f('i', 'inicio', '', { siguiente: 'p' }),
      f('p', 'proceso', 'i <- 1\nsuma <- 0', { siguiente: 'd' }),
      f('d', 'decision', 'i <= 4', { si: 'q', no: 's' }),
      f('q', 'proceso', 'suma <- suma + i\ni <- i + 1', { siguiente: 'd' }),
      f('s', 'salida', '"Suma: ", suma', { siguiente: 'fin' }),
      f('fin', 'fin', ''),
    ] };
    expect(correr(contar).salida).toEqual(['Suma: 10']);
  });

  it('lo que falta en el dibujo se dice con la figura, antes de ejecutar', () => {
    const base = diagramaInicial();
    const sinFlecha = { ...base, figuras: base.figuras.map((x) => (x.id === 'leer' ? { ...x, siguiente: null } : x)) };
    expect(correr(sinFlecha).error).toBe('Figura 2: A la Entrada 2 («nombre») le falta la flecha que sale.');
    expect(correr({ version: 1, figuras: base.figuras.filter((x) => x.tipo !== 'inicio') }).error).toContain('Falta la figura de Inicio');
    expect(correr({ version: 1, figuras: [...base.figuras, f('i2', 'inicio', '', { siguiente: 'fin' })] }).error).toContain('más de un Inicio');
    const rombo: Diagrama = { version: 1, figuras: [f('i', 'inicio', '', { siguiente: 'd' }), f('d', 'decision', 'x > 1', { si: 'fin' }), f('fin', 'fin', '')] };
    expect(correr(rombo).error).toContain('le falta la flecha del «No»');
    const malo: Diagrama = { version: 1, figuras: [f('i', 'inicio', '', { siguiente: 'p' }), f('p', 'proceso', 'hola mundo', { siguiente: 'fin' }), f('fin', 'fin', '')] };
    expect(correr(malo).error).toContain('Un proceso guarda un valor');
  });

  it('un error al ejecutar dice en qué figura pasó; un ciclo sin fin se corta con un mensaje claro', () => {
    const sinValor: Diagrama = { version: 1, figuras: [f('i', 'inicio', '', { siguiente: 's' }), f('s', 'salida', 'total', { siguiente: 'fin' }), f('fin', 'fin', '')] };
    expect(correr(sinValor).error).toBe('Error en la figura 2: «total» todavía no tiene un valor: asígnale uno o léelo antes de usarlo.');
    const eterno: Diagrama = { version: 1, figuras: [f('i', 'inicio', '', { siguiente: 'p' }), f('p', 'proceso', 'x <- 1', { siguiente: 'p' }), f('fin', 'fin', '')] };
    expect(correr(eterno).error).toContain('más de 100 000 pasos');
  });

  it('el archivo se lee con cuidado: lo que no es un diagrama se rechaza sin romper', () => {
    expect(leerDiagrama('{nope')).toEqual({ ok: false, mensaje: 'El archivo del diagrama está dañado (no es JSON válido).' });
    expect(leerDiagrama('{"version":1,"figuras":[{"id":"a b","tipo":"inicio"}]}').ok).toBe(false);
    const ok = leerDiagrama(JSON.stringify(diagramaInicial()));
    expect(ok.ok && ok.diagrama.figuras).toHaveLength(4);
    // Una flecha a algo que no es un identificador se descarta (queda sin flecha, y la validación lo dirá).
    const raro = leerDiagrama('{"version":1,"figuras":[{"id":"i","tipo":"inicio","siguiente":"</script>"}]}');
    expect(raro.ok && raro.diagrama.figuras[0].siguiente).toBeNull();
  });
});
