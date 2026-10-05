import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Formas de calificar en pantalla (docs/DISENO_INTERVENCION_DOCENTE.md §6; BASE_TEORICA.md BT-14): notas a la manera
// del docente, las columnas de la tabla, el CSV para Moodle y lo que ve el estudiante. Se prueban los archivos reales
// de frontend-nuxt.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');
const pantallaNotas = () => ['pages/docente/clase/[classId]/notas.vue', 'components/docente/notas/FormularioEsquema.vue', 'components/docente/notas/TablaNotas.vue'].map((f) => leer(...f.split('/'))).join('\n');
const js = ts.transpileModule(leer('utils', 'calificaciones.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);

interface Comp { clave: string; nombre: string; tipo: string; peso: number; moduloId: number | null; lecciones: number[] | null; entregas: number[] | null }
interface Esq { componentes: Comp[]; calculo: string; grupos: Array<{ moduloId: number; calculo: string; peso: number }>; notaAprobatoria: number; visibleParaEstudiantes: boolean }
type Mod = { id: number; titulo: string; lecciones: number[] };
const { columnasDelLibro, csvParaMoodle, formasDeEmpezar, leerNota, notaComa, nombreArchivoNotas, sincronizarGrupos, sumaPesos } = mod.exports as {
  columnasDelLibro: (e: Esq, m: Mod[]) => Array<{ tipo: string; titulo: string; porcentaje: string }>;
  csvParaMoodle: (l: unknown) => string;
  leerNota: (t: string) => number | null | undefined;
  notaComa: (n: number | null | undefined) => string;
  nombreArchivoNotas: (c: string, f: Date) => string;
  sincronizarGrupos: (e: Esq, m: Mod[]) => Esq['grupos'];
  sumaPesos: (c: Array<{ peso: number }>) => number;
  formasDeEmpezar: (m: Mod[]) => Array<{ id: string; esquema: Esq }>;
};

const comp = (clave: string, nombre: string, peso: number, moduloId: number | null = null, tipo = 'manual'): Comp =>
  ({ clave, nombre, tipo, peso, moduloId, lecciones: null, entregas: null });
const modulos: Mod[] = [{ id: 1, titulo: 'Módulo 1', lecciones: [30, 31] }, { id: 2, titulo: 'Módulo 2', lecciones: [40] }, { id: 3, titulo: 'Módulo 3', lecciones: [] }];

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
      modulos,
      esquema: { calculo: 'porcentajes', grupos: [], componentes: [comp('practica', 'Práctica', 60), comp('parcial', 'Parcial "1", corte', 40)] },
      filas: [
        { email: 'luisa@x.co', nombre: 'Rojas, Luisa', componentes: { practica: { nota: 4 }, parcial: { nota: 3.8 } }, modulos: {}, propuesta: 3.9, final: 4.2 },
        { email: 'julian@x.co', nombre: 'Julián', componentes: { practica: { nota: 0 }, parcial: { nota: null } }, modulos: {}, propuesta: 0, final: 0 },
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

describe('Calificaciones: a la manera del docente (decisión del dueño, 01/10)', () => {
  it('formas de empezar: una sola nota, una nota por módulo (con sus lecciones) o práctica + entregas + parcial', () => {
    const formas = formasDeEmpezar(modulos);
    expect(formas.map((f) => f.id)).toEqual(['una', 'modulos', 'mixta']);
    expect(formas[0].esquema).toMatchObject({ calculo: 'promedio', componentes: [{ tipo: 'manual', moduloId: null }] });
    // un módulo sin lecciones publicadas no entra en «una por módulo»
    expect(formas[1].esquema.componentes.map((c) => c.moduloId)).toEqual([1, 2]);
    expect(formas[1].esquema.grupos.map((g) => g.moduloId)).toEqual([1, 2]);
    expect(sumaPesos(formas[2].esquema.componentes)).toBe(100);
    expect(formasDeEmpezar([]).map((f) => f.id)).toEqual(['una', 'mixta']);
  });

  it('cada módulo con notas tiene su nota de módulo: se crea al asignarle una nota y conserva lo que el docente decidió', () => {
    const esquema: Esq = {
      calculo: 'porcentajes', notaAprobatoria: 3, visibleParaEstudiantes: false,
      componentes: [comp('q', 'Quiz en el salón', 40, 2), comp('t', 'Taller', 60, 2), comp('p', 'Práctica', 0, 1, 'dominio'), comp('f', 'Final', 40)],
      grupos: [{ moduloId: 2, calculo: 'porcentajes', peso: 30 }],
    };
    esquema.grupos = sincronizarGrupos(esquema, modulos);
    expect(esquema.grupos).toEqual([{ moduloId: 1, calculo: 'promedio', peso: 0 }, { moduloId: 2, calculo: 'porcentajes', peso: 30 }]);
    // columnas: por módulo sus notas y luego la nota del módulo; al final las del curso; % solo donde ese nivel usa porcentajes
    expect(columnasDelLibro(esquema, modulos).map((c) => `${c.titulo}${c.porcentaje ? ` (${c.porcentaje})` : ''}`)).toEqual([
      'Práctica', 'Nota de Módulo 1 (0 %)', 'Quiz en el salón (40 %)', 'Taller (60 %)', 'Nota de Módulo 2 (30 %)', 'Final (40 %)',
    ]);
  });

  it('sin nota final, el CSV solo lleva las notas y la final puesta a mano; sin porcentajes no inventa «(0 %)»', () => {
    const csv = csvParaMoodle({ modulos, esquema: { calculo: 'ninguno', grupos: [], componentes: [comp('nota', 'Nota', 0)] }, filas: [] });
    expect(csv.slice(1).split(/\r?\n/)[0]).toBe('Correo electrónico,Nombre,Nota,Nota final');
    const promedio = csvParaMoodle({ modulos, esquema: { calculo: 'promedio', grupos: [], componentes: [comp('nota', 'Nota', 0)] }, filas: [] });
    expect(promedio.slice(1).split(/\r?\n/)[0]).toBe('Correo electrónico,Nombre,Nota,Nota propuesta,Nota final');
  });

  it('la pantalla no impone nada: formas de empezar, nota del curso o de un módulo, porcentajes / promedio / sin final, y dejar de usar notas', () => {
    // Desde el 05/10 la pantalla es la página más el formulario del esquema y la tabla (components/docente/notas/).
    const notas = pantallaNotas();
    expect(notas).toContain('Esta clase no lleva notas en STIRE');
    expect(notas).toContain('<option :value="null">Todo el curso</option>');
    expect(notas).toContain('v-model="borrador.calculo"');
    expect(notas).toContain('v-model="g.calculo"');
    // los porcentajes no bloquean: si no suman 100 se reparten en proporción
    expect(notas).toContain(':disabled="guardandoEsquema"');
    expect(notas).toContain('se reparte en proporción');
    expect(notas).toContain('Dejar de usar notas en esta clase');
    expect(leer('utils', 'calificaciones.ts')).toContain("ninguno: 'Sin nota final (solo registro las notas)'");
  });
});

describe('Calificaciones: pantallas', () => {
  it('la página organiza: no llama a la API (PAT-01; antes 584 líneas)', () => {
    const pagina = leer('pages', 'docente', 'clase', '[classId]', 'notas.vue');
    expect(pagina).not.toMatch(/api\.(get|post|patch|put|del)\(/);
    expect(pagina).toContain('provide(CLAVE_NOTAS_CLASE, estado)');
    expect(pagina.split('\n').length).toBeLessThan(130);
    expect(leer('components', 'docente', 'notas', 'TablaNotas.vue')).toContain(':aria-expanded="abierto === f.studentId"');
  });

  it('el docente ajusta (o pone) la final con motivo y ve el historial; las notas calculadas no se editan a mano', () => {
    // Desde el 05/10 la pantalla es la página más el formulario del esquema y la tabla (components/docente/notas/).
    const notas = pantallaNotas();
    expect(notas).toContain("{ clave: 'final', ...cuerpo }");
    expect(notas).toContain('Motivo (queda en el historial)');
    expect(notas).toContain(`<template v-else-if="col.componente.tipo === 'manual'">`);
    expect(notas).toContain('Descargar para Moodle (CSV)');
  });

  it('el estudiante ve sus notas solo si el docente lo hizo visible, sin el motivo del ajuste', () => {
    const mia = leer('components', 'MiNota.vue');
    expect(mia).toContain('v-if="datos?.visible"');
    expect(mia).not.toContain('motivo');
    expect(mia).toContain('v-for="m in datos.modulos"');
    expect(leer('pages', 'estudiante', 'progreso.vue')).toContain('<MiNota :class-id="studentStore.currentClassId" />');
  });
});
