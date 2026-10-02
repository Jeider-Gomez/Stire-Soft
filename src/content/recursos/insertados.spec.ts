import { insertadosDelTexto } from './insertados';
import { RecursoInvalidoError } from './normalizar-recurso';

describe('Imágenes y recursos dentro del texto de una lección', () => {
  it('un video de YouTube se inserta con youtube-nocookie; la imagen se valida pero no se guarda aparte', () => {
    const texto = '## La idea\n\n![Una caja con la etiqueta edad](/media/0f8fad5b-d9cb-469f-a165-70867728950e)\n\nMira:\n\n@[Qué es una variable](https://youtu.be/dQw4w9WgXcQ)\n\nFin.';
    expect(insertadosDelTexto(texto)).toEqual({
      'https://youtu.be/dQw4w9WgXcQ': { url: 'https://youtu.be/dQw4w9WgXcQ', provider: 'youtube', embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' },
    });
  });

  it('un sitio que no se puede insertar queda como enlace (embedUrl null)', () => {
    expect(insertadosDelTexto('@[MDN](https://developer.mozilla.org/es/docs/Web/HTML)')['https://developer.mozilla.org/es/docs/Web/HTML'])
      .toEqual({ url: 'https://developer.mozilla.org/es/docs/Web/HTML', provider: 'enlace', embedUrl: null });
  });

  it('los errores dicen la línea y el motivo', () => {
    expect(() => insertadosDelTexto('Hola\n\n![](https://x.co/a.png)')).toThrow('Línea 3: describe la imagen');
    expect(() => insertadosDelTexto('Hola\n@[Video](http://youtu.be/dQw4w9WgXcQ)')).toThrow('Línea 2: solo se aceptan direcciones seguras');
    expect(() => insertadosDelTexto('![foto](javascript:alert(1))')).toThrow(RecursoInvalidoError);
    expect(() => insertadosDelTexto('@[Video](https://youtube.com/watch?v=x)')).toThrow('Línea 1: no se encontró el video');
  });

  it('lo que está en un bloque de código es un ejemplo, no un recurso; y solo cuenta si va solo en su línea', () => {
    expect(insertadosDelTexto('```markdown\n@[Video](http://malo)\n![](x)\n```\nTexto con @[algo](https://youtu.be/dQw4w9WgXcQ) en medio')).toEqual({});
  });

  it('hasta 30 por lección', () => {
    const muchas = Array.from({ length: 31 }, () => '![a](https://x.co/a.png)').join('\n');
    expect(() => insertadosDelTexto(muchas)).toThrow('como máximo 30');
  });
});
