import { cuerpoTranscripcion, esWav, limpiarTranscripcion, MAX_BYTES_AUDIO } from './tutor-voz';

// Jeider, 17/10: el dictado del navegador no funcionó ni en Brave ni en Chrome. Ahora el audio lo transcribe Gemini.
describe('hablarle al Tutor con la voz', () => {
  const wav = (n = 100) => {
    const b = Buffer.alloc(n);
    b.write('RIFF', 0, 'ascii');
    b.write('WAVE', 8, 'ascii');
    return b;
  };

  it('solo acepta WAV (lo que manda el navegador) y no confunde otro archivo', () => {
    expect(esWav(wav())).toBe(true);
    expect(esWav(Buffer.from('<html>no es audio</html>'))).toBe(false);
    expect(esWav(wav(20))).toBe(false);
  });

  it('le manda a Gemini el audio en WAV y una instrucción de solo transcribir, sin inventar', () => {
    const c = cuerpoTranscripcion(wav());
    const partes = c.contents[0].parts as Array<{ inline_data?: { mime_type: string; data: string }; text?: string }>;
    expect(partes[0].inline_data?.mime_type).toBe('audio/wav');
    expect(Buffer.from(partes[0].inline_data!.data, 'base64').toString('ascii', 0, 4)).toBe('RIFF');
    expect(partes[1].text).toMatch(/sin responder la pregunta/);
    expect(c.generationConfig.temperature).toBe(0);
  });

  it('entrega una sola línea, sin comillas', () => {
    expect(limpiarTranscripcion('«¿Cómo hago un ciclo for?»\n')).toBe('¿Cómo hago un ciclo for?');
    expect(limpiarTranscripcion('  hola   profe  ')).toBe('hola profe');
  });

  it('cabe un minuto de voz', () => {
    expect(MAX_BYTES_AUDIO).toBeGreaterThan(60 * 32_000);
  });
});
