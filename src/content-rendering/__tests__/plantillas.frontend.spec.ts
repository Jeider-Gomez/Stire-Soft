import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Plantillas compartidas en pantalla (docs/DISENO_CLASES_Y_DOCENTES.md; BASE_TEORICA.md BT-18).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
const js = ts.transpileModule(leer('utils', 'plantillas.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { textoPlantilla } = mod.exports as { textoPlantilla: (p: unknown) => string };

describe('Plantillas compartidas', () => {
  it('cada plantilla dice de quién es y cuánto contenido trae', () => {
    expect(textoPlantilla({ classId: 3, nombre: 'Fundamentos de Algoritmia', codigo: 'ALGO-203413', docente: 'Laura Martínez', modulos: 3, lecciones: 1, ejercicios: 40 }))
      .toBe('Fundamentos de Algoritmia (ALGO-203413) · Laura Martínez · 3 módulos, 1 lección');
  });

  it('el docente comparte desde Ajustes, y se copia al crear una clase o con «Traer de otra clase»', () => {
    expect(leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue')).toContain('body: { compartidaComoPlantilla: !classInfo.value.compartidaComoPlantilla }');
    expect(leer('pages', 'docente', 'index.vue')).toContain('<optgroup v-if="plantillas.length" label="Plantillas de otros docentes">');
    const contenidos = leer('pages', 'docente', 'contenidos.vue');
    expect(contenidos).toContain('<optgroup v-if="plantillas.length" label="Plantillas de otros docentes">');
    // los módulos de una plantilla ajena se leen por reuse (no por /sections, que es solo del dueño)
    expect(contenidos).toContain('`/reuse/classes/${importModal.sourceClassId}/modulos`');
    expect(contenidos).toContain('v-if="selectedClassId && (otherClasses.length > 0 || plantillas.length > 0)"');
  });
});
