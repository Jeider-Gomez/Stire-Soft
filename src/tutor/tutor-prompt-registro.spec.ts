import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import { TutorContextService, VERSION_PROMPT_TUTOR } from './tutor-context.service';

/**
 * El registro de los prompts del Tutor (31/10, Jeider: «quiero llevar un registro de esos prompts»). El prompt no es un
 * texto fijo: se arma en cada mensaje con piezas que entran según la pantalla. Esta prueba arma el prompt de cada
 * situación con datos fijos y lo compara con su instantánea en docs/prompts/instantaneas/, así que cambiar lo que dice
 * el Tutor deja huella visible en el commit y obliga a anotar el porqué en docs/prompts/README.md.
 *
 * Para actualizar las instantáneas después de un cambio a propósito:
 *   UPDATE_PROMPTS=1 npx jest src/tutor/tutor-prompt-registro
 */
const raiz = path.join(__dirname, '..', '..', 'docs', 'prompts');
const carpeta = path.join(raiz, 'instantaneas');

const LECCION = '[texto de la lección, de ejemplo]';
const ENUNCIADO = '[enunciado del ejercicio, de ejemplo]';

const escenarios: Record<string, { contexto: any; nivelDeAyuda: 1 | 2 | 3 | null }> = {
  'leyendo-una-leccion': {
    contexto: { currentRoute: '/estudiante/unidad/5', lessonTitle: 'Variables y tipos de datos', lessonText: LECCION },
    nivelDeAyuda: null,
  },
  'ejercicio-de-completar': {
    contexto: {
      currentRoute: '/estudiante/evaluacion/19',
      activityTitle: 'Completa la presentación',
      activityDescription: ENUNCIADO,
      tipoEjercicio: 'completar',
      currentCode: '⟦const⟧ nombre = "Luisa";\nlet edad = ___b___;',
      lessonTitle: 'Variables y tipos de datos',
      lessonText: LECCION,
    },
    nivelDeAyuda: 2,
  },
  'ejercicio-de-programar': {
    contexto: {
      currentRoute: '/estudiante/evaluacion/20',
      activityTitle: 'Saludo personalizado',
      activityDescription: ENUNCIADO,
      currentCode: 'const nombre = lineas[0];',
      lessonTitle: 'Variables y tipos de datos',
      lessonText: LECCION,
    },
    nivelDeAyuda: 1,
  },
};

/** El saludo según la hora cambia con el reloj: se deja fijo para que la instantánea no dependa de cuándo se corra. */
const sinReloj = (texto: string) => texto.replace(/¡Buen(os días|as tardes|as noches)!/g, '¡Buenas tardes!').replace(/\r\n/g, '\n');

describe('Registro de los prompts del Tutor', () => {
  const servicio = new TutorContextService({ find: jest.fn().mockResolvedValue([]) } as any);

  it.each(Object.keys(escenarios))('instantánea al día: %s', async (nombre) => {
    const { contexto, nivelDeAyuda } = escenarios[nombre];
    const prompt = sinReloj(await servicio.buildSystemPrompt(1, contexto, nivelDeAyuda, undefined, null));
    const archivo = path.join(carpeta, `tutor-${nombre}.md`);
    const cuerpo = `<!-- Prompt del Tutor armado para: ${nombre}. Versión ${VERSION_PROMPT_TUTOR}. Se genera con la prueba tutor-prompt-registro.spec.ts; no se edita a mano. -->\n${prompt}\n`;

    if (process.env.UPDATE_PROMPTS === '1') {
      mkdirSync(carpeta, { recursive: true });
      writeFileSync(archivo, cuerpo, 'utf8');
    }
    expect(existsSync(archivo)).toBe(true);
    expect(sinReloj(readFileSync(archivo, 'utf8'))).toBe(cuerpo);
  });

  it('la versión del prompt está anotada en el historial, con su porqué', () => {
    const historial = readFileSync(path.join(raiz, 'README.md'), 'utf8');
    expect(historial).toContain(VERSION_PROMPT_TUTOR);
  });
});
