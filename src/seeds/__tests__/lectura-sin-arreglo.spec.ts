import { cursoFundamentos203413 } from '../cursos/fundamentos-203413';
import { Ejercicio } from '../cursos/tipos';

// 31/10, Jeider en «Saludo personalizado»: «un arreglo que no sé ni qué es». Los ejercicios básicos piden el dato con
// leerTexto() o leerNumero() (src/judge-engine/sandbox-lectura.ts); `lineas` solo queda donde se recorre la entrada
// con un ciclo. Que sus soluciones sigan calificando bien lo comprueba cursos-pedagogicos.spec.ts con el juez real.
const codigoDe = (e: Ejercicio): string[] =>
  [(e as { inicial?: string }).inicial, (e as { solucion?: string }).solucion, (e as { errorComun?: string }).errorComun, (e as { plantilla?: string }).plantilla].filter(
    (c): c is string => typeof c === 'string',
  );

const ejerciciosDe = (seccion: number): Ejercicio[] =>
  cursoFundamentos203413.secciones[seccion].temas.flatMap((t) => t.unidades.flatMap((u) => u.ejercicios));

describe('Los ejercicios básicos no obligan a leer un arreglo', () => {
  it('en la unidad 1 ningún ejercicio trae `lineas` ni las líneas de lectura de archivo', () => {
    const con = ejerciciosDe(0).filter((e) => codigoDe(e).some((c) => /\blineas\b|readFileSync/.test(c)));
    expect(con.map((e) => e.titulo)).toEqual([]);
  });

  it('en la unidad 1 los ejercicios de programar que reciben un dato lo piden con leerTexto() o leerNumero()', () => {
    const conDato = ejerciciosDe(0).filter((e) => e.tipo === 'coding' && (e as { casos: Array<{ entrada: string }> }).casos.some((c) => c.entrada !== ''));
    expect(conDato.length).toBeGreaterThan(0);
    for (const e of conDato) {
      expect(codigoDe(e).join(String.fromCharCode(10))).toMatch(/leer(Texto|Numero)\(\)/);
    }
  });

  // 31/10 (Jeider, «Saludo personalizado»: «no sabía que había que hacer un console.log»): antes de leer un dato, dos ejercicios sin entrada (P51).
  it('antes de «Saludo personalizado» hay dos ejercicios sin entrada: primero un console.log, luego una variable', () => {
    const titulos = ejerciciosDe(0).map((e) => e.titulo);
    const i = titulos.indexOf('Saludo personalizado');
    expect(titulos.indexOf('Tu primer console.log')).toBeGreaterThan(-1);
    expect(titulos.indexOf('Tu primer console.log')).toBeLessThan(titulos.indexOf('Un mensaje con una variable'));
    expect(titulos.indexOf('Un mensaje con una variable')).toBeLessThan(i);
    for (const t of ['Tu primer console.log', 'Un mensaje con una variable']) {
      const e = ejerciciosDe(0).find((x) => x.titulo === t) as unknown as { casos: Array<{ entrada: string; publico: boolean }>; enunciado: string; inicial: string };
      expect(e.casos.every((c) => c.entrada === '')).toBe(true);
      expect(e.casos.some((c) => c.publico)).toBe(true);
      expect(`${e.inicial}${e.enunciado}`).not.toMatch(/leer(Texto|Numero)|lineas|readFileSync/);
      expect(e.enunciado).toContain('console.log');
      expect(e.enunciado).toContain('1.');
    }
  });

  it('en la unidad 2, `lineas` queda solo donde se recorre la entrada con un ciclo', () => {
    const con = ejerciciosDe(1).filter((e) => codigoDe(e).some((c) => /\blineas\b/.test(c)));
    expect(con.length).toBeLessThan(10);
    for (const e of con) {
      expect(codigoDe(e).join('\n')).toMatch(/lineas\[i\]|lineas\.length|lineas\.slice/);
    }
  });

  it('el enunciado de «Saludo personalizado» va en pasos y no trae el marcador <nombre> que se escribe tal cual', () => {
    const saludo = ejerciciosDe(0).find((e) => e.titulo === 'Saludo personalizado');
    expect(saludo).toBeDefined();
    const enunciado = (saludo as { enunciado: string }).enunciado;
    expect(enunciado).not.toContain('<nombre>');
    expect(enunciado).toContain('1. **Lee**');
    expect(enunciado).toContain('2. **Muestra**');
    expect(enunciado).toContain('console.log');
  });
});

// 31/10, Jeider, viendo freeCodeCamp: «la pista me va diciendo qué me falta». Los casos de los ejercicios de la unidad 1 dicen qué comprueban.
describe('Los casos de los ejercicios básicos tienen nombre', () => {
  // Los ejercicios originales; las variantes que agrega el curso (conVariantes) todavía usan «Ejemplo n» y «Caso oculto n» (P54).
  const ORIGINALES = ['Tu primer console.log', 'Un mensaje con una variable', 'Saludo personalizado', 'Área y perímetro de un rectángulo', 'De minutos a horas'];
  const programar = ejerciciosDe(0).filter((e) => e.tipo === 'coding' && ORIGINALES.includes(e.titulo)) as Array<Ejercicio & { casos: Array<{ nombre?: string; publico: boolean }> }>;

  it('cada caso de la unidad 1 lleva un nombre que dice qué comprueba', () => {
    expect(programar.length).toBe(5);
    for (const e of programar) {
      for (const c of e.casos) expect((c.nombre ?? '').length).toBeGreaterThan(5);
    }
  });

  it('dentro de un ejercicio, los nombres no se repiten', () => {
    for (const e of programar) {
      const nombres = e.casos.map((c) => c.nombre);
      expect(new Set(nombres).size).toBe(nombres.length);
    }
  });

  it('el nombre llega a la configuración que guarda la app como la etiqueta del caso; sin nombre queda «Ejemplo n» o «Caso oculto n»', () => {
    const { aConfig } = jest.requireActual('../cursos/tipos') as { aConfig: (e: Ejercicio) => { testCases: Array<{ label: string }> } };
    const e = programar[0];
    expect(aConfig(e).testCases.map((t) => t.label)).toEqual(e.casos.map((c) => c.nombre));
    const sin = { ...e, casos: [{ entrada: 'a', salida: 'b', publico: true }, { entrada: 'c', salida: 'd', publico: false }] } as Ejercicio;
    expect(aConfig(sin).testCases.map((t) => t.label)).toEqual(['Ejemplo 1', 'Caso oculto 2']);
  });
});
