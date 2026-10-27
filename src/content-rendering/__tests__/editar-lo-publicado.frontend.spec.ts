import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 27/10, pedido de Jeider: «el docente que publica algo, que lo pueda editar o actualizar». Un aviso publicado se corrige
// (y queda «editado», con opción de avisar otra vez); un ejercicio publicado se edita sabiendo qué pasa, o vuelve a borrador.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Form = { tipo: string; titulo: string; cuerpo: string; fecha: string; lugar: string };
const u = cargar<{ formularioDeAviso: (a: Record<string, unknown>) => Form; avisoParaEnviar: (f: Form) => Record<string, unknown> }>('avisosClase');

describe('corregir un aviso publicado', () => {
  it('el aviso vuelve al formulario con la fecha en la hora local, y al enviarlo queda igual que antes', () => {
    const fechaEvento = new Date(2026, 9, 30, 8, 5).toISOString();
    const f = u.formularioDeAviso({ tipo: 'citacion', titulo: 'Reunión', cuerpo: 'Traer el carné', fechaEvento, lugar: 'Aula 3' });
    expect(f).toEqual({ tipo: 'citacion', titulo: 'Reunión', cuerpo: 'Traer el carné', fecha: '2026-10-30T08:05', lugar: 'Aula 3' });
    expect(u.avisoParaEnviar(f).fechaEvento).toBe(fechaEvento);
    expect(u.formularioDeAviso({ tipo: 'aviso', titulo: 'x', cuerpo: 'y', fechaEvento: null, lugar: null })).toMatchObject({ fecha: '', lugar: '' });
  });

  it('la vista: «Corregir», la misma ventana con «Guardar el cambio», «Avisarles del cambio» y la marca «editado»', () => {
    const v = leer('components', 'mensajes', 'AvisosClase.vue');
    expect(v).toContain('@click="abrirEdicion(a)"');
    expect(v).toContain("'Guardar el cambio'");
    expect(v).toContain('Avisarles del cambio');
    expect(v).toContain('editado {{ fechaCorta(a.editadoEn) }}');
    expect(leer('composables', 'useAvisosClase.ts')).toContain('api.patch<AvisoClase & { avisados: number }>(`/avisos-clase/${id}`');
  });
});

describe('editar un ejercicio publicado', () => {
  it('se puede volver a borrador desde la lista', () => {
    expect(leer('components', 'docente', 'UnitExercisesPanel.vue')).toContain('@click="despublicar(act)"');
    expect(leer('composables', 'useEjerciciosUnidad.ts')).toContain('api.patch(`/activities/${ej.id}/unpublish`)');
  });
  it('al editarlo publicado, la ventana dice qué pasa al guardar', () => {
    expect(leer('components', 'docente', 'ejercicios', 'VentanaEditarEjercicio.vue')).toContain("v-if=\"ejercicio.status === 'published'\"");
  });
});
