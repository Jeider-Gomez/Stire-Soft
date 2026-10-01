import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Formas de calificar en pantalla (docs/DISENO_INTERVENCION_DOCENTE.md §6; BASE_TEORICA.md BT-14): el CSV para Moodle,
// la lectura de notas con coma y lo que ve el estudiante. Se prueban los archivos reales de frontend-nuxt.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
const js = ts.transpileModule(leer('utils', 'calificaciones.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { csvParaMoodle, formasDeEmpezar, leerNota, notaComa, nombreArchivoNotas, sumaPesos } = mod.exports as {
  csvParaMoodle: (l: unknown) => string;
  leerNota: (t: string) => number | null | undefined;
  notaComa: (n: number | null | undefined) => string;
  nombreArchivoNotas: (c: string, f: Date) => string;
  sumaPesos: (c: Array<{ peso: number }>) => number;
  formasDeEmpezar: (m: Array<{ id: number; titulo: string; lecciones: number[] }>) => Array<{ id: string; esquema: { usarPesos: boolean; componentes: Array<{ tipo: string; peso: number; lecciones: number[] | null }> } }>;
};

describe('Calificaciones: utilidades', () => {
  it('lee notas con coma o punto; vacío es «sin nota»; fuera de 0–5 no es nota', () => {
    expect(leerNota('4,5')).toBe(4.5);
    expect(leerNota(' 3.25 ')).toBe(3.3);
    expect(leerNota('')).toBeNull();
    expect(leerNota('5,5')).toBeUndefined();
    expect(leerNota('x')).toBeUndefined();
    expect(notaComa(4)).toBe('4,0');
    expect(notaComa(null)).toBe('');
    expect(sumaPesos([{ peso: 40 }, { peso: 30 }, { peso: 30 }])).toBe(100);
  });

  it('el CSV para Moodle identifica por correo, usa punto decimal, escapa comas y comillas, y deja vacío lo que no tiene nota', () => {
    const csv = csvParaMoodle({
      esquema: { usarPesos: true, componentes: [{ clave: 'practica', nombre: 'Práctica', peso: 60 }, { clave: 'parcial', nombre: 'Parcial "1", corte', peso: 40 }] },
      filas: [
        { email: 'luisa@x.co', nombre: 'Rojas, Luisa', componentes: { practica: { nota: 4 }, parcial: { nota: 3.8 } }, propuesta: 3.9, final: 4.2 },
        { email: 'julian@x.co', nombre: 'Julián', componentes: { practica: { nota: 0 }, parcial: { nota: null } }, propuesta: 0, final: 0 },
      ],
    });
    expect(csv.startsWith('﻿')).toBe(true);
    const lineas = csv.slice(1).split('\r\n');
    expect(lineas[0]).toBe('Correo electrónico,Nombre,Práctica (60 %),"Parcial ""1"", corte (40 %)",Nota propuesta,Nota final');
    expect(lineas[1]).toBe('luisa@x.co,"Rojas, Luisa",4.0,3.8,3.9,4.2');
    expect(lineas[2]).toBe('julian@x.co,Julián,0.0,,0.0,0.0');
    expect(nombreArchivoNotas('Fundamentos de Algoritmia — grupo 2', new Date(2026, 8, 30))).toBe('notas-fundamentos-de-algoritmia-grupo-2-2026-09-30.csv');
  });
});

describe('Calificaciones: flexibles y opcionales (decisión del dueño, 01/10)', () => {
  it('formas de empezar: una sola nota sin porcentajes, una por módulo con sus lecciones, o práctica + entregas + parcial', () => {
    const formas = formasDeEmpezar([{ id: 1, titulo: 'Módulo 1', lecciones: [30, 31] }, { id: 2, titulo: 'Módulo 2', lecciones: [40] }]);
    expect(formas.map((f) => f.id)).toEqual(['una', 'modulos', 'mixta']);
    expect(formas[0].esquema).toMatchObject({ usarPesos: false, componentes: [{ tipo: 'manual' }] });
    expect(formas[1].esquema.usarPesos).toBe(false);
    expect(formas[1].esquema.componentes.map((c) => c.lecciones)).toEqual([[30, 31], [40]]);
    expect(sumaPesos(formas[2].esquema.componentes)).toBe(100);
    // sin módulos publicados no se ofrece «una por módulo»
    expect(formasDeEmpezar([]).map((f) => f.id)).toEqual(['una', 'mixta']);
  });

  it('sin porcentajes el CSV no inventa «(0 %)»', () => {
    const csv = csvParaMoodle({ esquema: { usarPesos: false, componentes: [{ clave: 'nota', nombre: 'Nota', peso: 0 }] }, filas: [] });
    expect(csv.slice(1).split(/\r?\n/)[0]).toBe('Correo electrónico,Nombre,Nota,Nota propuesta,Nota final');
  });

  it('la pantalla no impone nada: sin notas ofrece formas de empezar, permite quitar los porcentajes y dejar de usar notas', () => {
    const notas = leer('pages', 'docente', 'clase', '[classId]', 'notas.vue');
    expect(notas).toContain('Esta clase no lleva notas en STIRE');
    expect(notas).toContain('v-model="borrador.usarPesos"');
    expect(notas).toContain(':disabled="guardandoEsquema || (borrador.usarPesos && suma !== 100)"');
    expect(notas).toContain('Dejar de usar notas en esta clase');
    expect(notas).toContain('@change="alternarModulo(c, m.lecciones)"');
  });
});

describe('Calificaciones: pantallas', () => {
  it('el docente ajusta la final con motivo y ve el historial; las notas calculadas no se editan a mano', () => {
    const notas = leer('pages', 'docente', 'clase', '[classId]', 'notas.vue');
    expect(notas).toContain("{ clave: 'final', ...cuerpo }");
    expect(notas).toContain('Motivo (queda en el historial)');
    expect(notas).toContain("<template v-if=\"c.tipo === 'manual'\">");
    expect(notas).toContain('Descargar para Moodle (CSV)');
  });

  it('el estudiante ve su nota solo si el docente la hizo visible, sin el motivo del ajuste', () => {
    const mia = leer('components', 'MiNota.vue');
    expect(mia).toContain('v-if="datos?.visible"');
    expect(mia).not.toContain('motivo');
    expect(leer('pages', 'estudiante', 'progreso.vue')).toContain('<MiNota :class-id="studentStore.currentClassId" />');
  });
});
