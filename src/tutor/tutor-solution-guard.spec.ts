import { limitCodeBlocks, MAX_CODE_BLOCK_LINES, REDACTED_CODE_NOTICE } from './tutor-solution-guard';

const fence = (code: string) => '```javascript\n' + code + '\n```';

const COMPLETE_PROGRAM = [
  "const fs = require('fs');",
  "const n = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);",
  'let suma = 0;',
  'for (let i = 1; i <= n; i++) {',
  '  suma += i;',
  '}',
  'console.log(suma);',
].join('\n');

describe('barrera anti-solución (tope de código inteligente)', () => {
  it('deja pasar un ejemplo corto, aunque el estudiante no haya pedido código', () => {
    const reply = 'Así se ve un ciclo:\n' + fence('for (let i = 0; i < 3; i++) {\n  console.log(i);\n}') + '\n¿Qué imprime?';

    const result = limitCodeBlocks(reply);

    expect(result.redactedBlocks).toBe(0);
    expect(result.text).toBe(reply);
  });

  it('deja pasar un ejemplo explicativo de tamaño medio que no es un programa completo del ejercicio', () => {
    const example = Array.from({ length: 12 }, (_, i) => `const paso${i} = ${i};`).join('\n');

    expect(limitCodeBlocks(fence(example)).redactedBlocks).toBe(0);
  });

  it('omite un volcado de código larguísimo aunque no lea la entrada', () => {
    const dump = Array.from({ length: MAX_CODE_BLOCK_LINES + 1 }, (_, i) => `const x${i} = ${i};`).join('\n');

    const result = limitCodeBlocks('Aquí va todo:\n' + fence(dump));

    expect(result.redactedBlocks).toBe(1);
    expect(result.text).toContain(REDACTED_CODE_NOTICE);
    expect(result.text).not.toContain('const x0');
  });

  it('omite un programa completo que lee la entrada y la imprime (la forma de la solución de un ejercicio)', () => {
    const result = limitCodeBlocks('Prueba con esto:\n' + fence(COMPLETE_PROGRAM), { studentMessage: 'no me sale', studentCode: '' });

    expect(result.redactedBlocks).toBe(1);
    expect(result.text).toContain(REDACTED_CODE_NOTICE);
    expect(result.text).not.toContain('suma += i');
  });

  it('permite citar el código del propio estudiante para explicárselo (mayoría de líneas suyas)', () => {
    const result = limitCodeBlocks('Tu código hace lo siguiente:\n' + fence(COMPLETE_PROGRAM), {
      studentCode: COMPLETE_PROGRAM + '\n// mi comentario',
      studentMessage: 'explícame qué hace mi programa',
    });

    expect(result.redactedBlocks).toBe(0);
  });

  it('permite un bloque completo cuando el estudiante pegó código en su mensaje pidiendo que se lo expliquen', () => {
    const result = limitCodeBlocks(fence(COMPLETE_PROGRAM), {
      studentCode: '',
      studentMessage: 'Explícame este código:\n' + fence(COMPLETE_PROGRAM),
    });

    expect(result.redactedBlocks).toBe(0);
  });

  it('un fragmento corto que solo lee la entrada (menos de 5 líneas) no se considera solución', () => {
    const snippet = "const fs = require('fs');\nconst n = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);\nconsole.log(n);";

    expect(limitCodeBlocks(fence(snippet), { studentCode: '' }).redactedBlocks).toBe(0);
  });

  it('solo omite el bloque problemático y conserva el resto de la respuesta', () => {
    const reply = 'Idea:\n' + fence('let total = 0;') + '\nY así queda entero:\n' + fence(COMPLETE_PROGRAM) + '\nPruébalo.';

    const result = limitCodeBlocks(reply, { studentCode: '' });

    expect(result.redactedBlocks).toBe(1);
    expect(result.text).toContain('let total = 0;');
    expect(result.text).toContain('Pruébalo.');
    expect(result.text).not.toContain('suma += i');
  });

  it('trata un bloque sin cerrar (respuesta cortada por el límite de tokens) como un bloque más', () => {
    const dump = Array.from({ length: MAX_CODE_BLOCK_LINES + 5 }, (_, i) => `const y${i} = ${i};`).join('\n');

    const result = limitCodeBlocks('```javascript\n' + dump);

    expect(result.redactedBlocks).toBe(1);
    expect(result.text).toBe(REDACTED_CODE_NOTICE);
  });

  it('no toca respuestas sin bloques de código', () => {
    expect(limitCodeBlocks('Piensa en el caso base.')).toEqual({ text: 'Piensa en el caso base.', redactedBlocks: 0 });
  });
});

// Fase 26: en un ejercicio de HTML y CSS una página completa cabe en 10-20 líneas (por debajo del tope general) y no lee stdin.
describe('barrera anti-solución — ejercicios de HTML y CSS', () => {
  const htmlFence = (code: string) => '```html\n' + code + '\n```';
  const PAGE = [
    '<!doctype html>',
    '<html lang="es">',
    '<head>',
    '  <title>Bienvenida</title>',
    '  <style>h1 { color: red; }</style>',
    '</head>',
    '<body>',
    '  <h1>Hola</h1>',
    '  <ul><li>Uno</li><li>Dos</li></ul>',
    '  <img src="a.png" alt="Logo">',
    '</body>',
    '</html>',
  ].join('\n');

  it('omite una página completa que no es el código del estudiante', () => {
    const result = limitCodeBlocks('Así:\n' + htmlFence(PAGE), { markup: true, studentCode: '<h1></h1>', studentMessage: 'no me sale' });
    expect(result.redactedBlocks).toBe(1);
    expect(result.text).toContain(REDACTED_CODE_NOTICE);
    expect(result.text).not.toContain('<!doctype html>');
  });

  it('deja pasar un ejemplo corto (por debajo del umbral)', () => {
    const example = '<ul>\n  <li>Uno</li>\n  <li>Dos</li>\n</ul>';
    expect(limitCodeBlocks(htmlFence(example), { markup: true, studentMessage: 'cómo hago una lista' }).redactedBlocks).toBe(0);
  });

  it('deja pasar la explicación del propio código del estudiante', () => {
    expect(limitCodeBlocks(htmlFence(PAGE), { markup: true, studentCode: PAGE, studentMessage: 'explícame mi página' }).redactedBlocks).toBe(0);
  });

  it('sin `markup` el mismo bloque pasa (no es un programa stdin → stdout): la regla solo aplica a HTML y CSS', () => {
    expect(limitCodeBlocks(htmlFence(PAGE), { studentMessage: 'no me sale' }).redactedBlocks).toBe(0);
  });
});
