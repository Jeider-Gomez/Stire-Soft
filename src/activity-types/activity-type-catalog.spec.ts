import { QueryRunner } from 'typeorm';
import { SeedActivityTypeCatalog1789800000000 } from '../migrations/1789800000000-SeedActivityTypeCatalog';
import { ACTIVITY_TYPE_CATALOG } from './activity-type-catalog';

function fakeRunner() {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const runner = { query: jest.fn(async (sql: string, params?: unknown[]) => void calls.push({ sql, params })) };
  return { runner: runner as unknown as QueryRunner, calls };
}

describe('SeedActivityTypeCatalog1789800000000', () => {
  it('crea los 3 tipos del catálogo sin duplicar los que ya existan (INSERT IGNORE sobre el código único)', async () => {
    const { runner, calls } = fakeRunner();
    await new SeedActivityTypeCatalog1789800000000().up(runner);

    expect(calls).toHaveLength(3);
    for (const call of calls) expect(call.sql).toMatch(/^INSERT IGNORE INTO `activity_types`/);
    expect(calls.map((c) => c.params)).toEqual([
      ['Práctica Formativa', 'AUTO-EVAL', 1, 1.0],
      ['Taller de Código', 'TALLER', 1, 1.5],
      ['Parcial / Evaluación', 'PARCIAL', 1, 3.0],
    ]);
  });

  it('al revertir solo borra los tipos que ninguna actividad usa', async () => {
    const { runner, calls } = fakeRunner();
    await new SeedActivityTypeCatalog1789800000000().down(runner);

    expect(calls).toHaveLength(1);
    expect(calls[0].sql).toContain('NOT IN (SELECT `activityTypeId` FROM `activities`');
    expect(calls[0].params).toEqual(ACTIVITY_TYPE_CATALOG.map((t) => t.code));
  });
});
