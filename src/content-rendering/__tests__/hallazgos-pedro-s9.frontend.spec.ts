import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// UI-04 (Pedro, S09-V-PEDRO, 16/10): al marcar «No me quedó claro», las otras formas que ESTA lección trae.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

const f = cargar<{ formasDisponibles: (hay: (s: string) => boolean) => Array<{ selector: string; texto: string }> }>('formasLeccion');

describe('UI-04: «No me quedó claro» ofrece solo las formas que la lección tiene', () => {
  it('una lección con diagrama y sin video ofrece el diagrama y escucharla, no el video', () => {
    const hay = new Set(['[data-forma="algoritmo"]', '#escuchar-leccion']);
    expect(f.formasDisponibles((s) => hay.has(s)).map((x) => x.texto)).toEqual(['Verlo como diagrama o paso a paso', 'Escuchar la lección']);
    expect(f.formasDisponibles(() => false)).toEqual([]);
  });

  it('las partes de la lección llevan su marca y el aviso ya no promete formas que no existen', () => {
    const c = leer('components', 'ContenidoLeccion.vue');
    expect(c).toContain('data-forma="vivo"');
    expect(c).toContain('data-forma="algoritmo"');
    expect(leer('components', 'LessonResource.vue')).toContain(`:data-forma="insertable ? 'recurso' : undefined"`);
    const v = leer('components', 'ValorarLeccion.vue');
    expect(v).toContain('formasDisponibles((sel) => !!document.querySelector(sel))');
    expect(v).not.toContain('o ver el algoritmo como diagrama o paso a paso');
  });
});

describe('el Tutor abierto con una pregunta no responde con el saludo (Jeider, 17/10)', () => {
  it('los botones que abren el Tutor con una pregunta no piden el saludo proactivo', () => {
    const t = leer('stores', 'tutor.ts');
    expect(t).toMatch(/async function openDrawer\(opciones: \{ conPregunta\?: boolean \} = \{\}\) \{\s*if \(opciones\.conPregunta\) hasGreeted\.value = true/);
    expect(t.match(/await openDrawer\(\{ conPregunta: true \}\)/g)?.length).toBe(5);
    expect(leer('components', 'LessonResource.vue')).toContain("await useTutorStore().preguntarPorRecurso(props.title || 'de la lección')");
    expect(leer('pages', 'estudiante', 'evaluacion', '[activityId].vue')).toContain('await tutorStore.openDrawer({ conPregunta: true })');
  });
});

describe('UI-04: si un video de YouTube no se puede ver, STIRE muestra qué hacer (Jeider, 17/10)', () => {
  const v = cargar<{ conAvisoDeErrores: (s: string, o: string) => string; errorDelReproductor: (d: unknown, o: string) => number | null }>('errorVideo');

  it('activa los avisos del reproductor solo en los videos de YouTube', () => {
    expect(v.conAvisoDeErrores('https://www.youtube-nocookie.com/embed/abc', 'https://stire-soft.vercel.app'))
      .toBe('https://www.youtube-nocookie.com/embed/abc?enablejsapi=1&origin=https%3A%2F%2Fstire-soft.vercel.app');
    expect(v.conAvisoDeErrores('https://docs.google.com/presentation/d/x/embed', 'https://a')).toBe('https://docs.google.com/presentation/d/x/embed');
  });

  it('reconoce el «onError» de YouTube y no hace caso a mensajes de otros sitios', () => {
    expect(v.errorDelReproductor('{"event":"onError","info":150}', 'https://www.youtube-nocookie.com')).toBe(150);
    expect(v.errorDelReproductor('{"event":"onReady","info":null}', 'https://www.youtube-nocookie.com')).toBeNull();
    expect(v.errorDelReproductor('{"event":"onError","info":150}', 'https://malicioso.example')).toBeNull();
    expect(v.errorDelReproductor('no es json', 'https://www.youtube.com')).toBeNull();
  });

  it('el recurso cambia el recuadro por el aviso con sus alternativas', () => {
    const r = leer('components', 'LessonResource.vue');
    expect(r).toContain('Este video no se puede ver aquí.');
    expect(r).toContain('if (!marco.value || e.source !== marco.value.contentWindow) return');
    expect(r).toContain('Que el Tutor me explique el tema');
  });
});

describe('el docente se entera de un recurso que no funciona (Jeider, 17/10)', () => {
  it('YouTube con error y «Pedirle al Tutor» avisan al docente, sin bloquear al estudiante', () => {
    const r = leer('components', 'LessonResource.vue');
    expect(r).toContain("await recursoFalla.reportar(unitId, (props.title || 'Recurso de la lección').slice(0, 200), motivo)");
    expect(leer('composables', 'useRecursoFalla.ts')).toContain('/recurso-falla`');
    expect(r).toMatch(/videoFallo\.value = true\s*avisarAlDocente\('no-se-puede-ver'\)/);
    expect(r).toMatch(/async function pedirAlTutor\(\) \{\s*avisarAlDocente\('no-carga'\)/);
    expect(r).toContain('Ya le avisamos a tu docente para que lo revise.');
  });
});
