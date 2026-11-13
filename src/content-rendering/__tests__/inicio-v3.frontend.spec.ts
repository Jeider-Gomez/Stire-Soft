// Inicio del estudiante v3 (Fase D, paso 1; cuadros «E-Inicio», «E-Inicio-Oscuro» y «E-Cel-Inicio» del lienzo).
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

type Dia = { letra: string; nombre: string; fecha: string; estado: 'hecho' | 'hoy' | 'falta' | 'paso' };
const S = cargar<{
  diasDeEstaSemana: (estudiados: string[], ahora?: Date) => Dia[];
  textoDeLaSemana: (dias: Dia[]) => { estudiados: number; falta: number; texto: string };
  resumenDeLaSemana: (dias: Dia[]) => string;
}>('tuSemana');

// Jueves 12 de noviembre de 2026, 3:00 p. m. en Colombia.
const jueves = new Date('2026-11-12T15:00:00-05:00');

describe('«Tu semana · sin rachas»', () => {
  it('va de lunes a domingo y marca lo estudiado, hoy y lo que falta; un día sin estudiar no es un fallo', () => {
    const dias = S.diasDeEstaSemana(['2026-11-09', '2026-11-11'], jueves);
    expect(dias.map((d) => d.letra).join('')).toBe('LMMJVSD');
    expect(dias.map((d) => d.estado)).toEqual(['hecho', 'paso', 'hecho', 'hoy', 'falta', 'falta', 'falta']);
  });
  it('dice cuántos días faltan para la Constancia (3 días, no seguidos)', () => {
    const dos = S.textoDeLaSemana(S.diasDeEstaSemana(['2026-11-09', '2026-11-11'], jueves));
    expect(dos).toMatchObject({ estudiados: 2, falta: 1 });
    expect(dos.texto).toBe('Con 1 día más esta semana cuenta para tu logro de Constancia.');
    const tres = S.textoDeLaSemana(S.diasDeEstaSemana(['2026-11-09', '2026-11-10', '2026-11-12'], jueves));
    expect(tres.texto).toBe('Esta semana ya cuenta para tu logro de Constancia.');
  });
  it('si ya no alcanzan los días, no culpa: la semana que viene empieza de nuevo', () => {
    const domingo = new Date('2026-11-15T10:00:00-05:00');
    expect(S.textoDeLaSemana(S.diasDeEstaSemana([], domingo)).texto).toBe('Cualquier día cuenta: la semana que viene empieza de nuevo.');
  });
  it('se lee igual sin ver los círculos', () => {
    expect(S.resumenDeLaSemana(S.diasDeEstaSemana(['2026-11-09', '2026-11-11'], jueves))).toBe('Esta semana estudiaste 2 días: lunes y miércoles.');
    expect(S.resumenDeLaSemana(S.diasDeEstaSemana([], jueves))).toBe('Esta semana todavía no has estudiado.');
    expect(leer('components', 'estudiante', 'inicio', 'TuSemana.vue')).toContain('role="img" :aria-label="lectura"');
  });
});

describe('Inicio del estudiante (v3)', () => {
  const pagina = leer('pages', 'estudiante', 'index.vue');

  it('tiene las piezas del cuadro en su orden: siguiente paso, camino y las tres tarjetas', () => {
    const orden = ['<EstudianteInicioSiguientePaso', '<EstudianteInicioCaminoModulo', '<EstudianteInicioDeTuClase', '<EstudianteInicioTeLoDejoElProfe', '<EstudianteInicioTuSemana'];
    const pos = orden.map((p) => pagina.indexOf(p));
    expect(pos.every((p) => p > 0)).toBe(true);
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
  });

  it('la página no habla con la API (PAT-01): lo hace useInicioEstudiante', () => {
    expect(pagina).not.toMatch(/useApi\(\)|api\.(get|post)/);
    const datos = leer('composables', 'useInicioEstudiante.ts');
    expect(datos).toContain("api.get<{ count: number }>('/message/unread-count')");
    expect(datos).toContain('`/analytics/student/${studentId}/logros`');
  });

  it('en el celular, «Sigue donde ibas» en vez de la línea de pasos, y un solo botón', () => {
    const camino = leer('components', 'estudiante', 'inicio', 'CaminoModulo.vue');
    expect(camino).toContain('<span v-if="!moduloId" class="sm:hidden">Sigue donde ibas</span>');
    expect(camino).toContain(":class=\"aqui ? 'hidden sm:block' : ''\"");
    const paso = leer('components', 'estudiante', 'inicio', 'SiguientePaso.vue');
    expect(paso).toContain('class="boton-heroe boton-otro hidden sm:inline-flex"');
    // El «display» va en la clase, no en el CSS: si no, gana a «hidden» (lección de la Fase C).
    expect(leer('assets', 'css', 'inicio-v3.css')).not.toMatch(/\.boton-heroe \{[^}]*display:/);
  });

  it('los estados del camino se leen con texto, no solo con el color', () => {
    const camino = leer('components', 'estudiante', 'inicio', 'CaminoModulo.vue');
    expect(camino).toContain("hecho: '(dominada)', aqui: '(estás aquí)', empezado: '(en práctica)', pendiente: '(sin empezar)'");
    expect(camino).toContain('>Estás aquí</span>');
  });

  it('el plan completo vive en «Aprender» y el camino lleva ahí', () => {
    expect(leer('pages', 'estudiante', 'aprender.vue')).toContain('<EstudiantePlanCurso v-model:modulo="modulo" :filtro="filtro" />');
    expect(leer('components', 'estudiante', 'inicio', 'CaminoModulo.vue')).toContain('to="/estudiante/aprender"');
    expect(pagina).not.toContain('Plan del curso');
  });

  it('se ve en claro, oscuro y alto contraste', () => {
    const css = leer('assets', 'css', 'inicio-v3.css');
    expect(css).toContain(':root[data-tema="oscuro"] .heroe-inicio');
    expect(css).toContain(':root[data-contraste="alto"] .heroe-inicio');
    expect(leer('nuxt.config.ts')).toContain("'~/assets/css/inicio-v3.css'");
  });
});
