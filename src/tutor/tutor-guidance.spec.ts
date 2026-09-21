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
