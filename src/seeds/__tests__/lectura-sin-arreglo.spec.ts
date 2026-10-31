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

  it('en la unidad 1 los ejercicios de programar piden el dato con leerTexto() o leerNumero()', () => {
    const programar = ejerciciosDe(0).filter((e) => e.tipo === 'coding');
    expect(programar.length).toBeGreaterThan(0);
    for (const e of programar) {
      expect(codigoDe(e).join('\n')).toMatch(/leer(Texto|Numero)\(\)/);
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
