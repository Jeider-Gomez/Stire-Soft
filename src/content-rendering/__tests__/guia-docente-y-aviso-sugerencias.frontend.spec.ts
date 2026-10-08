import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 08/10, Jeider: (1) guiar al docente para que arme buenos ejercicios de programar; (2) avisarle (opcional) a quien
// envió una sugerencia que se resolvió o revisó, y que pueda leer lo que escribió el equipo.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Caso = { input: string; expected: string; isPublic: boolean };
const { revisarEjercicioCodigo } = cargar<{ revisarEjercicioCodigo: (e: { enunciado: string; plantilla: string; casos: Caso[] }) => Array<{ ok: boolean; texto: string }> }>('guiaEjercicioCodigo');
const LEE = "const lineas = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\n// Escribe el resultado con console.log\n";

describe('la guía del docente para un ejercicio de programar', () => {
  it('un ejercicio vacío tiene todo por hacer', () => {
    expect(revisarEjercicioCodigo({ enunciado: '', plantilla: '', casos: [{ input: '', expected: '', isPublic: true }] }).every((p) => !p.ok)).toBe(true);
  });

  it('un ejercicio bien armado queda 6 de 6', () => {
    const r = revisarEjercicioCodigo({
      enunciado: 'Lee un nombre y saluda. **Ejemplo:** si entra `Ana`, sale `Hola, Ana.`',
      plantilla: LEE,
      casos: [{ input: 'Ana', expected: 'Hola, Ana.', isPublic: true }, { input: 'María José', expected: 'Hola, María José.', isPublic: false }],
    });
    expect(r.filter((p) => !p.ok).map((p) => p.texto)).toEqual([]);
  });

  it('detecta la plantilla que trae la respuesta, la falta de caso oculto y el espacio al final', () => {
    const r = revisarEjercicioCodigo({
      enunciado: 'Ejemplo: 2 → 4',
      plantilla: `${LEE}console.log(Number(lineas[0]) * 2);`,
      casos: [{ input: '2', expected: '4 ', isPublic: true }],
    });
    const falta = r.filter((p) => !p.ok).map((p) => p.texto);
    expect(falta).toEqual(['La plantilla deja el trabajo al estudiante', 'Al menos un caso oculto con un valor límite', 'Las salidas esperadas no terminan en espacio']);
  });

  it('se ve al crear y al editar, con el enunciado que se está escribiendo', () => {
    expect(leer('components', 'docente', 'exercise-builders', 'CodingExerciseBuilder.vue')).toContain('<GuiaEjercicioCodigo :enunciado="enunciado ?? \'\'" :plantilla="starterCode" :casos="testCases" />');
    expect(leer('pages', 'docente', 'ejercicios', 'crear.vue')).toContain(':enunciado="form.questionText"');
    expect(leer('components', 'docente', 'ejercicios', 'VentanaEditarEjercicio.vue')).toContain(':enunciado="f.description"');
    expect(leer('components', 'docente', 'exercise-builders', 'GuiaEjercicioCodigo.vue')).toContain('{{ listos }} de {{ puntos.length }} listos');
  });
});

describe('el aviso opcional de una sugerencia revisada', () => {
  it('el admin decide con una casilla (marcada al resolver, desmarcada al archivar) y se manda al servidor', () => {
    const v = leer('pages', 'admin', 'sugerencias.vue');
    expect(v).toContain('<input v-model="editando.avisar" type="checkbox"');
    expect(v).toContain("avisar: estado === 'resuelto' }");
    expect(v).toContain('await sugerencias.actualizar(r.id, { estado, nota: nota ?? undefined, avisar })');
  });

  it('la notificación abre «Lo que he enviado», con la respuesta del equipo, y se quita de la dirección', () => {
    const b = leer('components', 'layout', 'BotonSugerencias.vue');
    expect(b).toContain("if (v !== 'mias') return");
    expect(b).toContain('void verMios()');
    expect(b).toContain('{ replace: true }');
    expect(b).toContain('Respuesta: {{ r.nota }}');
  });
});
