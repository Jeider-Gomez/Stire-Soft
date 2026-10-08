import { cursoFundamentos203413 } from '../cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../cursos/pensamiento-algoritmico';
import { variantesFundamentos } from '../cursos/fundamentos-203413/variantes';
import { todosLosEjercicios } from '../cursos/tipos';

// 07/10, Jeider probó «Prueba de escritorio: el descuento» como estudiante: «Sigue el algoritmo con una tabla» no decía
// qué tabla hacer ni qué significa «<-», y sin saber programar no se entendía. Un ejercicio que pide una tabla explica
// qué es la prueba de escritorio y la flecha.
const conTabla = [cursoFundamentos203413, cursoPensamientoAlgoritmico]
  .flatMap((c) => todosLosEjercicios(c))
  // Las variantes que no están en ninguna lección del curso también se revisan.
  .concat(Object.entries(variantesFundamentos).flatMap(([u, es]) => es.map((ejercicio) => ({ ruta: `${u} › ${ejercicio.titulo}`, ejercicio }))))
  .filter((x, i, todos) => todos.findIndex((o) => o.ruta === x.ruta) === i)
  .filter(({ ejercicio }) => /\btabla\b/i.test(ejercicio.enunciado) && ejercicio.enunciado.includes('<-'));

describe('los ejercicios que piden seguir el algoritmo con una tabla', () => {
  it('hay alguno (la prueba no pasa en vacío)', () => {
    expect(conTabla.length).toBeGreaterThanOrEqual(3);
  });

  it.each(conTabla.map((x) => [x.ruta, x.ejercicio.enunciado]))('%s explica qué hacer y qué es «<-»', (_ruta, enunciado) => {
    expect(enunciado).toContain('**prueba de escritorio**');
    expect(enunciado).toContain('«guarda en»');
  });

  it('el del descuento trae la tabla empezada, con lo que falta marcado', () => {
    const descuento = conTabla.find((x) => x.ejercicio.titulo === 'Prueba de escritorio: el descuento');
    expect(descuento?.ejercicio.enunciado).toContain('| Paso | precio | descuento |');
    expect(descuento?.ejercicio.enunciado).toContain('| Leer precio | 2000 | (sin valor) |');
  });
});
