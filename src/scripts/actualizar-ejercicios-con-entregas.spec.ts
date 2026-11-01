import { decidir, jsonCanonico, textoResumen } from './actualizar-ejercicios-con-entregas';

describe('Actualizar los ejercicios del curso que ya tienen entregas', () => {
  const guardada = { type: 'coding', question: '<p>Enunciado</p>', config: { starterCode: 'x', testCases: [{ label: 'A', input: '1' }] } };

  it('el orden de las claves no cuenta como cambio: la base de datos puede devolverlas en otro orden', () => {
    expect(jsonCanonico({ a: 1, b: { c: 2, d: 3 } })).toBe(jsonCanonico({ b: { d: 3, c: 2 }, a: 1 }));
    expect(jsonCanonico({ a: 1, b: undefined })).toBe(jsonCanonico({ a: 1 }));
  });

  it('el orden de una lista sí cuenta: los casos son otros', () => {
    expect(jsonCanonico([1, 2])).not.toBe(jsonCanonico([2, 1]));
  });

  it('lo que ya está igual no se toca: se puede correr dos veces', () => {
    expect(
      decidir(guardada, { tipo: 'coding', enunciadoSaneado: '<p>Enunciado</p>', config: { testCases: [{ input: '1', label: 'A' }], starterCode: 'x' } }),
    ).toBe('igual');
  });

  it('se actualiza si cambian el enunciado o los casos', () => {
    expect(decidir(guardada, { tipo: 'coding', enunciadoSaneado: '<p>Otro</p>', config: guardada.config })).toBe('actualizar');
    expect(decidir(guardada, { tipo: 'coding', enunciadoSaneado: guardada.question, config: { ...guardada.config, starterCode: 'leerTexto()' } })).toBe('actualizar');
  });

  it('si cambió el tipo no se toca: las entregas viejas tendrían otra forma de respuesta', () => {
    expect(decidir(guardada, { tipo: 'mcq', enunciadoSaneado: guardada.question, config: guardada.config })).toBe('tipo-distinto');
  });

  it('el resumen deja claro si se guardó o fue una simulación', () => {
    const r = { revisados: 3, iguales: 1, actualizados: ['a'], tipoDistinto: ['b'], sinEjercicio: [], errores: [] };
    expect(textoResumen(r, false)).toContain('[SIMULACIÓN, no se guardó nada]');
    expect(textoResumen(r, false)).toContain('1 se actualizarían');
    expect(textoResumen(r, true)).toContain('GUARDADO');
    expect(textoResumen(r, true)).toContain('tipo distinto: b');
  });
});
