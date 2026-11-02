import { notaDeProgramar } from './tutor-nota-programar';

describe('notaDeProgramar', () => {
  const programa = { activityId: 1276, currentCode: "console.log('Hola');" };

  it('en un ejercicio de programar recuerda no dictar la solución', () => {
    const n = notaDeProgramar(programa);
    expect(n).toContain('nombra solo la idea que le falta');
    expect(n).toContain('otro problema y con otra forma');
    expect(n).toContain('no lo escribió el estudiante');
  });

  it('también con el editor vacío, cuando más se pregunta qué poner', () => {
    expect(notaDeProgramar({ ...programa, currentCode: '' })).toContain('nombra solo la idea');
  });

  it('no aplica a completar huecos, a un proyecto propio ni fuera de un ejercicio', () => {
    expect(notaDeProgramar({ ...programa, tipoEjercicio: 'completar' })).toBe('');
    expect(notaDeProgramar({ ...programa, proyectoTitulo: 'Mi juego' })).toBe('');
    expect(notaDeProgramar({ currentCode: 'x' })).toBe('');
    expect(notaDeProgramar({ activityId: 1276 })).toBe('');
    expect(notaDeProgramar(null)).toBe('');
    expect(notaDeProgramar('x')).toBe('');
  });
});
