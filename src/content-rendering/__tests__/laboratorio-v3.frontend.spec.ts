// Mis proyectos y el Laboratorio v3 (Fase D, paso 6; cuadros «E-Proyectos», «E-Laboratorio» y «E-Laboratorio-Proyecto»)
// y la cabecera del Tutor (paso 7, P-11; cuadro «E-Tutor»).
import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

const L = cargar<{
  cuantasNuevas: (l: Array<{ createdAt: string; esMia: boolean }>, ultima: number | null) => number;
  haceCuanto: (iso: string, ahora?: number) => string;
  enlaceIdea: (i: { titulo: string; tipo: string }) => string;
  IDEAS_LABORATORIO: ReadonlyArray<{ titulo: string; pista: string }>;
  TIPOS_NUEVO: ReadonlyArray<{ texto: string }>;
}>('laboratorio');

describe('«Mis proyectos» como el cuadro', () => {
  it('pestañas Mis proyectos / Laboratorio, la franja del Laboratorio y los cuatro tipos como tarjetas', () => {
    const p = leer('pages', 'estudiante', 'proyectos', 'index.vue');
    expect(p).toContain('<ProyectosPestanas actual="mios"');
    expect(p).toContain('Prueba lo que crean tus compañeros y muestra lo tuyo');
    expect(L.TIPOS_NUEVO.map((t) => t.texto)).toEqual(['Página web', 'JavaScript', 'Pseudocódigo', 'Diagrama de flujo']);
    // El recorrido guiado sigue encontrando sus dos piezas.
    expect(p).toContain('data-recorrido="nuevo-proyecto"');
    expect(p).toContain('aria-labelledby="lista-proyectos"');
  });
  it('una idea del Laboratorio abre «Nuevo proyecto» con el nombre y el tipo puestos', () => {
    expect(L.enlaceIdea({ titulo: 'Tarjeta de cumpleaños', tipo: 'web' })).toBe('/estudiante/proyectos?nuevo=web&nombre=Tarjeta%20de%20cumplea%C3%B1os#nuevo-proyecto');
    expect(leer('pages', 'estudiante', 'proyectos', 'index.vue')).toContain('route.query.nombre');
  });
  it('las ideas no dicen qué ya sabe el estudiante ni cuánto tarda (no lo sabemos)', () => {
    for (const i of L.IDEAS_LABORATORIO) expect(`${i.titulo} ${i.pista}`).not.toMatch(/✓|\d+\s*min/);
  });
  it('desde el proyecto se publica en el Laboratorio, sin otra ventana', () => {
    expect(leer('pages', 'estudiante', 'proyectos', '[id].vue')).toContain('<ProyectosPublicarLaboratorio :proyecto-id="proyecto.id" />');
    expect(leer('components', 'proyectos', 'PublicarLaboratorio.vue')).toContain('¿Te gustó cómo quedó? Compártelo para que tu clase lo pruebe.');
  });
});

describe('El Laboratorio', () => {
  it('«N nuevos» cuenta lo de otros desde la visita anterior; sin visita guardada, nada es nuevo', () => {
    const lista = [
      { createdAt: '2026-11-14T10:00:00Z', esMia: false },
      { createdAt: '2026-11-14T12:00:00Z', esMia: true },
      { createdAt: '2026-11-10T12:00:00Z', esMia: false },
    ];
    expect(L.cuantasNuevas(lista, Date.parse('2026-11-13T00:00:00Z'))).toBe(1);
    expect(L.cuantasNuevas(lista, null)).toBe(0);
  });
  it('cuándo se publicó, en palabras', () => {
    const ahora = Date.parse('2026-11-14T15:00:00Z');
    expect(L.haceCuanto('2026-11-14T13:00:00Z', ahora)).toBe('hace 2 h');
    expect(L.haceCuanto('2026-11-13T15:00:00Z', ahora)).toBe('ayer');
    expect(L.haceCuanto('2026-11-14T14:59:40Z', ahora)).toBe('ahora');
  });
  it('las llamadas van por su composable (PAT-01) y la pantalla no inventa un «Reto de la semana»', () => {
    const lista = leer('pages', 'estudiante', 'proyectos', 'laboratorio', 'index.vue');
    const detalle = leer('pages', 'estudiante', 'proyectos', 'laboratorio', '[id].vue');
    for (const p of [lista, detalle]) expect(p).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    expect(lista.replace(/<!--[\s\S]*?-->/g, '')).not.toMatch(/Reto de la semana/i);
    expect(leer('composables', 'useLaboratorio.ts')).toContain('/laboratorio/${id}/reportes');
  });
  it('un proyecto se prueba, se copia y recibe mensajes amables; se puede reportar', () => {
    const detalle = leer('pages', 'estudiante', 'proyectos', 'laboratorio', '[id].vue');
    expect(detalle).toContain('<ProyectosResultadoProyecto');
    expect(detalle).toContain('Hacer mi copia');
    const mensajes = leer('components', 'proyectos', 'MensajesLaboratorio.vue');
    expect(mensajes).toContain('Escribe un comentario amable…');
    expect(mensajes).toContain('; el profe lo revisa.');
  });
});

describe('La cabecera del Tutor como «E-Tutor» (P-11)', () => {
  it('debajo de «Tu Tutor» dice dónde está y, en pantalla ancha, se pliega con «Plegar»', () => {
    const t = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(t).toContain("{{ activeContextLabel || 'Te guía con preguntas y pistas; no te da la solución' }}");
    expect(t).toContain(":aria-label=\"pantallaAncha ? 'Plegar el Tutor' : 'Cerrar Tutor'\"");
  });
});
