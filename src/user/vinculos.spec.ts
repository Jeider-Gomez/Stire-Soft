import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { UserAffiliation } from './entities/user-affiliation.entity';
import { InstitutionService } from '../institution/institution.service';
import { agregarProgramas, contextoDe, puedeVerPlantilla } from '../reuse/alcance-plantilla';

// «Dónde enseño / Qué estudio» (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md, fase 3).
const LIC = { id: 1, name: 'Licenciatura en Informática', tipo: 'carrera', maxSemesters: 10, facultad: 'Facultad de Educación y Ciencias Humanas', institutionId: 1, institution: { id: 1, name: 'Universidad de Córdoba', sigla: 'Unicórdoba' } };

function armar() {
  const filas: Array<Record<string, unknown>> = [];
  const repo = {
    find: jest.fn(async ({ where }: { where: { userId: number } }) => filas.filter((f) => f.userId === where.userId).map((f) => ({ ...f, program: LIC }))),
    findOne: jest.fn(async ({ where }: { where: Record<string, unknown> }) => filas.find((f) => Object.entries(where).every(([k, v]) => f[k] === v)) ?? null),
    create: jest.fn((x: Record<string, unknown>) => x),
    save: jest.fn(async (x: Record<string, unknown>) => {
      if (!x.id) filas.push(Object.assign(x, { id: filas.length + 1 }));
      return x;
    }),
    remove: jest.fn(async (x: Record<string, unknown>) => filas.splice(filas.indexOf(x), 1)),
  };
  const institution = { findProgramById: jest.fn(async () => LIC) };
  type Args = ConstructorParameters<typeof UserService>;
  const service = new UserService(
    {} as Args[0],
    repo as unknown as Repository<UserAffiliation>,
    {} as Args[2],
    institution as unknown as InstitutionService,
    {} as Args[4],
  );
  return { service, repo, filas };
}

describe('UserService — vínculos académicos', () => {
  it('el rol del vínculo sale de la cuenta, no del cuerpo; la respuesta trae programa e institución, sin el usuario', async () => {
    const { service } = armar();
    const v = await service.addAffiliation(7, { programId: 1, roleType: 'estudiante' as never }, 'docente');
    expect(v).toMatchObject({ roleType: 'docente', program: { name: 'Licenciatura en Informática' }, institution: { sigla: 'Unicórdoba' } });
    expect(v).not.toHaveProperty('user');
  });

  it('el mismo programa dos veces actualiza el semestre, no duplica', async () => {
    const { service, filas } = armar();
    await service.addAffiliation(7, { programId: 1, roleType: 'estudiante' as never, currentSemester: 3 }, 'estudiante');
    const v = await service.addAffiliation(7, { programId: 1, roleType: 'estudiante' as never, currentSemester: 4 }, 'estudiante');
    expect(filas).toHaveLength(1);
    expect(v.currentSemester).toBe(4);
  });

  it('un semestre que el programa no tiene es un 400', async () => {
    const { service } = armar();
    await expect(service.addAffiliation(7, { programId: 1, roleType: 'estudiante' as never, currentSemester: 12 }, 'estudiante')).rejects.toThrow(BadRequestException);
  });

  it('solo se quitan los vínculos propios', async () => {
    const { service, filas } = armar();
    await service.addAffiliation(7, { programId: 1, roleType: 'docente' as never }, 'docente');
    await expect(service.quitarVinculo(8, 1)).rejects.toThrow(NotFoundException);
    await service.quitarVinculo(7, 1);
    expect(filas).toHaveLength(0);
  });
});

describe('agregarProgramas — un docente sin clases ve lo de su programa y facultad', () => {
  it('con el vínculo a la Licenciatura ve lo compartido con el programa, la facultad y la institución; sin él, no', () => {
    const algo = { id: 9, programId: 1, institutionId: 1, periodoPlan: 3, program: { facultad: LIC.facultad } };
    const sinNada = contextoDe([]);
    expect(puedeVerPlantilla('programa', algo, sinNada)).toBe(false);
    const conVinculo = agregarProgramas(contextoDe([]), [{ id: 1, institutionId: 1, facultad: LIC.facultad }]);
    expect(['programa', 'facultad', 'institucion'].map((a) => puedeVerPlantilla(a as never, algo, conVinculo))).toEqual([true, true, true]);
    expect(puedeVerPlantilla('asignatura', algo, conVinculo)).toBe(false); // la asignatura exige dictarla
  });
});
