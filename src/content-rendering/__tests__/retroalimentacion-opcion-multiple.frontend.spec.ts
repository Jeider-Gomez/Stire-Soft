import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// JEIDER-S08-11 (09/10): al fallar en opción múltiple, saber por qué, sin regalar la respuesta (decisión de Jeider: con un
// intento, se vuelve a intentar con un ejercicio parecido). El servidor manda `retroalimentacion` (ffbe1be).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const js = ts.transpileModule(leer('utils', 'resultadoEntrega.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { retroParaMostrar } = mod.exports as { retroParaMostrar: (r: unknown) => Array<{ tipo: string; texto: string }> };
const r = (correcta: boolean, explicacion: string | null, repasar: string | null, preguntaId = 1) => ({ preguntaId, correcta, explicacion, repasar });

describe('retroalimentación de opción múltiple en el resultado', () => {
  it('al acertar, por qué es correcta; sin texto del docente, nada', () => {
    expect(retroParaMostrar([r(true, 'La A de REDA es «Abierto».', null)])).toEqual([{ tipo: 'porque', texto: 'La A de REDA es «Abierto».' }]);
    expect(retroParaMostrar([r(true, null, null)])).toEqual([]);
    expect(retroParaMostrar(undefined)).toEqual([]);
  });

  it('al fallar, qué repasar; sin texto del docente, volver a la explicación (una sola vez), nunca la respuesta', () => {
    expect(retroParaMostrar([r(false, null, 'Repasa la sección OVA y REDA.')])).toEqual([{ tipo: 'repasar', texto: 'Repasa la sección OVA y REDA.' }]);
    const sinTexto = retroParaMostrar([r(false, null, null, 1), r(false, null, null, 2)]);
    expect(sinTexto).toHaveLength(1);
    expect(sinTexto[0].texto).toContain('no te damos la respuesta');
  });

  it('la ventana lo muestra y el docente lo escribe en el formulario de opción múltiple (también al editar)', () => {
    expect(leer('components', 'exercise', 'ResultadoEntrega.vue')).toContain("{{ x.tipo === 'porque' ? 'Por qué es correcta:' : 'Qué repasar:' }}");
    const b = leer('components', 'docente', 'exercise-builders', 'McqExerciseBuilder.vue');
    expect(b).toContain('Si falla, qué repasar (opcional)');
    expect(b).toContain("repasar: repasar.value.trim() || undefined");
    expect(b).toContain('repasar.value = asText(c.repasar)');
    // La vista previa del estudiante tampoco lo muestra antes de responder.
    expect(leer('utils', 'exercisePreview.ts')).toContain('const { correctAnswerId, explanation, repasar, ...rest } = config');
  });
});
