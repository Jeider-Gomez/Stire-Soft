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

type Expresion = 'normal' | 'contento' | 'atento' | 'pensando' | 'hablando' | 'acierto' | 'error' | 'animo' | 'durmiendo';
interface Senales { activo: boolean; pensando: boolean; escribiendo: boolean; ultimoError: boolean; hablando: boolean; reaccion: 'acierto' | 'error' | 'animo' | null; encima?: boolean }
const m = cargar<{
  expresionTutor: (s: Senales) => Expresion;
  OJOS: Record<Expresion, string[] | null>;
  BOCA: Record<Expresion, string>;
  SIGNIFICADO: Record<Expresion, string>;
  esperaParpadeo: (azar: number) => number;
  miradaHacia: (dx: number, dy: number, maximo?: number) => { x: number; y: number };
  reaccionAlResultado: (ok: boolean, fallos: number) => 'acierto' | 'error' | 'animo';
  GESTO: Record<Expresion, string | null>;
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
  const todas: Expresion[] = ['normal', 'contento', 'atento', 'pensando', 'hablando', 'acierto', 'error', 'animo', 'durmiendo'];
  it.each(todas)('%s tiene boca y significado; los ojos son trazos o los puntos de «pensando»', (e) => {
    expect(m.BOCA[e]).toMatch(/^M/);
    expect(m.SIGNIFICADO[e].length).toBeGreaterThan(3);
    if (e === 'pensando' || e === 'animo') expect(m.OJOS[e]).toBeNull();
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
    expect(ws.match(/avisarResultado\(res\.allPassed/g)).toHaveLength(2);
    expect(ws).toContain('avisarResultado(aprobo');
  });
  it('la mascota escucha ese aviso sin depender del store del ejercicio', () => {
    const c = leer('composables', 'useExpresionTutor.ts');
    expect(c).toContain('addEventListener(EVENTO_RESULTADO');
    expect(c).toContain('removeEventListener(EVENTO_RESULTADO');
    expect(c).not.toContain('useWorkspaceStore');
  });
});

describe('el logo es el mismo personaje y el nombre es STIRE', () => {
  it('el logo es una marca fija: no parpadea, no respira ni sigue el puntero (la vida es del Tutor)', () => {
    const logo = leer('components', 'layout', 'Logo.vue');
    expect(logo).not.toMatch(/animation|setTimeout|pointermove|<TutorMascota/);
    expect(logo).toContain('shape-rendering="geometricPrecision"');
    // con el nombre «stire_» del logo aprobado, en el encabezado, el acceso y la ayuda
    expect(logo).toContain('st<span class="i">ı</span>re<span class="cursor" />');
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('<LayoutLogo con-nombre />');
    expect(leer('layouts', 'auth.vue')).toContain('<LayoutLogo con-nombre />');
    expect(leer('pages', 'ayuda.vue')).toContain('<LayoutLogo con-nombre claro />');
    expect(leer('components', 'layout', 'MarcaST.vue')).toContain('<LayoutLogo :tamano="tamano" />');
    // sin agrandarse al pasar el puntero
    expect(leer('components', 'layout', 'HeaderNav.vue')).not.toContain('group-hover:scale-105');
  });
  it('la mascota no se ve pixelada: el movimiento va dentro del dibujo y en pequeño los trazos son gruesos', () => {
    const vue = leer('components', 'tutor', 'Mascota.vue');
    // la etiqueta <svg> no lleva la clase que respira: la lleva el grupo de adentro
    expect(vue).toMatch(/<svg[^>]*class="mascota-tutor"[^>]*shape-rendering="geometricPrecision"/);
    expect(vue).not.toMatch(/<svg[^>]*respira/);
    expect(vue).toContain('<g class="respiro" :class="{ respira: vivo && !quieta');
    expect(vue).toContain('const pequena = computed(() => props.tamano < 32)');
    expect(vue).toContain('<g v-if="!pequena" fill="none"');
  });
  it('la pestaña usa el favicon nuevo y ningún texto visible dice «STIRE-Soft»', () => {
    const config = leer('nuxt.config.ts');
    expect(config).toContain("href: '/favicon.svg'");
    expect(leer('public', 'favicon.svg')).toContain('#082B6B');
    for (const f of [['nuxt.config.ts'], ['components', 'layout', 'HeaderNav.vue'], ['components', 'layout', 'FooterBar.vue'], ['layouts', 'auth.vue'], ['pages', 'ayuda.vue'], ['pages', 'index.vue'], ['utils', 'tituloPagina.ts']]) {
      expect(leer(...f)).not.toMatch(/STIRE[- ]Soft|>Soft</);
    }
  });
  it('en alto contraste: pantalla negra, gafas amarillas y el marco del color del texto del tema', () => {
    const vue = leer('components', 'tutor', 'Mascota.vue');
    expect(vue).toMatch(/:global\(:root\[data-contraste="alto"\]\) \.mascota-tutor \{[\s\S]*--m-pantalla: #000; --m-gafas: #ffd60a/);
    expect(vue).toContain('--m-marco: rgb(var(--c-base-texto-primario))');
    // los colores salen de variables, no de atributos fijos
    expect(vue).not.toMatch(/(fill|stroke)="#/);
  });
});

describe('personalidad: cada situación tiene su cara y su gesto, y son coherentes', () => {
  it('al pasar el puntero por el lanzador se alegra, pero nunca por encima de algo que pasa de verdad', () => {
    expect(m.expresionTutor({ ...base, encima: true })).toBe('contento');
    expect(m.expresionTutor({ ...base, encima: true, pensando: true })).toBe('pensando');
    expect(m.expresionTutor({ ...base, encima: true, escribiendo: true })).toBe('atento');
  });
  it('no se frustra: tras tres fallos seguidos deja la cara de error y pasa a animar', () => {
    expect(m.reaccionAlResultado(true, 0)).toBe('acierto');
    expect(m.reaccionAlResultado(false, 1)).toBe('error');
    expect(m.reaccionAlResultado(false, 2)).toBe('error');
    expect(m.reaccionAlResultado(false, 3)).toBe('animo');
    expect(m.expresionTutor({ ...base, reaccion: 'animo' })).toBe('animo');
  });
  it('cada reacción tiene un gesto del cuerpo que la acompaña', () => {
    expect(m.GESTO.acierto).toBe('salta');
    expect(m.GESTO.error).toBe('niega');
    expect(m.GESTO.animo).toBe('asiente');
    expect(m.GESTO.pensando).toBe('ladea');
    expect(m.GESTO.contento).toBe('rebota');
    const vue = leer('components', 'tutor', 'Mascota.vue');
    for (const g of Object.values(m.GESTO).filter(Boolean)) expect(vue).toContain(`.gesto-${g} {`);
  });
  it('guiña al abrir el chat, suelta chispas al acertar y mira alrededor cuando nadie la usa', () => {
    const vue = leer('components', 'tutor', 'Mascota.vue');
    expect(leer('components', 'tutor', 'TutorChatDrawer.vue')).toMatch(/<TutorMascota[^>]*forma="completa"[^>]*saludar/);
    expect(vue).toContain('if (props.saludar) luego(350, guinar)');
    expect(vue).toContain(`<g v-if="expresion === 'acierto' && !quieta" class="chispas"`);
    expect(vue).toContain('function mirarAlrededor()');
    expect(vue).toMatch(/\.respira, \.boca\.habla, \.zeta, \.ojo\.guina, \.ojos\.mirando, \.cuerpo, \.chispa \{ animation: none !important; \}/);
  });
  it('el ejercicio le cuenta cuántos fallos van seguidos', () => {
    const ws = leer('stores', 'workspace.ts');
    expect(ws.match(/avisarResultado\(res\.allPassed, fallosSeguidos\.value\)/g)).toHaveLength(2);
    expect(ws).toContain('avisarResultado(aprobo, fallosSeguidos.value)');
    expect(leer('components', 'tutor', 'LanzadorTutor.vue')).toContain('useExpresionTutor(undefined, encima)');
  });
});
