import { ambitoDe, distancia, normalizarNombre, sonParecidas } from './normalizar';

// Orden del catálogo (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.2.1): cómo se reconoce la misma asignatura escrita distinto.
describe('normalizarNombre — la misma asignatura escrita de varias formas se guarda igual', () => {
  it.each([
    ['Fundamentos de Algoritmia', 'fundamentos algoritmia'],
    ['fundamentos  de  algoritmia', 'fundamentos algoritmia'],
    ['Fund. de Algoritmia', 'fundamentos algoritmia'],
    ['FUNDAMENTOS DE ALGORITMIA ', 'fundamentos algoritmia'],
    ['Uso de la Inteligencia Artificial en la Educación', 'uso inteligencia artificial educacion'],
    ['Uso de la IA en la educación', 'uso inteligencia artificial educacion'],
    ['Introducción a la Programación', 'introduccion programacion'],
    ['Intro. a la Prog.', 'introduccion programacion'],
  ])('«%s» → «%s»', (nombre, esperado) => {
    expect(normalizarNombre(nombre)).toBe(esperado);
  });

  it('conserva números y la ñ, que sí distinguen («Inglés I» no es «Inglés II»)', () => {
    expect(normalizarNombre('Diseño de Software Educativo III')).toBe('diseno software educativo iii');
    expect(normalizarNombre('Inglés I')).not.toBe(normalizarNombre('Inglés II'));
  });
});

describe('ambitoDe — dónde vive una asignatura, para el índice único', () => {
  it('programa, institución o libre', () => {
    expect(ambitoDe(7, 1)).toBe('p:7');
    expect(ambitoDe(null, 1)).toBe('i:1');
    expect(ambitoDe(null, null)).toBe('libre');
  });
});

describe('sonParecidas — candidatas para «¿Es alguna de estas?» y para la revisión del admin', () => {
  const n = normalizarNombre;
  it('erratas de una o dos letras', () => {
    expect(distancia('algoritmia', 'algoritimia')).toBe(1);
    expect(sonParecidas(n('Fundamentos de Algoritimia'), n('Fundamentos de Algoritmia'))).toBe(true);
  });
  it('las mismas palabras con una de más («Fundamentos de Algoritmia I»)', () => {
    expect(sonParecidas(n('Fundamentos de Algoritmia I'), n('Fundamentos de Algoritmia'))).toBe(true);
  });
  it('asignaturas distintas no se confunden', () => {
    expect(sonParecidas(n('Fundamentos de Programación'), n('Fundamentos de Algoritmia'))).toBe(false);
    expect(sonParecidas(n('Inglés I'), n('Inglés II'))).toBe(true); // una letra: se pregunta, el docente decide
    expect(sonParecidas(n('Matemáticas'), n('Fotografía'))).toBe(false);
    expect(sonParecidas('', n('Fotografía'))).toBe(false);
  });
});
