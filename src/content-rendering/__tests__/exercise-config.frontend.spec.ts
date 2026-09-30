import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// frontend-nuxt/utils/exerciseConfig.ts, la lectura defensiva que usan los 7 editores de ejercicios en `load(config)`.
// Jest no compila frontend-nuxt/, así que se transpila aquí igual que en plural.frontend.spec.ts.
interface Util {
  asRecord: (v: unknown) => Record<string, unknown>;
  asRecordList: (v: unknown) => Array<Record<string, unknown>>;
  asText: (v: unknown, fallback?: string) => string;
  asNumber: (v: unknown) => number | undefined;
  trailingNumber: (id: string) => number;
  stableJson: (v: unknown) => string;
}

function cargar(): Util {
  const file = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', 'exerciseConfig.ts');
  const js = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as unknown as Util;
}

const { asRecord, asRecordList, asText, asNumber, trailingNumber, stableJson } = cargar();

describe('exerciseConfig: un config raro no rompe el editor', () => {
  it('asRecord solo acepta objetos; null, listas y textos dan {}', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asRecord([1])).toEqual({});
    expect(asRecord('x')).toEqual({});
  });

  it('asRecordList devuelve una lista de objetos, y {} donde no lo hay', () => {
    expect(asRecordList([{ a: 1 }, 5, null])).toEqual([{ a: 1 }, {}, {}]);
    expect(asRecordList(undefined)).toEqual([]);
  });

  it('asText y asNumber no inventan valores', () => {
    expect(asText('hola')).toBe('hola');
    expect(asText(3)).toBe('');
    expect(asText(undefined, 'Caso')).toBe('Caso');
    expect(asNumber(7)).toBe(7);
    expect(asNumber('7')).toBeUndefined();
    expect(asNumber(NaN)).toBeUndefined();
  });

  it('trailingNumber saca el número final de un id para que los contadores sigan después', () => {
    expect(trailingNumber('opt3')).toBe(3);
    expect(trailingNumber('target12')).toBe(12);
    expect(trailingNumber('sin-numero')).toBe(0);
  });

  it('stableJson: los mismos datos dan el mismo texto sin importar el orden de las claves, y un dato distinto da otro', () => {
    const a = { options: [{ id: 'a', text: 'A' }], correctAnswerId: 'a', explanation: undefined };
    const b = { correctAnswerId: 'a', options: [{ text: 'A', id: 'a' }] };
    expect(stableJson(a)).toBe(stableJson(b));
    expect(stableJson({ ...b, correctAnswerId: 'b' })).not.toBe(stableJson(b));
    // el orden de una lista sí importa: es la respuesta en «ordenar pasos»
    expect(stableJson({ pasos: ['x', 'y'] })).not.toBe(stableJson({ pasos: ['y', 'x'] }));
  });
});
