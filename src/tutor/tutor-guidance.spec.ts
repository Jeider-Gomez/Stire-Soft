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

describe('Explicar un concepto vs. guiar en el ejercicio (28/10)', () => {
  // Jeider: «si yo pregunto qué es una variable, quisiera que me responda y explique enseguida».
  const prompt = () => new TutorContextService({ find: jest.fn().mockResolvedValue([]) }).buildSystemPrompt(1, { currentCode: 'let a = 1', activityId: 3 });

  it('una pregunta de concepto se explica primero y luego se comprueba con UNA pregunta o una práctica pequeña', async () => {
    const p = await prompt();
    expect(p).toContain('EXPLÍCALO PRIMERO Y DE UNA VEZ, sin devolverle preguntas antes de explicar');
    expect(p).toContain('cierra con UNA sola de estas');
    expect(p).toContain('una práctica pequeña de 1 o 2 líneas');
    expect(p).not.toContain('responde con una pregunta orientadora');
  });

  it('en su ejercicio guía sin dar la solución, pero nunca responde solo con preguntas', async () => {
    const p = await prompt();
    expect(p).toContain('Nunca respondas solo con preguntas');
    expect(p).toContain('NUNCA resuelvas el ejercicio');
    expect(p).not.toContain('Termina con UNA pregunta o UNA acción');
  });

  it('el ejemplo de un concepto no reutiliza los datos del ejercicio, y nunca escribe la fórmula que lo resuelve (29/10)', async () => {
    // Jeider probó: «¿qué es una variable?» dentro de «Completa la presentación» dio `let edad = 19;` (el hueco del ejercicio),
    // y «no sé cómo sacar el perímetro» dio `2 * (base + altura)`.
    const p = await prompt();
    expect(p).toContain('no uses los nombres de variables, los valores ni los datos que aparecen en el enunciado');
    expect(p).toContain('ni siquiera como «recuerda que es 2 * (base + altura)»');
    expect(p).toContain('dale la idea con palabras');
  });

  it('el cierre es una práctica o pregunta concreta, nunca un ofrecimiento («¿te gustaría practicar?») (29/10)', async () => {
    // Jeider probó «¿qué es una variable?» y el Tutor cerró con «¿te gustaría practicar, o prefieres repasar la teoría?».
    const p = await prompt();
    expect(p).toContain('Ponla DIRECTAMENTE, con los datos concretos');
    expect(p).toContain('NUNCA cierres con un ofrecimiento como «¿te gustaría practicar?»');
    expect(p).toContain('La práctica tampoco usa los nombres ni datos de su ejercicio');
  });

  it('en un ejercicio de completar, el Tutor ve la plantilla y no habla de leer la entrada (29/10)', async () => {
    const servicio = new TutorContextService({ find: jest.fn().mockResolvedValue([]) });
    const p = await servicio.buildSystemPrompt(1, { currentCode: 'const nombre = "Luisa";\nlet edad = ___b___;', tipoEjercicio: 'completar', activityId: 3 });
    expect(p).toContain('ESTE EJERCICIO ES DE COMPLETAR HUECOS');
    expect(p).toContain('let edad = ___b___;');
    expect(p).toContain('SIN decirle la palabra ni el valor que lo llena');
    expect(p).toContain('Si un hueco sigue como ___a___, está vacío: nunca digas que está bien');
    expect(p).toContain('Nunca afirmes que algo está bien sin poder razonarlo');
    expect(p).not.toContain('CÓMO AYUDAR EN UN EJERCICIO DE PROGRAMAR');
    expect(p).not.toContain('lee mal la entrada');
  });

  it('en un ejercicio de programar siguen las pistas de programar y no las de completar', async () => {
    const p = await prompt();
    expect(p).toContain('CÓMO AYUDAR EN UN EJERCICIO DE PROGRAMAR');
    expect(p).not.toContain('ESTE EJERCICIO ES DE COMPLETAR HUECOS');
  });

  it('la sugerencia de practicar o repasar no sustituye al cierre concreto de una explicación (29/10)', async () => {
    const p = await prompt();
    expect(p).toContain('NO la uses para cerrar una explicación nueva');
  });

  it('el nivel 2 señala dónde mirar y hace una sola pregunta', () => {
    expect(guidanceInstruction(2)).toContain('dile en qué parte de su programa mirar');
    expect(guidanceInstruction(2)).not.toContain('una o dos preguntas');
  });
});
