import { SectionService } from './section.service';

// Contenido del curso (27/10): el árbol del docente marca cada lección como lista, a la que le falta algo u oculta. Para
// eso la consulta de la estructura trae cuántas explicaciones tiene cada lección y cuántas ve el estudiante, sin su texto.
describe('SectionService.findByClass · conteo de explicaciones por lección', () => {
  it('cuenta todas las explicaciones y las visibles, sin traer el texto', async () => {
    const llamadas: Array<[string, unknown[]]> = [];
    const qb: Record<string, jest.Mock> = {};
    for (const m of ['leftJoinAndSelect', 'loadRelationCountAndMap', 'where', 'orderBy', 'addOrderBy']) {
      qb[m] = jest.fn((...args: unknown[]) => { llamadas.push([m, args]); return qb; });
    }
    qb.getMany = jest.fn(async () => []);
    const repo = { createQueryBuilder: jest.fn(() => qb) };
    const servicio = new SectionService(repo as never, {} as never, {} as never);
    await servicio.findByClass(7);
    const conteos = llamadas.filter(([m]) => m === 'loadRelationCountAndMap').map(([, a]) => a[0]);
    expect(conteos).toEqual(['learningUnit.explicaciones', 'learningUnit.explicacionesVisibles']);
    // las explicaciones no se traen completas: ningún join a learningUnit.contents
    expect(llamadas.some(([m, a]) => m === 'leftJoinAndSelect' && a[0] === 'learningUnit.contents')).toBe(false);
  });
});
