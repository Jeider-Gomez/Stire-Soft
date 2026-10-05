import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// UI-05 · Replanificar sin abrumar (docs/DISENO_REPLANIFICAR.md): la ayuda escala con los fallos seguidos y cambia de
// táctica; una acción principal y las demás plegadas.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Ayuda = { mensaje: string; principal: string; otras: string[] };
const { ayudaSegunFallos, TEXTO_AYUDA } = cargar<{ ayudaSegunFallos: (n: number) => Ayuda; TEXTO_AYUDA: Record<string, string> }>('ofertaTutor');

describe('la ayuda escala y cambia de táctica', () => {
  it('1 fallo: una pista; 2: por pasos; 3 o más: un ejemplo resuelto parecido', () => {
    expect(ayudaSegunFallos(1).principal).toBe('pista');
    expect(ayudaSegunFallos(2).principal).toBe('por-pasos');
    expect(ayudaSegunFallos(3).principal).toBe('ejemplo');
    expect(ayudaSegunFallos(7).principal).toBe('ejemplo');
  });

  it('nunca repite la principal entre las otras, y nunca muestra más de 3 otras', () => {
    for (const n of [0, 1, 2, 3, 5]) {
      const a = ayudaSegunFallos(n);
      expect(a.otras).not.toContain(a.principal);
      expect(a.otras.length).toBeLessThanOrEqual(3);
    }
  });

  it('desde el tercer fallo dice que se prueba de otra forma (no repite la misma explicación)', () => {
    expect(ayudaSegunFallos(3).mensaje).toMatch(/Probemos de otra forma/);
    expect(ayudaSegunFallos(3).otras).toContain('explicacion');
  });

  it('cada ayuda tiene su texto', () => {
    for (const k of ['pista', 'por-pasos', 'ejemplo', 'explicacion']) expect(TEXTO_AYUDA[k]).toBeTruthy();
  });
});

describe('en el ejercicio', () => {
  const p = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');

  it('una acción principal, «Ahora no», y las demás plegadas en «Otras formas de destrabarte»', () => {
    expect(p).toContain('@click="usarAyuda(ayuda.principal)"');
    expect(p).toContain('<summary class="min-h-[44px] inline-flex items-center cursor-pointer font-semibold text-stire-purple hover:underline">Otras formas de destrabarte</summary>');
    expect(p).toContain('Ahora no');
  });

  it('no atenúa la pantalla ni abre una ventana encima: es una tarjeta que se puede cerrar', () => {
    const tarjeta = p.slice(p.indexOf('id="oferta-tutor"'), p.indexOf('</details>', p.indexOf('id="oferta-tutor"')));
    expect(tarjeta).not.toMatch(/role="dialog"|fixed inset-0/);
  });

  it('el store cuenta los fallos seguidos (Probar y Entregar) y los reinicia al acertar o al cambiar de ejercicio', () => {
    const ws = leer('stores', 'workspace.ts');
    expect(ws).toContain('fallosSeguidos.value = res.allPassed ? 0 : fallosSeguidos.value + 1');
    expect(ws).toContain('fallosSeguidos.value = aprobo ? 0 : fallosSeguidos.value + 1');
    expect(ws).toMatch(/calibracion\.value = null\s+fallosSeguidos\.value = 0/);
  });

  it('el ejemplo parecido va al Tutor con su modo; volver a la explicación lleva a la lección', () => {
    expect(leer('stores', 'tutor.ts')).toContain("modoEjemplo.value ? 'ejemplo-parecido' as const");
    expect(p).toContain('navigateTo(`/estudiante/unidad/${workspaceStore.currentExercise.learningUnitId}#explicacion`)');
  });
});
