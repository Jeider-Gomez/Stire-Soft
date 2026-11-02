import { codigoConLineas } from './tutor-context.service';

// 01/11, probando como Santiago: el Tutor dijo «tu línea 3» en un código de 2 líneas. El ejemplo del prompt decía «en tu línea 3»
// y el código le llegaba sin numerar, así que contaba a ojo.
describe('El código llega al Tutor numerado como en el editor', () => {
  it('cada línea lleva su número', () => {
    expect(codigoConLineas('const a = 1;\nconsole.log(a);', 1500)).toBe('1| const a = 1;\n2| console.log(a);');
  });

  it('una línea en blanco arriba también cuenta, como en el editor', () => {
    expect(codigoConLineas('\nconst a = 1;', 1500)).toBe('1| \n2| const a = 1;');
  });

  it('las líneas en blanco del final no cuentan, y los saltos de Windows no estorban', () => {
    expect(codigoConLineas('a\r\nb\r\n\r\n', 1500)).toBe('1| a\n2| b');
  });

  it('corta por línea entera sin cambiar la numeración', () => {
    expect(codigoConLineas('aaaa\nbbbb\ncccc', 10)).toBe('1| aaaa\n2| bbbb');
  });

  it('una sola línea enorme también respeta el límite', () => {
    expect(codigoConLineas('x'.repeat(50), 10)).toBe(`1| ${'x'.repeat(10)}`);
  });
});
