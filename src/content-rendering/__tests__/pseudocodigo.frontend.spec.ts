import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Pseudocódigo ejecutable en Proyectos (docs/DISENO_PROYECTOS.md, fase 4). Se prueba el archivo real de frontend-nuxt:
// se traduce el algoritmo y el JavaScript resultante se corre como lo haría el Worker (leerEntrada y console.log).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
const js = ts.transpileModule(leer('utils', 'pseudocodigo.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);

type Traduccion = { ok: true; js: string } | { ok: false; error: { linea: number; mensaje: string } };
const { traducirPseudocodigo, algoritmoDeEjemplo } = mod.exports as {
  traducirPseudocodigo: (f: string) => Traduccion;
  algoritmoDeEjemplo: (t?: string) => string;
};

/** Traduce y ejecuta; devuelve lo escrito o el error, como lo vería el estudiante. */
function correr(fuente: string, entrada = ''): { salida: string[]; error?: string } {
  const t = traducirPseudocodigo(fuente);
  if (!t.ok) return { salida: [], error: `Línea ${t.error.linea}: ${t.error.mensaje}` };
  const salida: string[] = [];
  try {
    new Function('leerEntrada', 'console', t.js)(() => entrada, { log: (x: string) => salida.push(x) });
    return { salida };
  } catch (e) {
    const err = e as Error;
    return { salida, error: `${err.name}: ${err.message}` };
  }
}

describe('Pseudocódigo ejecutable', () => {
  it('corre los algoritmos del curso: las vueltas de una compra y los billetes', () => {
    expect(correr('Algoritmo Vueltas\n    Leer precio\n    Leer pago\n    vueltas <- pago - precio\n    Escribir "Sus vueltas son: ", vueltas\nFinAlgoritmo', '3500\n5000'))
      .toEqual({ salida: ['Sus vueltas son: 1500'] });
    expect(correr('Algoritmo Billetes\nLeer monto\nbilletes <- trunc(monto / 10000)\nresto <- monto MOD 10000\nEscribir "Billetes: ", billetes\nEscribir "Sobran: ", resto\nFinAlgoritmo', '45000'))
      .toEqual({ salida: ['Billetes: 4', 'Sobran: 5000'] });
  });

  it('Si/SiNo con «=» para comparar, y Y, O, NO', () => {
    const par = 'Algoritmo ParImpar\nLeer n\nSi n MOD 2 = 0 Entonces\n    Escribir "Par"\nSiNo\n    Escribir "Impar"\nFinSi\nFinAlgoritmo';
    expect(correr(par, '8').salida).toEqual(['Par']);
    expect(correr(par, '7').salida).toEqual(['Impar']);
    expect(correr('Algoritmo L\nLeer e\nSi e >= 18 Y NO e > 120 O e = 0 Entonces\nEscribir "ok"\nFinSi\nFinAlgoritmo', '20').salida).toEqual(['ok']);
  });

  it('Mientras, Repetir…Hasta Que y Para (también hacia atrás y con paso)', () => {
    expect(correr('Algoritmo M\ni <- 1\nMientras i <= 3 Hacer\nEscribir i\ni <- i + 1\nFinMientras\nFinAlgoritmo').salida).toEqual(['1', '2', '3']);
    expect(correr('Algoritmo R\nRepetir\nLeer clave\nHasta Que clave = 1234\nEscribir "Entró"\nFinAlgoritmo', '1\n99\n1234').salida).toEqual(['Entró']);
    expect(correr('Algoritmo P\nsuma <- 0\nPara i <- 1 Hasta 10 Con Paso 3 Hacer\nsuma <- suma + i\nFinPara\nEscribir suma\nFinAlgoritmo').salida).toEqual(['22']);
    expect(correr('Algoritmo P\nPara i <- 3 Hasta 1 Hacer\nEscribir i Sin Saltar\nFinPara\nFinAlgoritmo').salida).toEqual(['321']);
  });

  it('Segun con varios valores por caso y De Otro Modo; un «Escribir "Total: "» dentro no se toma por caso', () => {
    const f = 'Algoritmo Dia\nLeer d\nSegun d Hacer\n    1, 7: Escribir "Fin de semana"\n    2:\n        Escribir "Total: ", d\n    De Otro Modo:\n        Escribir "Entre semana"\nFinSegun\nFinAlgoritmo';
    expect(correr(f, '7').salida).toEqual(['Fin de semana']);
    expect(correr(f, '2').salida).toEqual(['Total: 2']);
    expect(correr(f, '4').salida).toEqual(['Entre semana']);
  });

  it('Definir convierte lo que se lee y avisa si el dato no es del tipo', () => {
    expect(correr('Algoritmo T\nDefinir nombre Como Caracter\nLeer nombre\nEscribir "Hola, ", nombre\nFinAlgoritmo', '007').salida).toEqual(['Hola, 007']);
    expect(correr('Algoritmo T\nDefinir n Como Entero\nLeer n\nFinAlgoritmo', '2.5').error).toBe('Error en la línea 3: «n» es Entero y recibió "2.5".');
    expect(correr('Algoritmo T\nDefinir ok Como Logico\nok <- 3 > 2\nEscribir ok\nFinAlgoritmo').salida).toEqual(['VERDADERO']);
  });

  it('arreglos con Dimension', () => {
    expect(correr('Algoritmo A\nDimension notas[3]\nPara i <- 1 Hasta 3 Hacer\nLeer notas[i]\nFinPara\nEscribir notas[1] + notas[3]\nFinAlgoritmo', '4\n2\n5').salida).toEqual(['9']);
    expect(correr('Algoritmo A\nDimension v[2]\nv[5] <- 1\nFinAlgoritmo').error).toContain('fuera de «v»');
  });

  it('los errores dicen la línea y qué pasó, en palabras del estudiante', () => {
    expect(correr('Leer x').error).toBe('Línea 1: Todo algoritmo empieza con «Algoritmo Nombre».');
    expect(correr('Algoritmo A\nSi x > 1 Entonces\nEscribir x\nFinAlgoritmo').error).toBe('Línea 2: Falta «FinSi» para el Si de esta línea.');
    expect(correr('Algoritmo A\nSi 1 > 0\nFinSi\nFinAlgoritmo').error).toContain('Falta «Entonces»');
    expect(correr('Algoritmo A\nMientras 1 > 0 Hacer\nFinPara\nFinAlgoritmo').error).toBe('Línea 3: Este «FinPara» no corresponde: el Mientras de la línea 2 se cierra con «FinMientras».');
    expect(correr('Algoritmo A\nEscribir total\nFinAlgoritmo').error).toBe('Error en la línea 2: «total» todavía no tiene un valor: asígnale uno o léelo antes de usarlo.');
    expect(correr('Algoritmo A\nLeer a\nFinAlgoritmo').error).toContain('no hay más datos en la Entrada');
    expect(correr('Algoritmo A\nSi x <- 1 Entonces\nFinSi\nFinAlgoritmo').error).toContain('La flecha «<-» guarda un valor');
    expect(correr('Algoritmo A\nx <- potencia(2)\nFinAlgoritmo').error).toContain('No conozco la función «potencia»');
    expect(correr('Algoritmo A\nhola mundo\nFinAlgoritmo').error).toContain('No entiendo esta instrucción');
  });

  it('las palabras clave no distinguen mayúsculas ni tildes, y los comentarios y textos con // no estorban', () => {
    expect(correr('ALGORITMO a\n  escribir "http://x" // saludo\n  según 1 hacer\n    1: mostrar "uno"\n  finsegun\nfinalgoritmo').salida).toEqual(['http://x', 'uno']);
  });

  it('el algoritmo de ejemplo de un proyecto nuevo corre', () => {
    expect(correr(algoritmoDeEjemplo('Mi primer algoritmo'), 'Ana').salida).toEqual(['Hola, Ana']);
    expect(algoritmoDeEjemplo('Mi primer algoritmo')).toMatch(/^Algoritmo MiPrimerAlgoritmo\n/);
  });
});
