import { TutorService, textoDeEventoGemini } from './tutor.service';
import { crearFiltroEnVivo, REDACTED_CODE_NOTICE } from './tutor-solution-guard';

// La respuesta del Tutor por partes (ítem 2 de la evaluación heurística, docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md).

const STUDENT: any = { id: 1, role: 'estudiante' };
const PROGRAMA = [
  "const fs = require('fs');",
  "const n = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);",
  'let suma = 0;',
  'for (let i = 1; i <= n; i++) {',
  '  suma += i;',
  '}',
  'console.log(suma);',
].join('\n');

/** Una respuesta de Gemini con SSE que llega en los trozos de bytes dados. */
function geminiEnVivo(trozosDeTexto: string[], cortarEnBytes = 7) {
  const sse = trozosDeTexto.map((t) => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: t }] } }] })}\r\n\r\n`).join('');
  const bytes = new TextEncoder().encode(sse);
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      for (let i = 0; i < bytes.length; i += cortarEnBytes) c.enqueue(bytes.slice(i, i + cortarEnBytes));
      c.close();
    },
  });
  return { ok: true, status: 200, body, text: async () => '' };
}

describe('Filtro en vivo de la barrera anti-solución', () => {
  const pasar = (trozos: string[]) => {
    const f = crearFiltroEnVivo();
    const salidas = trozos.map((t) => f.agregar(t));
    return { salidas, total: salidas.join('') + f.terminar() };
  };

  it('el texto sin código pasa al instante, trozo por trozo', () => {
    const { salidas, total } = pasar(['Piensa en ', 'qué guarda la variable.']);
    expect(salidas).toEqual(['Piensa en ', 'qué guarda la variable.']);
    expect(total).toBe('Piensa en qué guarda la variable.');
  });

  it('una solución completa nunca se ve, ni a medias, aunque llegue partida en muchos trozos', () => {
    const texto = 'Mira:\n```javascript\n' + PROGRAMA + '\n```\n¿Ves la idea?';
    const trozos = texto.match(/[\s\S]{1,5}/g) ?? [];
    const { salidas, total } = pasar(trozos);
    expect(salidas.join('')).not.toContain('suma +=');
    expect(total).toContain(REDACTED_CODE_NOTICE);
    expect(total).toContain('¿Ves la idea?');
    expect(total).not.toContain('readFileSync');
  });

  it('un ejemplo corto se muestra completo cuando su bloque se cierra', () => {
    const { salidas, total } = pasar(['Un ciclo: ``', '`js\nfor (let i = 0; i < 3; i++) {}\n`', '``\nListo']);
    expect(salidas[0]).toBe('Un ciclo: ');
    expect(salidas[1]).toBe('');
    expect(total).toContain('for (let i = 0; i < 3; i++) {}');
  });

  it('un bloque que nunca se cierra también pasa por la barrera al terminar', () => {
    const { salidas, total } = pasar(['Así:\n```js\n' + PROGRAMA]);
    expect(salidas.join('')).toBe('Así:\n');
    expect(total).toContain(REDACTED_CODE_NOTICE);
  });
});

describe('Lectura del SSE de Gemini', () => {
  it.each([
    ['data: {"candidates":[{"content":{"parts":[{"text":"Hola"},{"text":" tú"}]}}]}', 'Hola tú'],
    ['data: {"candidates":[{"finishReason":"STOP"}]}', ''],
    [': comentario', ''],
    ['data: {roto', ''],
  ])('%s', (linea, esperado) => {
    expect(textoDeEventoGemini(linea)).toBe(esperado);
  });
});

describe('TutorService.sendMessageEnVivo', () => {
  let service: TutorService;
  let convRepo: any;
  let fetchMock: jest.Mock;
  let fallidos: jest.Mock;
  const realFetch = global.fetch;

  beforeEach(() => {
    convRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getRecentContext: jest.fn().mockResolvedValue([]),
    };
    fallidos = jest.fn().mockResolvedValue(0);
    service = new TutorService(
      convRepo,
      { buildSystemPrompt: jest.fn().mockResolvedValue('SYSTEM PROMPT') } as any,
      { get: jest.fn((k: string, d?: any) => (k === 'GEMINI_MODEL' ? 'gemini-flash-latest' : d)) } as any,
      { escapePlainText: jest.fn((s: string) => s) } as any,
      { suggestForUnit: jest.fn().mockResolvedValue(null), suggestAmbient: jest.fn().mockResolvedValue(null) } as any,
      { getDecryptedKey: jest.fn().mockResolvedValue('AIzaFAKEKEYFORTESTS1234567890abcdefgh') } as any,
      { findOne: jest.fn().mockResolvedValue({ id: 7, title: 'Bucles' }) } as any,
      { countFailedAttempts: fallidos } as any,
      {
        resolveForStudent: jest.fn().mockResolvedValue({ enabled: true, maxGuideLevel: 3, style: 'equilibrado' }),
        refuerzoConLaActividad: jest.fn().mockResolvedValue(null),
      } as any,
      { find: jest.fn().mockResolvedValue([]) } as any,
      { findOne: jest.fn().mockResolvedValue(null) } as any,
    );
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
  });

  afterEach(() => {
    (global as any).fetch = realFetch;
  });

  it('manda cada trozo a medida que llega, con la clave en la cabecera, y guarda el texto completo al final', async () => {
    fetchMock.mockResolvedValue(geminiEnVivo(['¿Qué valor ', 'tiene i ', 'al empezar?']));
    const trozos: string[] = [];

    const r = await service.sendMessageEnVivo(STUDENT, 'no entiendo el ciclo', undefined, (t) => trozos.push(t));

    expect(trozos.length).toBeGreaterThan(1);
    expect(trozos.join('')).toBe('¿Qué valor tiene i al empezar?');
    expect(r.message).toBe('¿Qué valor tiene i al empezar?');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain(':streamGenerateContent?alt=sse');
    expect(url).not.toContain('AIza');
    expect(init.headers['x-goog-api-key']).toBe('AIzaFAKEKEYFORTESTS1234567890abcdefgh');
    expect(convRepo.save).toHaveBeenNthCalledWith(2, { studentId: 1, role: 'assistant', content: '¿Qué valor tiene i al empezar?' });
  });

  it('en un ejercicio, la solución no se ve mientras llega ni se guarda', async () => {
    fetchMock.mockResolvedValue(geminiEnVivo(['Prueba esto:\n```javascript\n', PROGRAMA.slice(0, 40), PROGRAMA.slice(40) + '\n```\n¿Te sirve?']));
    const trozos: string[] = [];

    const r = await service.sendMessageEnVivo(STUDENT, 'dame la solución', { activityId: 20, learningUnitId: 7 }, (t) => trozos.push(t));

    expect(trozos.join('')).not.toContain('suma +=');
    expect(r.message).toContain(REDACTED_CODE_NOTICE);
    expect(r.message).not.toContain('readFileSync');
  });

  it('si un modelo falla antes de empezar, prueba el siguiente', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => '' })
      .mockResolvedValueOnce(geminiEnVivo(['Hola de nuevo']));

    const r = await service.sendMessageEnVivo(STUDENT, 'hola', undefined, () => undefined);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(r.message).toBe('Hola de nuevo');
  });

  it('una clave inválida responde 422 antes de mandar nada, como en el chat de siempre', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400, text: async () => '{"error":{"details":[{"reason":"API_KEY_INVALID"}]}}' });
    const trozos: string[] = [];

    await expect(service.sendMessageEnVivo(STUDENT, 'hola', undefined, (t) => trozos.push(t))).rejects.toMatchObject({ status: 422 });
    expect(trozos).toEqual([]);
    expect(convRepo.save).not.toHaveBeenCalled();
  });
});
