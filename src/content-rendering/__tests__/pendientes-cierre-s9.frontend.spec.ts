import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Pendientes del cierre de la Semana 9 (17/10): la cabecera del Tutor, el borde del campo que falta (Jorge, PAT-03) y
// los textos técnicos del panel del administrador (José, UX-04).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

describe('la cabecera del Tutor dice la lección abierta, no la recomendada', () => {
  type Mod = { id: number; title: string; units: Array<{ id: number; title: string; status: string }> };
  const { etiquetaDeContexto } = cargar<{ etiquetaDeContexto: (r: string, e: { activityId?: number; title?: string; unitTitle?: string } | null, m: Mod[], s: { title?: string } | null) => string | null }>('planLateral');
  const modulos: Mod[] = [{ id: 1, title: 'M', units: [{ id: 21, title: 'Descomponer', status: 'dominado' }, { id: 22, title: 'El robot que sigue órdenes', status: 'dominado' }] }];

  it('en una lección, esa lección', () => {
    expect(etiquetaDeContexto('/estudiante/unidad/22', null, modulos, { title: 'Descomponer' })).toBe('Lección actual: El robot que sigue órdenes');
  });
  it('en un ejercicio, el ejercicio; fuera de él, un ejercicio viejo del store no se muestra', () => {
    const ej = { activityId: 5, title: 'Área', unitTitle: 'Operadores' };
    expect(etiquetaDeContexto('/estudiante/evaluacion/5', ej, modulos, null)).toBe('Operadores • Área');
    expect(etiquetaDeContexto('/estudiante/progreso', ej, modulos, { title: 'Descomponer' })).toBe('Tu siguiente lección: Descomponer');
  });
  it('el panel del Tutor la usa', () => {
    expect(leer('components', 'tutor', 'TutorChatDrawer.vue')).toContain('etiquetaDeContexto(route.path, workspaceStore.currentExercise, studentStore.modules, studentStore.activeUnit)');
  });
});

describe('PAT-03 (Jorge): el campo que falta se marca en rojo', () => {
  it('el mensaje vacío y el destinatario sin elegir', () => {
    expect(leer('components', 'mensajes', 'VentanaRedactar.vue')).toContain(":class=\"error && !contenido.trim() ? 'border-semantico-falla border-2' : 'border-base-borde-fuerte'\"");
    for (const rol of ['docente', 'estudiante']) {
      const p = leer('pages', rol, 'mensajes.vue');
      expect(p).toContain(':aria-invalid="!!errorEnvio && !destinatario"');
      expect(p).toContain(":class=\"errorEnvio && !destinatario ? 'border-semantico-falla border-2' : 'border-base-borde-fuerte'\"");
    }
  });
});

describe('UX-04 (José): el estado del sistema en español claro', () => {
  it('sin «API NestJS Core», «Adapter», «Timeout», «RSS / Heap» ni «msgs»', () => {
    const d = leer('pages', 'admin', 'dashboard.vue');
    for (const t of ['>API NestJS Core<', 'Adapter:', 'Timeout:', 'RSS:', 'KB Out', 'msgs en 24h', 'ejec. en 24h', '>Tutor socrático IA<']) expect(d).not.toContain(t);
    expect(d).toContain('Servidor de STIRE');
    expect(d).toContain('mensajes en 24 h');
  });
});
