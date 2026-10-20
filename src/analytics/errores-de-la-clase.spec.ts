import 'reflect-metadata';
import { erroresDeLaClase, ERROR_PARA_DOCENTE, type FalloDeLaClase } from './errores-de-la-clase';
import { GRUPO_ERROR, type TipoError } from './perfil-aprendizaje';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

// MOD-02 (propuesta de Pedro, 19/10): «Errores que más se repiten esta semana» en «Hoy» del docente.
describe('erroresDeLaClase', () => {
  const nombres = new Map([[1, 'Ana'], [2, 'Beto'], [3, 'Caro']]);
  const f = (tipo: TipoError, studentId: number, entregaId: string, unitId = 10): FalloDeLaClase => ({ tipo, studentId, entregaId, unitId });

  it('separa los errores de concepto de los de escritura y dice quién tiene cada uno', () => {
    const r = erroresDeLaClase([
      f('concatena', 1, 'a'), f('concatena', 1, 'a'), f('concatena', 2, 'b', 11), f('concatena', 1, 'c'),
      f('sintaxis', 3, 'd'), f('sintaxis', 3, 'e'),
    ], nombres);
    expect(r.concepto).toEqual([expect.objectContaining({
      tipo: 'concatena', nombre: 'Juntan números como texto', entregas: 3,
      estudiantes: [{ studentId: 1, nombre: 'Ana', veces: 2 }, { studentId: 2, nombre: 'Beto', veces: 1 }],
      lecciones: [10, 11],
    })]);
    expect(r.escritura).toEqual([expect.objectContaining({ tipo: 'sintaxis', entregas: 2, estudiantes: [{ studentId: 3, nombre: 'Caro', veces: 2 }] })]);
  });

  it('lo visto en una sola entrega todavía no se repite; los errores sin clasificar no se muestran', () => {
    const r = erroresDeLaClase([f('por-uno', 1, 'a'), f('por-uno', 1, 'a'), f('linea', 1, 'b'), f('linea', 2, 'c'), f('error', 3, 'd'), f('error', 3, 'e')], nombres);
    expect(r).toEqual({ concepto: [], escritura: [] });
  });

  it('primero el error que tienen más estudiantes', () => {
    const r = erroresDeLaClase([f('nan', 1, 'a'), f('nan', 1, 'b'), f('nan', 1, 'c'), f('vacia', 1, 'd'), f('vacia', 2, 'e')], nombres);
    expect(r.concepto.map((e) => e.tipo)).toEqual(['vacia', 'nan']);
  });

  it('todo error de concepto o de escritura tiene su texto para el docente', () => {
    const tipos = Object.keys(GRUPO_ERROR) as TipoError[];
    for (const t of tipos.filter((x) => GRUPO_ERROR[x] !== 'otro')) expect(ERROR_PARA_DOCENTE[t]).toBeDefined();
  });
});

describe('AnalyticsService.getErroresDeLaSemana', () => {
  const ahora = new Date('2026-10-19T15:00:00Z');
  const config = { testCases: [{ label: 'Ejemplo 1', input: '5\n3', expected: '8' }] };
  const fila = (studentId: number, submissionId: string, createdAt: Date) =>
    ({ stdout: '53', stderr: null, status: 'wrong_answer', testCaseLabel: 'Ejemplo 1', submissionId, studentId, unitId: 4, createdAt, config });
  const query = jest.fn(async (sql: string) => {
    if (sql.includes('FROM execution_results')) {
      return [
        fila(1, 'a', new Date('2026-10-19T14:00:00Z')),
        fila(2, 'b', new Date('2026-10-14T14:00:00Z')),
        fila(2, 'viejo', new Date('2026-10-11T14:00:00Z')), // hace 8 días: es de la semana pasada
      ];
    }
    return [];
  });
  const repo = {
    findOne: ({ where }: { where: { id: number } }) => Promise.resolve(where.id === 7 ? { id: 7, teacherId: 10 } : null),
    find: () => Promise.resolve([{ studentId: 1, student: { fullName: 'Ana' } }, { studentId: 2, student: { fullName: 'Beto' } }]),
    createQueryBuilder: () => {
      const qb = { innerJoin: () => qb, where: () => qb, andWhere: () => qb, select: () => qb, addSelect: () => qb, orderBy: () => qb, addOrderBy: () => qb, getRawMany: () => Promise.resolve([{ id: 4 }]), getMany: () => Promise.resolve([{ id: 4 }]) };
      return qb;
    },
  };
  type Deps = ConstructorParameters<typeof AnalyticsService>;
  const service = new AnalyticsService({ query, getRepository: () => repo } as unknown as Deps[0], {} as unknown as Deps[1]);

  it('el docente de la clase ve los errores de los últimos 7 días con sus estudiantes', async () => {
    jest.spyOn(service as unknown as { idsUnidadesDeClase: () => Promise<number[]> }, 'idsUnidadesDeClase').mockResolvedValue([4]);
    const r = await service.getErroresDeLaSemana(7, { id: 10, role: 'docente' }, ahora);
    expect(r.concepto).toEqual([expect.objectContaining({ tipo: 'concatena', entregas: 2, lecciones: [4] })]);
    expect(r.concepto[0].estudiantes.map((e) => e.nombre)).toEqual(['Ana', 'Beto']);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('IN (?)'), [[1, 2], [4], expect.any(Date)]);
  });

  it('otro docente o un estudiante no lo ven', async () => {
    await expect(service.getErroresDeLaSemana(7, { id: 11, role: 'docente' })).rejects.toThrow('No tienes acceso');
    await expect(service.getErroresDeLaSemana(7, { id: 3, role: 'estudiante' })).rejects.toThrow('Los estudiantes no tienen permiso');
    await expect(service.getErroresDeLaSemana(99, { id: 10, role: 'admin' })).rejects.toThrow('La clase no existe');
  });

  it('la ruta exige rol de docente o admin', () => {
    expect(Reflect.getMetadata('roles', AnalyticsController.prototype.getErroresDeLaSemana)).toEqual(['docente', 'admin']);
  });
});
