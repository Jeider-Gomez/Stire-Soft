import { erroresQueSeRepiten, GRUPO_ERROR, ordenDeEstudio, preferenciaDeFormatos, tipoDeError } from './perfil-aprendizaje';

// MOD-02 (Pedro, 16/10): perfil del estudiante y errores de concepto separados de los descuidos de escritura.
describe('tipoDeError: las mismas reglas que explican la salida en la pantalla del ejercicio', () => {
  it('reconoce los errores de concepto', () => {
    expect(tipoDeError('8', '53', '5\n3')).toBe('concatena');
    expect(tipoDeError('10', '9')).toBe('por-uno');
    expect(tipoDeError('4', 'NaN')).toBe('nan');
    expect(tipoDeError('12', '')).toBe('vacia');
    expect(tipoDeError('12', '20')).toBe('numero');
  });
  it('reconoce los descuidos de escritura', () => {
    expect(tipoDeError('8', "SyntaxError: Unexpected token ';' (línea 3)")).toBe('sintaxis');
    expect(tipoDeError('8', 'ReferenceError: totl is not defined')).toBe('no-existe');
    expect(tipoDeError('Hola, Ana.', 'hola, ana.')).toBe('mayusculas');
    expect(tipoDeError('Hola, Ana.', 'Hola Ana')).toBe('puntuacion');
    expect(tipoDeError('a\nb', 'a \n b')).toBe('espacios');
  });
  it('igual no es error, y cada tipo tiene su grupo', () => {
    expect(tipoDeError('8', '8')).toBeNull();
    expect(GRUPO_ERROR.concatena).toBe('concepto');
    expect(GRUPO_ERROR.sintaxis).toBe('escritura');
  });
});

describe('erroresQueSeRepiten', () => {
  const f = (tipo: keyof typeof GRUPO_ERROR, entregaId: string, dia: number) =>
    ({ tipo, entregaId, fecha: new Date(2026, 9, dia) });

  it('un error de concepto en 2 entregas o más es un patrón; varios casos de la misma entrega cuentan una vez', () => {
    const r = erroresQueSeRepiten([f('concatena', 'a', 1), f('concatena', 'a', 1), f('concatena', 'b', 3), f('por-uno', 'c', 2), f('sintaxis', 'd', 2), f('mayusculas', 'd', 2)]);
    expect(r.seRepiten).toEqual([expect.objectContaining({ tipo: 'concatena', veces: 2 })]);
    expect(r.seRepiten[0].explicacion).toMatch(/como texto/);
    expect(r.conceptoUnaVez).toBe(1);
    expect(r.descuidos).toBe(1);
  });
});

describe('ordenDeEstudio (Global / Secuencial)', () => {
  const plan = [1, 2, 3, 4, 5];
  const d = (unitId: number, dia: number) => ({ unitId, fecha: new Date(2026, 9, dia) });
  it('sigue el plan → secuencial; salta → global; con pocos pasos no dice nada', () => {
    expect(ordenDeEstudio(plan, [d(1, 1), d(2, 2), d(3, 3), d(4, 4)]).etiqueta).toBe('secuencial');
    expect(ordenDeEstudio(plan, [d(5, 1), d(1, 2), d(4, 3), d(2, 4)]).etiqueta).toBe('global');
    expect(ordenDeEstudio(plan, [d(1, 1), d(2, 2)]).etiqueta).toBeNull();
  });
});

describe('preferenciaDeFormatos (Visual / Verbal)', () => {
  it('diagrama, video y ejemplo en vivo son visuales; pseudocódigo, pasos y escuchar, verbales', () => {
    expect(preferenciaDeFormatos([{ formato: 'diagrama', veces: 7 }, { formato: 'pseudocodigo', veces: 3 }])).toMatchObject({ pctVisual: 70, etiqueta: 'visual' });
    expect(preferenciaDeFormatos([{ formato: 'escuchar', veces: 4 }, { formato: 'pasos', veces: 4 }]).etiqueta).toBe('verbal');
    expect(preferenciaDeFormatos([{ formato: 'diagrama', veces: 1 }]).etiqueta).toBeNull();
    expect(preferenciaDeFormatos([{ formato: 'otro', veces: 9 }]).pctVisual).toBeNull();
  });
});
