import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 09/10, Jeider como estudiante (UX-03): «no se ve cuáles ya hice y no me suben el dominio» y «al entrar a un ejercicio
// ya hecho no me avisa». La lista existía (08/10) detrás de un enlace pequeño solo en la lección, y el aviso solo salía en
// el mismo ejercicio aprobado, no en sus «parecidos» (mismo tipo y nivel), que tampoco suben el dominio.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const js = ts.transpileModule(leer('utils', 'resultadoEntrega.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { avisoPorEstado } = mod.exports as { avisoPorEstado: (e: string | undefined) => string | null };

describe('qué ejercicios suben el dominio, a la vista', () => {
  it('el aviso sale según la lista de la lección: hecho, parecido de uno hecho o sin intentos; nada si todavía suma', () => {
    expect(avisoPorEstado('hecho')).toBe('completado');
    expect(avisoPorEstado('cuenta-otro')).toBe('parecido');
    expect(avisoPorEstado('sin-intentos')).toBe('sin-intentos');
    for (const e of ['por-hacer', 'en-curso', undefined]) expect(avisoPorEstado(e)).toBeNull();
  });

  it('el aviso del parecido dice que no sube el dominio y lleva a la lista de los que sí suman', () => {
    const v = leer('components', 'exercise', 'SinIntentos.vue');
    expect(v).toContain('<strong>Este ejercicio ya no sube tu dominio.</strong>');
    expect(v).toContain("avisoPorEstado((await misEjercicios(props.learningUnitId)).find((e) => e.id === props.activityId)?.estado)");
    expect(v).toContain(':to="`/estudiante/unidad/${learningUnitId}?ejercicios=1`"');
  });

  it('en la lección es un botón que dice para qué sirve, y ?ejercicios=1 la abre con la lista a la vista', () => {
    const p = leer('pages', 'estudiante', 'unidad', '[id].vue');
    expect(p).toContain("'Ver todos: cuáles suben tu dominio'");
    expect(p).toContain(':aria-expanded="chooseManually"');
    expect(p).toContain("const chooseManually = ref(route.query.ejercicios === '1')");
    expect(p).toContain("document.getElementById('practicar-titulo')?.scrollIntoView");
  });
});
