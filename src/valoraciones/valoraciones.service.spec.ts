import { ForbiddenException } from '@nestjs/common';
import { ValoracionesService } from './valoraciones.service';
import { MINIMO_VOTOS_REVISAR, resumenPorLeccion } from './valoraciones-reglas';
import { User, UserRole } from '../user/entities/user.entity';

// UI-04 de la lista de chequeo de Sistemas Tutores: «¿Te sirvió esta explicación?» y el resumen para el docente.
describe('resumenPorLeccion', () => {
  const t = (d: number) => new Date(2026, 9, d);
  const lecciones = [{ id: 1, title: 'Variables' }, { id: 2, title: 'Ciclos' }, { id: 3, title: 'Sin votos' }];

  it('cuenta Sí y No, calcula el porcentaje y deja fuera las lecciones sin votos', () => {
    const r = resumenPorLeccion(lecciones, [
      { learningUnitId: 1, util: true, comentario: null, updatedAt: t(1) },
      { learningUnitId: 1, util: false, comentario: null, updatedAt: t(1) },
    ]);
    expect(r).toEqual([{ learningUnitId: 1, titulo: 'Variables', si: 1, no: 1, porcentajeUtil: 50, comentarios: [], revisar: false }]);
  });

  it(`marca «revisar» solo con ${MINIMO_VOTOS_REVISAR} votos o más y más «No» que «Sí», y la pone primero`, () => {
    const no = (d: number, c: string | null) => ({ learningUnitId: 2, util: false, comentario: c, updatedAt: t(d) });
    const r = resumenPorLeccion(lecciones, [
      { learningUnitId: 1, util: true, comentario: null, updatedAt: t(1) },
      no(1, 'No entendí el contador'),
      no(3, '  ¿por qué < y no <=?  '),
      no(2, ''),
    ]);
    expect(r[0]).toMatchObject({ learningUnitId: 2, revisar: true, si: 0, no: 3, porcentajeUtil: 0 });
    // los comentarios van sin espacios sobrantes, del más reciente al más viejo, y los vacíos no cuentan
    expect(r[0].comentarios).toEqual(['¿por qué < y no <=?', 'No entendí el contador']);
    expect(resumenPorLeccion(lecciones, [no(1, 'x'), no(2, 'y')])[0].revisar).toBe(false);
  });
});

describe('ValoracionesService', () => {
  const estudiante = { id: 5, role: UserRole.ESTUDIANTE } as User;
  const docente = { id: 9, role: UserRole.DOCENTE } as User;
  const crear = () => {
    const guardados: Array<Record<string, unknown>> = [];
    const repo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => { guardados.push(x); return x; }),
    };
    const lecciones = { findOne: jest.fn().mockResolvedValue({ id: 7, classId: 1 }), findByClass: jest.fn() };
    const autorizacion = { assertTeacherOwnsClass: jest.fn() };
    type Deps = ConstructorParameters<typeof ValoracionesService>;
    const service = new ValoracionesService(repo as unknown as Deps[0], lecciones as unknown as Deps[1], autorizacion as unknown as Deps[2]);
    return { service, repo, lecciones, guardados };
  };

  it('el estudiante solo valora una lección a la que tiene acceso (lo comprueba LearningUnitService.findOne)', async () => {
    const { service, lecciones } = crear();
    await service.valorar(estudiante, 7, { util: true });
    expect(lecciones.findOne).toHaveBeenCalledWith(7, estudiante);
  });

  it('un docente no vota', async () => {
    const { service } = crear();
    await expect(service.valorar(docente, 7, { util: true })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('el comentario solo se guarda con «No», recortado; con «Sí» se descarta', async () => {
    const { service, guardados } = crear();
    await service.valorar(estudiante, 7, { util: false, comentario: '  no entendí el ejemplo  ' });
    await service.valorar(estudiante, 7, { util: true, comentario: 'esto no debería guardarse' });
    expect(guardados[0]).toMatchObject({ studentId: 5, learningUnitId: 7, util: false, comentario: 'no entendí el ejemplo' });
    expect(guardados[1]).toMatchObject({ util: true, comentario: null });
  });

  it('votar otra vez cambia el voto existente (uno por estudiante y lección)', async () => {
    const { service, repo, guardados } = crear();
    const existente = { id: 1, studentId: 5, learningUnitId: 7, util: true, comentario: null };
    repo.findOne.mockResolvedValue(existente);
    await service.valorar(estudiante, 7, { util: false });
    expect(guardados[0]).toBe(existente);
    expect(existente.util).toBe(false);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
