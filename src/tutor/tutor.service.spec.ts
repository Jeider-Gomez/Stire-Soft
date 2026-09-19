import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TutorService } from './tutor.service';

const STUDENT: any = { id: 1, role: 'estudiante' };

function geminiOk(text: string) {
  return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }), text: async () => '' };
}
function geminiFail(status: number, body = '') {
  return { ok: false, status, json: async () => ({}), text: async () => body };
}

describe('TutorService (Gemini con clave del estudiante)', () => {
  let service: TutorService;
  let convRepo: any;
  let contextService: any;
  let credentialService: any;
  let learningUnitService: any;
  let learningProgressService: any;
  let settingsService: any;
  let recommendationService: any;
  let fetchMock: jest.Mock;
  const realFetch = global.fetch;

  beforeEach(() => {
    convRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getRecentContext: jest.fn().mockResolvedValue([
        { role: 'user', content: 'Hola tutor' },
        { role: 'assistant', content: 'Respuesta previa' },
      ]),
      getHistory: jest.fn().mockResolvedValue([]),
    };
    contextService = { buildSystemPrompt: jest.fn().mockResolvedValue('SYSTEM PROMPT') };
    credentialService = { getDecryptedKey: jest.fn().mockResolvedValue('AIzaFAKEKEYFORTESTS1234567890abcdefgh') };
    learningUnitService = { findOne: jest.fn().mockResolvedValue({ id: 7, title: 'Bucles' }) };
    learningProgressService = { countFailedAttempts: jest.fn().mockResolvedValue(0) };
    settingsService = { resolveForStudent: jest.fn().mockResolvedValue({ enabled: true, maxGuideLevel: 3, style: 'equilibrado' }) };
    recommendationService = {
      suggestForUnit: jest.fn().mockResolvedValue(null),
      suggestAmbient: jest.fn().mockResolvedValue(null),
    };
    const contentRenderingService = { escapePlainText: jest.fn((s: string) => s) };
    const configService = { get: jest.fn((key: string, def?: any) => (key === 'GEMINI_MODEL' ? 'gemini-flash-latest' : def)) };

    service = new TutorService(
      convRepo,
      contextService,
      configService as any,
      contentRenderingService as any,
      recommendationService,
      credentialService,
      learningUnitService,
      learningProgressService,
      settingsService,
    );

    fetchMock = jest.fn().mockResolvedValue(geminiOk('Respuesta IA'));
    (global as any).fetch = fetchMock;
  });

  afterEach(() => {
    (global as any).fetch = realFetch;
  });

  it('llama a Gemini con la clave del estudiante en la cabecera (nunca en la URL) y el historial sin duplicar el mensaje nuevo', async () => {
    const result = await service.sendMessage(STUDENT, '¿Cuál es la fórmula?');

    expect(result.message).toBe('Respuesta IA');
    expect(result.suggestedActivity).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('generativelanguage.googleapis.com');
    expect(url).not.toContain('key=');
    expect(url).not.toContain('AIza');
    expect(init.headers['x-goog-api-key']).toBe('AIzaFAKEKEYFORTESTS1234567890abcdefgh');

    const body = JSON.parse(init.body);
    expect(body.system_instruction.parts[0].text).toBe('SYSTEM PROMPT');
    const texts = body.contents.map((c: any) => c.parts[0].text).join('||');
    // El mensaje nuevo aparece exactamente una vez.
    expect(texts.split('¿Cuál es la fórmula?').length - 1).toBe(1);
    expect(body.contents[body.contents.length - 1]).toEqual({ role: 'user', parts: [{ text: '¿Cuál es la fórmula?' }] });
  });

  it('lee el historial ANTES de guardar el mensaje nuevo y guarda ambos solo si Gemini respondió', async () => {
    await service.sendMessage(STUDENT, 'pregunta nueva');

    const readOrder = convRepo.getRecentContext.mock.invocationCallOrder[0];
    const firstSaveOrder = convRepo.save.mock.invocationCallOrder[0];
    expect(readOrder).toBeLessThan(firstSaveOrder);
    expect(convRepo.save).toHaveBeenNthCalledWith(1, { studentId: 1, role: 'user', content: 'pregunta nueva' });
    expect(convRepo.save).toHaveBeenNthCalledWith(2, { studentId: 1, role: 'assistant', content: 'Respuesta IA' });
  });

  it('responde 428 sin llamar a Google ni tocar el historial cuando el estudiante no configuró su clave', async () => {
    credentialService.getDecryptedKey.mockResolvedValue(null);

    await expect(service.sendMessage(STUDENT, 'hola')).rejects.toMatchObject({ status: 428 });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(convRepo.save).not.toHaveBeenCalled();
  });

  it('responde 422 y deja de probar modelos si Google rechaza la clave', async () => {
    fetchMock.mockResolvedValue(geminiFail(400, '{"error":{"details":[{"reason":"API_KEY_INVALID"}]}}'));

    await expect(service.sendMessage(STUDENT, 'hola')).rejects.toMatchObject({ status: 422 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(convRepo.save).not.toHaveBeenCalled();
  });

  it('responde 429 si todos los modelos agotan la cuota gratuita', async () => {
    fetchMock.mockResolvedValue(geminiFail(429));

    await expect(service.sendMessage(STUDENT, 'hola')).rejects.toMatchObject({ status: 429 });
    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
  });

  it('prueba el siguiente modelo cuando el primero está en cuota o falla', async () => {
    fetchMock.mockResolvedValueOnce(geminiFail(429)).mockResolvedValueOnce(geminiOk('Desde el segundo modelo'));

    const result = await service.sendMessage(STUDENT, 'hola');
    expect(result.message).toBe('Desde el segundo modelo');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('responde 503 (no una respuesta inventada) si Google no está disponible', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(service.sendMessage(STUDENT, 'hola')).rejects.toMatchObject({ status: 503 });
    expect(convRepo.save).not.toHaveBeenCalled();
  });

  it('descarga turnos iniciales del modelo y fusiona turnos consecutivos del mismo rol', async () => {
    convRepo.getRecentContext.mockResolvedValue([
      { role: 'assistant', content: 'Saludo guardado' },
      { role: 'assistant', content: 'Otro saludo' },
      { role: 'user', content: 'me atoré' },
      { role: 'assistant', content: 'cuéntame más' },
    ]);

    await service.sendMessage(STUDENT, 'aquí mi duda');

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.contents.map((c: any) => c.role)).toEqual(['user', 'model', 'user']);
  });

  it('no adjunta sugerencia cuando el mensaje no pide practicar explícitamente', async () => {
    fetchMock.mockResolvedValue(geminiOk('Piensa en el caso base.'));

    const result = await service.sendMessage(STUDENT, '¿Cómo funciona un for?', { learningUnitId: 7 });

    expect(result.suggestedActivity).toBeNull();
    expect(recommendationService.suggestForUnit).not.toHaveBeenCalled();
  });

  it('sugiere un ejercicio de la unidad activa (con el título real de la BD) cuando el estudiante pide practicar', async () => {
    recommendationService.suggestForUnit.mockResolvedValue({
      activityId: 42,
      activityTitle: 'Ejercicio de bucles',
      learningUnitId: 7,
      learningUnitTitle: 'Bucles',
      reason: 'contexto_actual',
      reasonMessage: 'x',
    });

    const result = await service.sendMessage(STUDENT, 'quiero practicar un ejercicio de esto', {
      learningUnitId: 7,
      unitTitle: 'TÍTULO FALSO DEL CLIENTE',
    });

    expect(result.suggestedActivity?.activityId).toBe(42);
    expect(learningUnitService.findOne).toHaveBeenCalledWith(7, STUDENT);
    expect(recommendationService.suggestForUnit).toHaveBeenCalledWith(
      1,
      7,
      'contexto_actual',
      'Aquí tienes el siguiente ejercicio de "Bucles".',
    );
    // El prompt recibe el título de la BD, no el del cliente.
    const promptContext = contextService.buildSystemPrompt.mock.calls[0][1];
    expect(promptContext.unitTitle).toBe('Bucles');
  });

  it.each([
    ['Forbidden', new ForbiddenException('No estás matriculado')],
    ['NotFound', new NotFoundException('No existe')],
  ])('ignora la unidad del cliente si no puede leerla (%s) y usa la sugerencia ambiente, sin filtrar títulos ajenos', async (_name, error) => {
    learningUnitService.findOne.mockRejectedValue(error);
    recommendationService.suggestAmbient.mockResolvedValue({
      activityId: 9,
      activityTitle: 'Repaso de variables',
      learningUnitId: 3,
      learningUnitTitle: 'Variables',
      reason: 'mastery_bajo',
      reasonMessage: 'y',
    });

    const result = await service.sendMessage(STUDENT, 'quiero practicar un poco', { learningUnitId: 999, unitTitle: 'Unidad ajena' });

    expect(result.suggestedActivity?.activityId).toBe(9);
    expect(recommendationService.suggestForUnit).not.toHaveBeenCalled();
    const promptContext = contextService.buildSystemPrompt.mock.calls[0][1];
    expect(promptContext.learningUnitId).toBeUndefined();
    expect(promptContext.unitTitle).toBeUndefined();
  });

  describe('nivel de ayuda (andamiaje progresivo)', () => {
    it.each([
      [0, 1],
      [1, 1],
      [2, 2],
      [3, 2],
      [4, 3],
      [9, 3],
    ])('con %i intentos fallidos en la actividad responde con nivel %i y se lo indica al prompt', async (failed, level) => {
      learningProgressService.countFailedAttempts.mockResolvedValue(failed);

      const result = await service.sendMessage(STUDENT, 'no me sale', { activityId: 20 });

      expect(learningProgressService.countFailedAttempts).toHaveBeenCalledWith(1, 20);
      expect(result.guidanceLevel).toBe(level);
      expect(contextService.buildSystemPrompt.mock.calls[0][2]).toBe(level);
    });

    it('sin actividad en contexto no hay nivel (null) y no se consulta ningún intento', async () => {
      const result = await service.sendMessage(STUDENT, 'hola');

      expect(result.guidanceLevel).toBeNull();
      expect(learningProgressService.countFailedAttempts).not.toHaveBeenCalled();
      expect(contextService.buildSystemPrompt.mock.calls[0][2]).toBeNull();
    });

    it('un activityId que no es un entero positivo se ignora', async () => {
      const result = await service.sendMessage(STUDENT, 'hola', { activityId: 'abc' });

      expect(result.guidanceLevel).toBeNull();
      expect(learningProgressService.countFailedAttempts).not.toHaveBeenCalled();
    });

    it('getGuidance expone nivel, si el Tutor está activo y el tope, para la interfaz', async () => {
      learningProgressService.countFailedAttempts.mockResolvedValue(9);
      settingsService.resolveForStudent.mockResolvedValue({ enabled: true, maxGuideLevel: 2, style: 'equilibrado' });

      await expect(service.getGuidance(STUDENT, 20)).resolves.toEqual({ guidanceLevel: 2, tutorEnabled: true, maxGuideLevel: 2 });
      await expect(service.getGuidance(STUDENT, undefined)).resolves.toEqual({ guidanceLevel: null, tutorEnabled: true, maxGuideLevel: 2 });
    });
  });

  describe('configuración del docente y barrera anti-solución', () => {
    const LONG_PROGRAM = [
      "const fs = require('fs');",
      "const n = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);",
      'let suma = 0;',
      'for (let i = 1; i <= n; i++) {',
      '  suma += i;',
      '}',
      'console.log(suma);',
    ].join('\n');

    it('si el docente desactivó el Tutor responde 403 sin pedir la clave, sin llamar a Google y sin tocar el historial', async () => {
      settingsService.resolveForStudent.mockResolvedValue({ enabled: false, maxGuideLevel: 3, style: 'equilibrado' });

      await expect(service.sendMessage(STUDENT, 'hola', { activityId: 20 })).rejects.toMatchObject({ status: 403 });
      expect(credentialService.getDecryptedKey).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(convRepo.save).not.toHaveBeenCalled();
    });

    it('consulta la configuración con la actividad y la unidad ya verificadas', async () => {
      await service.sendMessage(STUDENT, 'hola', { activityId: 20, learningUnitId: 7 });

      expect(settingsService.resolveForStudent).toHaveBeenCalledWith(STUDENT, { activityId: 20, unitId: 7 });
    });

    it('el tope de ayuda del docente limita el nivel aunque el estudiante lleve muchos intentos fallidos', async () => {
      learningProgressService.countFailedAttempts.mockResolvedValue(10);
      settingsService.resolveForStudent.mockResolvedValue({ enabled: true, maxGuideLevel: 1, style: 'equilibrado' });

      const result = await service.sendMessage(STUDENT, 'no me sale', { activityId: 20 });

      expect(result.guidanceLevel).toBe(1);
      expect(contextService.buildSystemPrompt.mock.calls[0][2]).toBe(1);
    });

    it('pasa el estilo elegido por el docente al prompt', async () => {
      settingsService.resolveForStudent.mockResolvedValue({ enabled: true, maxGuideLevel: 3, style: 'breve' });

      await service.sendMessage(STUDENT, 'hola');

      expect(contextService.buildSystemPrompt.mock.calls[0][3]).toBe('breve');
    });

    it('dentro de una actividad omite un programa completo que sería la solución', async () => {
      fetchMock.mockResolvedValue(geminiOk('Prueba esto:\n```javascript\n' + LONG_PROGRAM + '\n```'));

      const result = await service.sendMessage(STUDENT, 'no me sale', { activityId: 20, currentCode: '' });

      expect(result.message).toContain('Bloque de código omitido');
      expect(result.message).not.toContain('suma += i');
      expect(convRepo.save).toHaveBeenNthCalledWith(2, expect.objectContaining({ role: 'assistant', content: expect.stringContaining('Bloque de código omitido') }));
    });

    it('fuera de una actividad (estudiando teoría) no aplica la barrera', async () => {
      fetchMock.mockResolvedValue(geminiOk('Ejemplo:\n```javascript\n' + LONG_PROGRAM + '\n```'));

      const result = await service.sendMessage(STUDENT, 'muéstrame un ejemplo completo de leer un número');

      expect(result.message).toContain('suma += i');
      expect(result.message).not.toContain('Bloque de código omitido');
    });

    it('dentro de una actividad permite explicar el código del propio estudiante', async () => {
      fetchMock.mockResolvedValue(geminiOk('Tu programa:\n```javascript\n' + LONG_PROGRAM + '\n```\nLee n y suma.'));

      const result = await service.sendMessage(STUDENT, 'explícame qué hace mi código', { activityId: 20, currentCode: LONG_PROGRAM });

      expect(result.message).toContain('suma += i');
    });
  });

  describe('getHistory', () => {
    it('devuelve solo id, rol, contenido y fecha, y acota el límite', async () => {
      const createdAt = new Date('2026-09-19T10:00:00Z');
      convRepo.getHistory.mockResolvedValue([{ id: 5, studentId: 1, role: 'assistant', content: 'hola', createdAt, metadata: null }]);

      const rows = await service.getHistory(1, 9999);

      expect(convRepo.getHistory).toHaveBeenCalledWith(1, 50);
      expect(rows).toEqual([{ id: 5, role: 'assistant', content: 'hola', createdAt }]);
    });

    it('usa 20 mensajes por defecto y nunca menos de 1', async () => {
      await service.getHistory(1);
      await service.getHistory(1, -5);

      expect(convRepo.getHistory).toHaveBeenNthCalledWith(1, 1, 20);
      expect(convRepo.getHistory).toHaveBeenNthCalledWith(2, 1, 1);
    });
  });
});
