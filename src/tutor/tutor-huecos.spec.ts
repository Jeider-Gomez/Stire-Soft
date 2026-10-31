import { notaDeHuecos } from './tutor-huecos';

// 31/10, prueba con la cuenta de Santiago: con el hueco vacío el Tutor dijo «tienes const» por el historial del chat.
describe('notaDeHuecos', () => {
  const completar = (currentCode: string) => ({ tipoEjercicio: 'completar', currentCode });

  it('con los huecos vacíos dice cuáles y que no hay nada escrito', () => {
    const n = notaDeHuecos(completar('___a___ nombre = "Luisa";\nlet edad = ___b___;'));
    expect(n).toContain('huecos vacíos: a, b');
    expect(n).toContain('el estudiante no ha escrito nada en los huecos');
    expect(n).toContain('vale esto');
  });

  it('con uno escrito y otro vacío dice los dos', () => {
    const n = notaDeHuecos(completar('⟦const⟧ nombre = "Luisa";\nlet edad = ___b___;'));
    expect(n).toContain('huecos vacíos: b');
    expect(n).toContain('lo que el estudiante ya escribió: «const»');
  });

  it('con todos llenos dice que no hay vacíos', () => {
    const n = notaDeHuecos(completar('⟦const⟧ nombre = "Luisa";\nlet edad = ⟦19⟧;'));
    expect(n).toContain('no hay huecos vacíos');
    expect(n).toContain('«const», «19»');
  });

  it('en cualquier otro ejercicio, o sin código, no agrega nada', () => {
    expect(notaDeHuecos({ currentCode: '___a___' })).toBe('');
    expect(notaDeHuecos({ tipoEjercicio: 'completar' })).toBe('');
    expect(notaDeHuecos(completar('console.log(1)'))).toBe('');
    expect(notaDeHuecos(null)).toBe('');
    expect(notaDeHuecos('x')).toBe('');
  });

  it('recorta lo que manda el navegador: valores largos, identificadores raros y demasiados huecos', () => {
    const largo = 'x'.repeat(500);
    expect(notaDeHuecos(completar(`⟦${largo}⟧`))).toContain(`«${'x'.repeat(40)}»`);
    expect(notaDeHuecos(completar(`___${'y'.repeat(30)}___`))).toBe('');
    const muchos = Array.from({ length: 40 }, (_, i) => `___h${i}___`).join(' ');
    expect((notaDeHuecos(completar(muchos)).match(/h\d+/g) ?? []).length).toBe(12);
  });
});
