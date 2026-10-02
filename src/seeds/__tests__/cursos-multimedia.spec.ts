import { insertadosDelTexto, IMAGEN_EN_LINEA, RECURSO_EN_LINEA } from '../../content/recursos/insertados';
import { cursoFundamentos203413 } from '../cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../cursos/pensamiento-algoritmico';
import type { Curso } from '../cursos/tipos';

const lecciones = (c: Curso) => c.secciones.flatMap((s) => s.temas.flatMap((t) => t.unidades.map((u) => u.leccion)));
const lineas = (c: Curso) => lecciones(c).flatMap((l) => l.cuerpo.split('\n').map((x) => x.trim()));

describe('Los cursos traen multimedia que la app acepta (lo que el equipo prueba en las lecciones)', () => {
  it.each([cursoFundamentos203413, cursoPensamientoAlgoritmico])('$nombre: cada lección pasa la validación del servidor', (curso) => {
    for (const l of lecciones(curso)) expect(() => insertadosDelTexto(l.cuerpo)).not.toThrow();
  });

  it('cada curso tiene al menos una imagen y un video dentro del texto de sus lecciones', () => {
    for (const curso of [cursoFundamentos203413, cursoPensamientoAlgoritmico]) {
      const ls = lineas(curso);
      expect(ls.filter((x) => IMAGEN_EN_LINEA.test(x)).length).toBeGreaterThanOrEqual(1);
      expect(ls.filter((x) => RECURSO_EN_LINEA.test(x) && /youtube\.com|youtu\.be/.test(x)).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('Fundamentos (HTML, CSS y JavaScript) tiene ejemplos en vivo que el estudiante puede modificar', () => {
    const vivos = lecciones(cursoFundamentos203413).filter((l) => l.cuerpo.includes('```vivo'));
    expect(vivos.map((l) => l.titulo)).toEqual(expect.arrayContaining([
      'HTML: la estructura de la página', 'Cuando el algoritmo vive en la página', 'CSS: la presentación de la página',
    ]));
  });

  it('las imágenes describen lo que muestran y dan crédito a su autor y licencia', () => {
    for (const curso of [cursoFundamentos203413, cursoPensamientoAlgoritmico]) {
      for (const x of lineas(curso).filter((y) => IMAGEN_EN_LINEA.test(y))) {
        const [, alt, , pie] = IMAGEN_EN_LINEA.exec(x)!;
        expect(alt.length).toBeGreaterThan(20);
        expect(pie).toMatch(/Wikimedia Commons, (dominio público|CC0|CC BY)/);
      }
    }
  });
});
