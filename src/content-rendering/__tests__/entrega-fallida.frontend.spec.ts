import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// P60 (docs/PENDIENTES.md): una entrega que falla se dice en pantalla con qué hacer, y un intento cerrado en otra
// pestaña no deja la entrega ni el autoguardado atascados con 400.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

const ee = (() => {
  const js = ts.transpileModule(leer('utils', 'errorEntrega.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as {
    intentoYaCerrado: (status: number | undefined, mensaje: string) => boolean;
    mensajeErrorEntrega: (o: { status?: number; mensaje: string }) => string;
    ENTREGA_TARDA: string;
  };
})();

describe('P60: una entrega que falla se ve en pantalla', () => {
  it('reconoce los dos rechazos del servidor por intento cerrado, y nada más', () => {
    expect(ee.intentoYaCerrado(400, 'El intento ya fue procesado o ha expirado')).toBe(true);
    expect(ee.intentoYaCerrado(400, 'Intento inválido para autosave')).toBe(true);
    expect(ee.intentoYaCerrado(400, 'Ya usaste los intentos de este ejercicio.')).toBe(false);
    expect(ee.intentoYaCerrado(500, 'El intento ya fue procesado o ha expirado')).toBe(false);
    expect(ee.intentoYaCerrado(undefined, 'Network Error')).toBe(false);
  });

  it('con el intento cerrado, dice que el código sigue y que «Entregar» abre uno nuevo', () => {
    const m = ee.mensajeErrorEntrega({ status: 400, mensaje: 'El intento ya fue procesado o ha expirado' });
    expect(m).toMatch(/otra pestaña/);
    expect(m).toMatch(/Tu código sigue aquí/);
    expect(m).toMatch(/«Entregar» otra vez/);
  });

  it('sin conexión o con un fallo del servidor, dice que el código no se perdió; sin códigos de error', () => {
    const sinRed = ee.mensajeErrorEntrega({ mensaje: 'Network Error' });
    const servidor = ee.mensajeErrorEntrega({ status: 502, mensaje: 'Bad Gateway' });
    expect(sinRed).toMatch(/No hay conexión/);
    expect(servidor).toMatch(/no se perdió/);
    for (const m of [sinRed, servidor]) expect(m).not.toMatch(/\d{3}|offline|backend/i);
  });

  it('el aviso de intentos usados del servidor se muestra tal cual', () => {
    const servidor = 'Ya usaste los intentos de este ejercicio. Se reabre uno el lunes 3:00 p. m.; mientras, prueba con uno parecido.';
    expect(ee.mensajeErrorEntrega({ status: 400, mensaje: servidor })).toBe(servidor);
  });

  it('el store guarda el error, olvida el intento cerrado y reabre el autoguardado una sola vez', () => {
    const store = leer('stores', 'workspace.ts');
    expect(store).toMatch(/errorEntrega\.value = mensajeErrorEntrega\(/);
    expect(store).toMatch(/if \(intentoYaCerrado\(status, msg\)\) currentSubmissionId\.value = null/);
    expect(store).toMatch(/!reabierto && intentoYaCerrado\(/);
    expect(store).toMatch(/return saveNow\(generacion, intento, true\)/);
    expect(store).toMatch(/errorEntrega\.value = ENTREGA_TARDA/);
  });

  it('el aviso aparece en el espacio de trabajo como alerta y se puede cerrar', () => {
    const layout = leer('layouts', 'workspace.vue');
    expect(layout).toMatch(/v-if="workspaceStore\.errorEntrega"\s+role="alert"/);
    expect(layout).toMatch(/@click="workspaceStore\.errorEntrega = null"/);
  });
});
