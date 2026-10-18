/**
 * Hablarle al Tutor con la voz (Jeider, 17/10: «lo probé en Brave y en Chrome y ninguno funcionó»). El dictado del navegador
 * (SpeechRecognition) depende de un servicio de Google que Brave no trae y que falla sin decir nada; por eso ahora el
 * navegador graba el audio, lo pasa a WAV y el servidor se lo da a Gemini con la clave gratuita del estudiante, que lo
 * convierte en texto. Funciona igual en Chrome, Edge, Brave, Firefox y Safari, y no cuesta nada.
 */

/** Unos 60 s de voz en WAV de 16 kHz, mono, 16 bits (32 KB por segundo), con margen. */
export const MAX_BYTES_AUDIO = 2 * 1024 * 1024;

/** El navegador siempre manda WAV («RIFF» … «WAVE»): Gemini lo acepta y no depende del formato que grabe cada navegador. */
export function esWav(audio: Buffer): boolean {
  return audio.length > 44 && audio.toString('ascii', 0, 4) === 'RIFF' && audio.toString('ascii', 8, 12) === 'WAVE';
}

export const INSTRUCCION_TRANSCRIBIR =
  'Transcribe exactamente lo que dice la persona en este audio, en español. Es un estudiante que le pregunta algo a su ' +
  'tutor de programación: respeta los términos técnicos (for, while, if, console.log, variable, arreglo). Devuelve solo ' +
  'el texto, sin comillas, sin explicaciones y sin responder la pregunta. Si no se oye ninguna voz, devuelve un texto vacío.';

/** Lo que se le pide a Gemini: el audio y la instrucción, con temperatura 0 para que no invente. */
export function cuerpoTranscripcion(audio: Buffer) {
  return {
    contents: [{ role: 'user', parts: [{ inline_data: { mime_type: 'audio/wav', data: audio.toString('base64') } }, { text: INSTRUCCION_TRANSCRIBIR }] }],
    generationConfig: { maxOutputTokens: 512, temperature: 0 },
  };
}

/** Gemini a veces envuelve el texto en comillas o deja saltos de línea: se entrega una sola línea limpia. */
export function limpiarTranscripcion(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim().replace(/^["«“']+|["»”']+$/g, '').trim();
}
