import { modelosCandidatos, MODELO_RAPIDO, OrdenDeModelos } from './orden-modelos';

// 17/10: una respuesta del Tutor tardó ~30 s esperando a dos modelos caídos antes de llegar al que sí respondía.
describe('OrdenDeModelos', () => {
  const candidatos = ['a', 'b', 'c'];

  it('sin historia, el orden configurado', () => {
    expect(new OrdenDeModelos().orden(candidatos, 0)).toEqual(['a', 'b', 'c']);
  });

  it('el último que respondió va primero', () => {
    const o = new OrdenDeModelos();
    o.respondio('c');
    expect(o.orden(candidatos, 0)).toEqual(['c', 'a', 'b']);
  });

  it('el que se cae pasa al final mientras dura el castigo, y vuelve a su lugar después', () => {
    const o = new OrdenDeModelos(1000);
    o.fallo('a', 0);
    o.fallo('b', 0);
    expect(o.orden(candidatos, 500)).toEqual(['c', 'a', 'b']);
    expect(o.orden(candidatos, 1500)).toEqual(['a', 'b', 'c']);
  });

  it('si el que respondía se cae, deja de ir primero; si responde de nuevo, se le quita el castigo', () => {
    const o = new OrdenDeModelos(1000);
    o.respondio('b');
    o.fallo('b', 0);
    expect(o.orden(candidatos, 100)).toEqual(['a', 'c', 'b']);
    o.respondio('b');
    expect(o.orden(candidatos, 100)).toEqual(['b', 'a', 'c']);
  });
});

describe('modelosCandidatos', () => {
  it('el modelo rápido va primero desde el arranque, para que la primera pregunta tras un despliegue no espere 30 s', () => {
    expect(modelosCandidatos('gemini-flash-latest')[0]).toBe(MODELO_RAPIDO);
  });

  it('sin repetidos y con el modelo configurado en la lista, sin el prefijo «models/»', () => {
    const lista = modelosCandidatos('models/gemini-2.0-flash');
    expect(lista).toContain('gemini-2.0-flash');
    expect(new Set(lista).size).toBe(lista.length);
    expect(modelosCandidatos(MODELO_RAPIDO).filter((m) => m === MODELO_RAPIDO)).toHaveLength(1);
  });
});
