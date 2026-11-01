import { cursoFundamentos203413 } from '../cursos/fundamentos-203413';
import { aConfig, todosLosEjercicios } from '../cursos/tipos';

// P54 (Jeider, 31/10, viendo freeCodeCamp: «la pista me va diciendo qué me falta»): al entregar, cada caso se marca ✓ o ✗ por
// su nombre, también los ocultos. El nombre dice qué comprueba, nunca sus datos.
const deProgramar = todosLosEjercicios(cursoFundamentos203413).flatMap(({ ejercicio }) => (ejercicio.tipo === 'coding' ? [ejercicio] : []));

describe('Los casos del curso de Fundamentos tienen nombre', () => {
  it('hay ejercicios de programar que revisar', () => {
    expect(deProgramar.length).toBeGreaterThanOrEqual(30);
  });

  it.each(deProgramar.map((e) => [e.titulo, e] as const))('%s: cada caso con su nombre, sin repetir', (_titulo, e) => {
    const nombres = e.casos.map((c) => c.nombre ?? '');
    expect(nombres.every((n) => n.trim() !== '')).toBe(true);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it.each(deProgramar.map((e) => [e.titulo, e] as const))('%s: el nombre de un caso oculto no revela su entrada ni su salida', (_titulo, e) => {
    for (const c of e.casos.filter((x) => !x.publico)) {
      const nombre = (c.nombre ?? '').toLowerCase();
      for (const dato of [c.salida, ...c.entrada.split('\n')]) {
        // Los datos de una o dos letras («0», «si») aparecen por casualidad dentro de cualquier palabra.
        if (dato.trim().length > 2) expect(nombre).not.toContain(dato.trim().toLowerCase());
      }
    }
  });

  it('el nombre llega a la configuración que usa el juez', () => {
    const e = deProgramar.find((x) => x.titulo === '¿Aprobó o reprobó?')!;
    const config = aConfig(e) as { testCases: Array<{ label: string }> };
    expect(config.testCases[0].label).toBe('Nota justo en el límite');
  });
});
