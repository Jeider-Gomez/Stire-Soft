import { TutorContextService } from './tutor-context.service';
import { guidanceInstruction, guidanceLevelForFailedAttempts } from './tutor-guidance';

describe('andamiaje progresivo — tutor-guidance', () => {
  it.each([
    [0, 1],
    [1, 1],
    [2, 2],
    [3, 2],
    [4, 3],
    [50, 3],
  ])('%i intentos fallidos → nivel %i', (failed, level) => {
    expect(guidanceLevelForFailedAttempts(failed)).toBe(level);
  });

  it.each([
    [0, 2],
    [1, 2],
    [2, 3],
    [9, 3],
  ])('en un refuerzo (ayuda ampliada), %i intentos fallidos → nivel %i: empieza un nivel más arriba y nunca pasa de 3', (failed, level) => {
    expect(guidanceLevelForFailedAttempts(failed, true)).toBe(level);
  });

  it('en un refuerzo, el prompt pide explicar la idea de otra forma, con el título en una sola línea', async () => {
    const service = new TutorContextService({ find: jest.fn().mockResolvedValue([]) } as any);
    const prompt = await service.buildSystemPrompt(1, {}, 2, undefined, 'Otra forma\nde ver el else if');
    expect(prompt).toContain('EL ESTUDIANTE ESTÁ EN UN REFUERZO');
    expect(prompt).toContain('«Otra forma de ver el else if»');
    expect(prompt).toContain('Sigue sin dar la solución');
    expect(await service.buildSystemPrompt(1, {}, 2)).not.toContain('REFUERZO');
  });

  it('en un proyecto propio el prompt dice cuál es, pide guiar sin escribir el proyecto y ve más código que en un ejercicio', async () => {
    const service = new TutorContextService({ find: jest.fn().mockResolvedValue([]) } as any);
    const codigo = 'x'.repeat(3000);
    const prompt = await service.buildSystemPrompt(1, { proyectoTitulo: 'Mi\npágina', proyectoTipo: 'web', currentCode: codigo });
    expect(prompt).toContain('Proyecto propio abierto: «Mi página», una página web');
    expect(prompt).toContain('EL ESTUDIANTE ESTÁ EN SU PROYECTO PROPIO');
    expect(prompt).toContain('NO escribas el proyecto por él');
    expect(prompt).toContain('x'.repeat(3000));
    // en un ejercicio, el código se sigue recortando a 1500
    expect(await service.buildSystemPrompt(1, { currentCode: codigo })).not.toContain('x'.repeat(1501));
    expect(await service.buildSystemPrompt(1, {})).not.toContain('PROYECTO PROPIO');
  });

  it('ningún nivel autoriza entregar la solución completa', () => {
    for (const level of [1, 2, 3] as const) {
      expect(guidanceInstruction(level)).toMatch(/No |NO /);
    }
  });

  describe('en el system prompt', () => {
    const repo = { find: jest.fn().mockResolvedValue([]) };
    const service = new TutorContextService(repo as any);

    it('incluye la instrucción del nivel cuando hay actividad', async () => {
      const prompt = await service.buildSystemPrompt(1, {}, 2);
      expect(prompt).toContain('NIVEL DE AYUDA ACTUAL');
      expect(prompt).toContain('NIVEL 2 · PREGUNTA GUÍA');
      expect(prompt).not.toContain('NIVEL 1 ·');
    });

    it('no agrega la sección cuando no hay nivel (chat fuera de una actividad)', async () => {
      const prompt = await service.buildSystemPrompt(1, {}, null);
      expect(prompt).not.toContain('NIVEL DE AYUDA ACTUAL');
      expect(await service.buildSystemPrompt(1, {})).not.toContain('NIVEL DE AYUDA ACTUAL');
    });
  });
});
