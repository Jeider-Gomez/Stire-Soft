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
const { csvParaMoodle, leerNota, notaComa, nombreArchivoNotas, sumaPesos } = mod.exports as {
  csvParaMoodle: (l: unknown) => string;
  leerNota: (t: string) => number | null | undefined;
  notaComa: (n: number | null | undefined) => string;
  nombreArchivoNotas: (c: string, f: Date) => string;
  sumaPesos: (c: Array<{ peso: number }>) => number;
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
      esquema: { componentes: [{ clave: 'practica', nombre: 'Práctica', peso: 60 }, { clave: 'parcial', nombre: 'Parcial "1", corte', peso: 40 }] },
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
