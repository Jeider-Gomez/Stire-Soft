import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// La mascota del Tutor (utils/mascotaTutor.ts, components/tutor/Mascota.vue): la pantalla con gafas del logo pone una
// cara según lo que pasa en la página y se mueve sola para que se sienta viva.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Expresion = 'normal' | 'atento' | 'pensando' | 'hablando' | 'acierto' | 'error' | 'durmiendo';
interface Senales { activo: boolean; pensando: boolean; escribiendo: boolean; ultimoError: boolean; hablando: boolean; reaccion: 'acierto' | 'error' | null }
const m = cargar<{
  expresionTutor: (s: Senales) => Expresion;
  OJOS: Record<Expresion, string[] | null>;
  BOCA: Record<Expresion, string>;
  SIGNIFICADO: Record<Expresion, string>;
  esperaParpadeo: (azar: number) => number;
  miradaHacia: (dx: number, dy: number, maximo?: number) => { x: number; y: number };
}>('mascotaTutor');

const base: Senales = { activo: true, pensando: false, escribiendo: false, ultimoError: false, hablando: false, reaccion: null };

describe('qué cara pone el Tutor', () => {
  it('sin nada que hacer, la cara normal', () => expect(m.expresionTutor(base)).toBe('normal'));
  it('apagado por el docente, duerme aunque pase lo que pase', () => {
    expect(m.expresionTutor({ ...base, activo: false, pensando: true, reaccion: 'acierto' })).toBe('durmiendo');
  });
  it('la reacción a «Probar» o «Entregar» gana a todo lo demás mientras dura', () => {
    expect(m.expresionTutor({ ...base, reaccion: 'acierto', pensando: true })).toBe('acierto');
    expect(m.expresionTutor({ ...base, reaccion: 'error', escribiendo: true })).toBe('error');
  });
  it('piensa mientras llega la respuesta, antes que mostrar un error viejo', () => {
    expect(m.expresionTutor({ ...base, pensando: true, ultimoError: true })).toBe('pensando');
  });
  it('un error del Tutor se ve hasta que pasa otra cosa', () => expect(m.expresionTutor({ ...base, ultimoError: true, escribiendo: true })).toBe('error'));
  it('mueve la boca al responder y atiende cuando el estudiante escribe', () => {
    expect(m.expresionTutor({ ...base, hablando: true, escribiendo: true })).toBe('hablando');
    expect(m.expresionTutor({ ...base, escribiendo: true })).toBe('atento');
  });
});

describe('cada expresión está dibujada', () => {
  const todas: Expresion[] = ['normal', 'atento', 'pensando', 'hablando', 'acierto', 'error', 'durmiendo'];
  it.each(todas)('%s tiene boca y significado; los ojos son trazos o los puntos de «pensando»', (e) => {
    expect(m.BOCA[e]).toMatch(/^M/);
    expect(m.SIGNIFICADO[e].length).toBeGreaterThan(3);
    if (e === 'pensando') expect(m.OJOS[e]).toBeNull();
    else expect(m.OJOS[e]).toHaveLength(2);
  });
  it('los ojos normales son las etiquetas < > del logo', () => {
    expect(m.OJOS.normal).toEqual(['M76 70 L66 80 L76 90', 'M128 70 L138 80 L128 90']);
  });
});

describe('se siente viva sin distraer', () => {
  it('parpadea cada 2,5 a 6 segundos, también con valores fuera de rango', () => {
    expect(m.esperaParpadeo(0)).toBe(2500);
    expect(m.esperaParpadeo(1)).toBe(6000);
    expect(m.esperaParpadeo(-3)).toBe(2500);
    expect(m.esperaParpadeo(9)).toBe(6000);
  });
  it('los ojos miran hacia el puntero sin salirse de la lente', () => {
    expect(m.miradaHacia(0, 0)).toEqual({ x: 0, y: 0 });
    const lejos = m.miradaHacia(5000, 0);
    expect(lejos).toEqual({ x: 3, y: 0 });
    const diagonal = m.miradaHacia(-1000, -1000);
    expect(Math.hypot(diagonal.x, diagonal.y)).toBeLessThanOrEqual(3.01);
    expect(diagonal.x).toBeLessThan(0);
  });
  it('con «reducir movimiento» se queda quieta', () => {
    const vue = leer('components', 'tutor', 'Mascota.vue');
    expect(vue).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(vue).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none/);
  });
  it('los avatares de los mensajes van quietos; la cabecera y el lanzador, vivos', () => {
    const chat = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(chat).toMatch(/<TutorMascota v-if="msg\.sender !== 'student'"[^>]*:vivo="false"/);
    expect(chat).toContain('useExpresionTutor(escribiendo)');
    expect(leer('components', 'tutor', 'LanzadorTutor.vue')).toContain('<TutorMascota :expresion="expresion"');
  });
});

describe('reacciona al resultado del ejercicio', () => {
  it('«Probar» (código y HTML/CSS) y «Entregar» avisan el resultado', () => {
    const ws = leer('stores', 'workspace.ts');
    expect(ws.match(/avisarResultado\(res\.allPassed\)/g)).toHaveLength(2);
    expect(ws).toContain('avisarResultado(aprobo)');
  });
  it('la mascota escucha ese aviso sin depender del store del ejercicio', () => {
    const c = leer('composables', 'useExpresionTutor.ts');
    expect(c).toContain('addEventListener(EVENTO_RESULTADO');
    expect(c).toContain('removeEventListener(EVENTO_RESULTADO');
    expect(c).not.toContain('useWorkspaceStore');
  });
});
