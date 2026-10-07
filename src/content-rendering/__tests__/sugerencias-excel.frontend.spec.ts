import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as zlib from 'zlib';

// 07/10, Jeider: la bandeja de sugerencias con las nuevas arriba, lo resuelto aparte con cómo se resolvió, lo descartado
// archivado, y «un excelente Excel» en vez del CSV. utils/excel.ts arma un .xlsx de verdad sin dependencias.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const cache: Record<string, { exports: Record<string, unknown> }> = {};
function cargar<T>(nombre: string): T {
  if (!cache[nombre]) {
    const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const mod = { exports: {} as Record<string, unknown> };
    cache[nombre] = mod;
    new Function('module', 'exports', 'require', js)(mod, mod.exports, (r: string) => cargar(r.replace(/^\.\//, '')));
  }
  return cache[nombre].exports as T;
}

type Sug = {
  id: number; autor: string; rol: string; tipo: 'problema' | 'confuso' | 'idea'; gravedad: number | null; texto: string; ruta: string
  dispositivo: string; clase: string; estado: 'nuevo' | 'visto' | 'resuelto' | 'descartado'; nota: string | null; createdAt: string; updatedAt?: string; tieneCaptura?: boolean
};
type Hoja = { nombre: string; filas: Array<Array<{ v: unknown; estilo?: string }>>; conEncabezado?: boolean };
const X = cargar<{ crearLibroExcel: (h: Hoja[]) => Uint8Array; crc32: (d: Uint8Array) => number; letraColumna: (i: number) => string; fechaExcel: (d: Date) => number }>('excel');
const S = cargar<{
  filtrar: (l: Sug[], f: { bandeja: string; tipo: string; buscar: string; orden: string }) => Sug[];
  contarPorBandeja: (l: Sug[]) => Record<string, number>;
  faltaEnRevision: (e: string, n: string) => string | null;
  libroDeSugerencias: (l: Sug[], ahora?: Date) => Hoja[];
}>('sugerencias');

const base = { autor: 'Luisa', rol: 'estudiante', tipo: 'problema' as const, ruta: '/estudiante', dispositivo: '375×800', clase: 'Algoritmia G1', nota: null };
const lista: Sug[] = [
  { ...base, id: 1, gravedad: 3, texto: 'No carga el ejercicio', estado: 'nuevo', createdAt: '2026-10-05T10:00:00Z' },
  { ...base, id: 2, gravedad: 1, texto: 'Un detalle del botón «Enviar» & <otro>', estado: 'visto', createdAt: '2026-10-07T10:00:00Z' },
  { ...base, id: 3, gravedad: null, tipo: 'idea', texto: 'Modo oscuro', estado: 'resuelto', nota: 'Ya está en Apariencia', createdAt: '2026-10-06T10:00:00Z', updatedAt: '2026-10-07T12:00:00Z' },
  { ...base, id: 4, gravedad: 1, texto: 'prueba', estado: 'descartado', nota: 'Era una prueba', createdAt: '2026-10-07T11:00:00Z' },
];

/** Los archivos de un ZIP sin compresión, leyendo sus cabeceras locales (y comprobando su CRC con el de Node). */
function abrirZip(z: Uint8Array): Record<string, string> {
  const dv = new DataView(z.buffer, z.byteOffset, z.byteLength);
  const out: Record<string, string> = {};
  let i = 0;
  while (dv.getUint32(i, true) === 0x04034b50) {
    expect(dv.getUint16(i + 8, true)).toBe(0);
    const crc = dv.getUint32(i + 14, true);
    const tam = dv.getUint32(i + 18, true);
    const largoNombre = dv.getUint16(i + 26, true);
    const nombre = Buffer.from(z.subarray(i + 30, i + 30 + largoNombre)).toString('utf8');
    const datos = z.subarray(i + 30 + largoNombre, i + 30 + largoNombre + tam);
    expect(crc).toBe(zlib.crc32(datos));
    out[nombre] = Buffer.from(datos).toString('utf8');
    i += 30 + largoNombre + tam;
  }
  expect(dv.getUint32(z.length - 22, true)).toBe(0x06054b50);
  return out;
}

describe('bandeja de sugerencias (utils/sugerencias.ts)', () => {
  it('por atender = nuevas y vistas; lo más nuevo arriba; «más graves primero» si se pide', () => {
    expect(S.contarPorBandeja(lista)).toEqual({ pendientes: 2, resueltas: 1, archivadas: 1 });
    const f = { bandeja: 'pendientes', tipo: 'todos', buscar: '', orden: 'recientes' };
    expect(S.filtrar(lista, f).map((s) => s.id)).toEqual([2, 1]);
    expect(S.filtrar(lista, { ...f, orden: 'graves' }).map((s) => s.id)).toEqual([1, 2]);
  });

  it('busca sin tildes en el texto, la persona, la clase y la respuesta', () => {
    expect(S.filtrar(lista, { bandeja: 'resueltas', tipo: 'todos', buscar: 'apariencia', orden: 'recientes' }).map((s) => s.id)).toEqual([3]);
    expect(S.filtrar(lista, { bandeja: 'pendientes', tipo: 'idea', buscar: '', orden: 'recientes' })).toEqual([]);
  });

  it('resolver exige escribir cómo; archivar, no', () => {
    expect(S.faltaEnRevision('resuelto', ' ')).toMatch(/cómo se resolvió/);
    expect(S.faltaEnRevision('descartado', '')).toBeNull();
  });

  it('la página ya no ordena por gravedad ni descarga CSV', () => {
    const p = leer('pages', 'admin', 'sugerencias.vue');
    expect(p).not.toContain('text/csv');
    expect(p).toContain('Descargar Excel');
    expect(p).toContain('MOTIVOS_ARCHIVAR');
  });
});

describe('el Excel (utils/excel.ts)', () => {
  const libro = X.crearLibroExcel(S.libroDeSugerencias(lista, new Date('2026-10-07T15:00:00')));
  const partes = abrirZip(libro);

  it('es un .xlsx válido: las partes de Office Open XML con su CRC correcto', () => {
    expect(Object.keys(partes)).toEqual(expect.arrayContaining(['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/styles.xml', 'xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml']));
    expect(partes['xl/workbook.xml']).toContain('<sheet name="Sugerencias"');
    expect(partes['xl/workbook.xml']).toContain('<sheet name="Resumen"');
  });

  it('encabezado fijo y con filtros, fechas de verdad, el texto escapado y el estado con su color', () => {
    const hoja = partes['xl/worksheets/sheet1.xml'];
    expect(hoja).toContain('state="frozen"');
    expect(hoja).toMatch(/<autoFilter ref="A1:N5"\/>/);
    expect(hoja).toContain('Un detalle del botón «Enviar» &amp; &lt;otro&gt;');
    // La fila 2 es la más nueva (id 4, archivada: estilo 10); la fecha es un número con formato de fecha (estilo 3).
    expect(hoja).toMatch(/<c r="A2" s="4"><v>4<\/v><\/c><c r="B2" s="3"><v>[\d.]+<\/v><\/c><c r="C2" s="10" t="inlineStr">/);
    expect(partes['xl/styles.xml']).toContain('formatCode="dd/mm/yyyy hh:mm"');
  });

  it('el resumen cuenta por estado y señala lo que bloquea', () => {
    const r = partes['xl/worksheets/sheet2.xml'];
    expect(r).toContain('Sugerencias de STIRE');
    expect(r).toContain('Bloquea y sigue pendiente');
  });

  it('columnas y fechas como las cuenta Excel', () => {
    expect([0, 25, 26, 27, 701].map(X.letraColumna)).toEqual(['A', 'Z', 'AA', 'AB', 'ZZ']);
    expect(X.fechaExcel(new Date(2026, 9, 7, 12, 0, 0))).toBe(46302.5);
    expect(X.crc32(new TextEncoder().encode('STIRE'))).toBe(zlib.crc32('STIRE'));
  });

  // Para abrirlo a mano (o con openpyxl): STIRE_EXCEL_DE_PRUEBA=ruta.xlsx npx jest sugerencias-excel
  if (process.env.STIRE_EXCEL_DE_PRUEBA) writeFileSync(process.env.STIRE_EXCEL_DE_PRUEBA, libro);
});
