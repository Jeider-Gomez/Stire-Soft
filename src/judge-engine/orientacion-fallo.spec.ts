import { orientacionDeFallo } from './orientacion-fallo';
import { feedbackDeCasos } from './judge-execution.service';

// P61 sin IA: al entregar, cada fallo trae qué revisar, sin ningún dato del caso (vale también en los ocultos).
const mal = (stdout: string, stderr = '') => ({ status: 'wrong_answer' as const, stdout, stderr });

describe('orientacionDeFallo (P61): qué revisar sin revelar el caso', () => {
  it('un caso que pasa no trae orientación', () => {
    expect(orientacionDeFallo({ status: 'accepted', stdout: '8', stderr: '' }, { input: '5\n3', expected: '8' })).toBeNull();
  });

  it.each([
    ['no mostró nada', mal(''), { expected: 'Hola, Ana' }, /no mostró nada/],
    ['NaN', mal('NaN'), { expected: '8' }, /NaN/],
    ['undefined', mal('Hola, undefined'), { expected: 'Hola, Ana' }, /undefined/],
    ['números juntados', mal('53'), { input: '5\n3', expected: '8' }, /se juntaron como texto/],
    ['espacios', mal('Hola,Ana'), { expected: 'Hola, Ana' }, /espacios/],
    ['mayúsculas', mal('hola, ana'), { expected: 'Hola, Ana' }, /mayúscula/],
    ['signos', mal('Hola Ana'), { expected: 'Hola, Ana.' }, /signo/],
    ['por uno', mal('9'), { expected: '10' }, /por 1/],
    ['decimales', mal('3.3'), { expected: '3.33' }, /decimales/],
    ['otro número', mal('40'), { expected: '12' }, /operación/],
    ['líneas de menos', mal('Uno'), { expected: 'Uno\nDos' }, /menos líneas/],
    ['otra salida', mal('Adiós'), { expected: 'Hola' }, /no coincide/],
  ])('%s', (_n, resultado, caso, esperado) => {
    expect(orientacionDeFallo(resultado, caso)).toMatch(esperado);
  });

  it('explica el tipo de error y el tiempo agotado', () => {
    const err = (stderr: string) => orientacionDeFallo({ status: 'runtime_error', stdout: '', stderr }, { expected: '1' });
    expect(err("SyntaxError: missing ) after argument list (línea 2)")).toMatch(/error de escritura/);
    expect(err('ReferenceError: nombr is not defined (línea 1)')).toMatch(/nombre que no existe/);
    expect(err('TypeError: x.toUpperCase is not a function')).toMatch(/de una forma que no permite/);
    expect(err('RangeError: algo')).toMatch(/se detuvo con un error/);
    expect(orientacionDeFallo({ status: 'time_limit', stdout: '', stderr: '' }, { expected: '1' })).toMatch(/tardó demasiado/);
  });

  it('nunca incluye la entrada, la salida esperada ni lo que mostró el programa', () => {
    const casos: Array<[string, string, string]> = [
      ['Mariana\nMontería', 'Hola, Mariana de Montería', 'Hola, Mariana de Monteria'],
      ['17\n4', '21', '174'],
      ['250000', '297500', '297499'],
      ['7', 'Impar', 'impar'],
      ['3\n8\n1', 'El mayor es 8', 'El mayor es 3'],
    ];
    for (const [input, expected, stdout] of casos) {
      const t = orientacionDeFallo(mal(stdout), { input, expected }) ?? '';
      for (const dato of [...input.split('\n'), expected, stdout]) expect(t).not.toContain(dato);
    }
  });

  it('el resultado de la entrega agrega la orientación del primer caso que falló, por su nombre', () => {
    const f = feedbackDeCasos(
      [{ nombre: 'Suma pequeña', paso: true }, { nombre: 'Caso oculto', paso: false }],
      10, 20, 'wrong_answer',
      { caso: 'Caso oculto', texto: 'los números se juntaron como texto.' },
    );
    expect(f).toBe('Pasó 1 de 2 casos (10 de 20 puntos). ✓ Suma pequeña · ✗ Caso oculto. Qué revisar en «Caso oculto»: los números se juntaron como texto.');
  });
});
