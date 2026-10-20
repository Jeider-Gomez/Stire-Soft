import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// MOD-02 (propuesta de Pedro, 19/10): «Errores que más se repiten esta semana» en «Hoy» del docente.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');

function cargar(archivo: string, deps: Record<string, unknown> = {}): Record<string, unknown> {
  const js = ts.transpileModule(leer('utils', archivo), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (nombre: string) => deps[nombre]);
  return mod.exports;
}

type E = { tipo: string; nombre: string; detalle: string; entregas: number; estudiantes: Array<{ studentId: number; nombre: string; veces: number }>; lecciones: number[] };
const u = cargar('erroresSemana.ts', { './refuerzos': cargar('refuerzos.ts') }) as {
  cuantosConElError: (e: E) => string;
  enlaceRefuerzoDeError: (classId: number, e: E) => string;
};
const error: E = {
  tipo: 'concatena', nombre: 'Juntan números como texto', detalle: '', entregas: 1,
  estudiantes: [{ studentId: 4, nombre: 'Ana', veces: 1 }], lecciones: [9, 12],
};

describe('MOD-02: errores que más se repiten esta semana', () => {
  it('dice a cuántos estudiantes y ejercicios afecta', () => {
    expect(u.cuantosConElError(error)).toBe('1 estudiante · 1 ejercicio');
    expect(u.cuantosConElError({ ...error, entregas: 5, estudiantes: [...error.estudiantes, { studentId: 5, nombre: 'Beto', veces: 4 }] })).toBe('2 estudiantes · 5 ejercicios');
  });

  it('el refuerzo sale armado con quienes tienen el error y las lecciones donde apareció', () => {
    expect(u.enlaceRefuerzoDeError(3, error)).toBe('/docente/refuerzos/nuevo?tipo=refuerzo&clase=3&estudiantes=4&lecciones=9%2C12');
  });

  it('está en «Hoy», separa concepto de escritura y cada estudiante lleva a su ficha', () => {
    expect(leer('pages', 'docente', 'clase', '[classId]', 'index.vue')).toContain('<DocenteErroresSemana :class-id="classId" />');
    expect(leer('composables', 'useResumenClase.ts')).toContain('/analytics/class/${classId}/errores-semana');
    const c = leer('components', 'docente', 'ErroresSemana.vue');
    expect(c).toContain('De concepto: para explicar en clase');
    expect(c).toContain('De escritura: se corrigen practicando');
    expect(c).toContain('`/docente/estudiante/${est.studentId}?clase=${classId}`');
  });
});
