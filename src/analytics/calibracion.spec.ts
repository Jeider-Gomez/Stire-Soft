import { esNivelConfianza, resumirCalibracion, type JuicioCalificado } from './calibracion';

const j = (confianza: JuicioCalificado['confianza'], acerto: boolean): JuicioCalificado => ({ confianza, acerto });
const repetir = (n: number, x: JuicioCalificado) => Array.from({ length: n }, () => x);

describe('resumirCalibracion (META-02: confianza declarada contra resultado)', () => {
  it('cuenta los juicios y los aciertos de cada nivel', () => {
    const r = resumirCalibracion([j('seguro', true), j('seguro', false), j('dudo', true), j('adivino', false)]);
    expect(r.total).toBe(4);
    expect(r.porNivel).toEqual({ seguro: { total: 2, aciertos: 1 }, dudo: { total: 1, aciertos: 1 }, adivino: { total: 1, aciertos: 0 } });
  });

  it('con menos de 5 juicios no dice nada: una sola entrega cambiaría el mensaje', () => {
    expect(resumirCalibracion(repetir(4, j('seguro', false))).sesgo).toBe('pocos-datos');
    expect(resumirCalibracion([]).sesgo).toBe('pocos-datos');
  });

  it('sobreconfianza: dice «seguro» y acierta menos del 60 %', () => {
    expect(resumirCalibracion([...repetir(2, j('seguro', true)), ...repetir(3, j('seguro', false))]).sesgo).toBe('sobreconfianza');
  });

  it('subconfianza: dice «dudo» o «adivino» y acierta el 70 % o más', () => {
    expect(resumirCalibracion([...repetir(3, j('dudo', true)), j('adivino', true), j('adivino', false)]).sesgo).toBe('subconfianza');
  });

  it('calibrado: lo que dice coincide con lo que obtiene', () => {
    expect(resumirCalibracion([...repetir(4, j('seguro', true)), j('dudo', false), j('adivino', false)]).sesgo).toBe('calibrado');
  });

  it('la sobreconfianza pesa más que la subconfianza (la ilusión de saber es la que hace dejar de practicar)', () => {
    const r = resumirCalibracion([...repetir(3, j('seguro', false)), ...repetir(3, j('dudo', true))]);
    expect(r.sesgo).toBe('sobreconfianza');
  });

  it('con pocos juicios de un nivel no se juzga ese nivel', () => {
    // 2 «seguro» fallados no bastan para decir sobreconfianza
    expect(resumirCalibracion([...repetir(2, j('seguro', false)), ...repetir(3, j('dudo', false))]).sesgo).toBe('calibrado');
  });
});

describe('esNivelConfianza', () => {
  it('acepta solo los tres niveles', () => {
    expect(['seguro', 'dudo', 'adivino'].every(esNivelConfianza)).toBe(true);
    expect(esNivelConfianza('muy seguro')).toBe(false);
    expect(esNivelConfianza(3)).toBe(false);
  });
});
