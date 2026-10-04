import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IsNull, Repository } from 'typeorm';
import { InstitutionService } from './institution.service';
import { Institution } from './entities/institution.entity';
import { Program } from './entities/program.entity';
import { Asignatura } from './entities/asignatura.entity';
import { CrearAsignaturaDto, CrearProgramaDto } from './dto/catalogo.dto';

// Catálogo académico (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): una asignatura puede ser de un programa, de una
// institución sin programa (electiva libre) o libre; el docente la agrega sin pedir permiso y sin crear duplicados.
const LIC = { id: 7, name: 'Licenciatura en Informática', institutionId: 1, maxSemesters: 10, tipo: 'carrera' } as Program;

function armar() {
  const institutionRepo = { findOne: jest.fn(), find: jest.fn(), save: jest.fn((x) => x), create: jest.fn((x) => x) };
  const programRepo = { findOne: jest.fn(), save: jest.fn((x) => x), create: jest.fn((x) => x) };
  const guardadas: Asignatura[] = [];
  const asignaturaRepo = {
    findOne: jest.fn(async ({ where }: { where: { id?: number } }) => guardadas.find((a) => a.id === where.id) ?? null),
    save: jest.fn(async (a: Asignatura) => {
      const nueva = { ...a, id: guardadas.length + 100 };
      guardadas.push(nueva);
      return nueva;
    }),
    create: jest.fn((x: Partial<Asignatura>) => x),
  };
  const service = new InstitutionService(
    institutionRepo as unknown as Repository<Institution>,
    programRepo as unknown as Repository<Program>,
    asignaturaRepo as unknown as Repository<Asignatura>,
  );
  return { service, institutionRepo, programRepo, asignaturaRepo };
}

describe('InstitutionService.crearAsignatura — las tres formas de una asignatura', () => {
  it('de un programa: toma la institución del programa y guarda el semestre', async () => {
    const { service, programRepo } = armar();
    programRepo.findOne.mockResolvedValue(LIC);
    const a = await service.crearAsignatura({ nombre: '  Fundamentos   de Algoritmia ', programId: 7, periodoPlan: 3, codigo: '203413' }, 42);
    expect(a).toMatchObject({ nombre: 'Fundamentos de Algoritmia', programId: 7, institutionId: 1, periodoPlan: 3, codigo: '203413', creadaPorId: 42 });
  });

  it('electiva libre: de una institución, sin programa ni semestre', async () => {
    const { service, institutionRepo } = armar();
    institutionRepo.findOne.mockResolvedValue({ id: 1, name: 'Universidad de Córdoba' });
    const a = await service.crearAsignatura({ nombre: 'Inteligencia artificial en la educación', institutionId: 1, periodoPlan: 7 }, 42);
    expect(a).toMatchObject({ programId: null, institutionId: 1, periodoPlan: null });
  });

  it('curso libre: sin institución ni programa', async () => {
    const { service } = armar();
    const a = await service.crearAsignatura({ nombre: 'Taller de robótica' }, 42);
    expect(a).toMatchObject({ programId: null, institutionId: null, periodoPlan: null });
  });

  it('si ya existe en el mismo lugar devuelve la existente, no un duplicado', async () => {
    const { service, programRepo, asignaturaRepo } = armar();
    programRepo.findOne.mockResolvedValue(LIC);
    const existente = { id: 5, nombre: 'Fundamentos de Algoritmia', programId: 7, institutionId: 1 };
    asignaturaRepo.findOne.mockResolvedValueOnce(existente);
    await expect(service.crearAsignatura({ nombre: 'Fundamentos de Algoritmia', programId: 7 }, 42)).resolves.toBe(existente);
    expect(asignaturaRepo.findOne).toHaveBeenCalledWith({ where: { nombre: 'Fundamentos de Algoritmia', programId: 7, institutionId: 1 } });
    expect(asignaturaRepo.save).not.toHaveBeenCalled();
  });

  it('un curso libre se compara con los otros cursos libres (programa e institución vacíos)', async () => {
    const { service, asignaturaRepo } = armar();
    await service.crearAsignatura({ nombre: 'Taller de robótica' }, 42);
    expect(asignaturaRepo.findOne).toHaveBeenCalledWith({ where: { nombre: 'Taller de robótica', programId: IsNull(), institutionId: IsNull() } });
  });

  it('un semestre que el programa no tiene es un 400 que lo explica', async () => {
    const { service, programRepo } = armar();
    programRepo.findOne.mockResolvedValue(LIC);
    await expect(service.crearAsignatura({ nombre: 'Trabajo de grado', programId: 7, periodoPlan: 11 }, 42)).rejects.toThrow('tiene 10 semestres');
  });

  it('un programa de otra institución, o uno que no existe, es un 400', async () => {
    const { service, programRepo } = armar();
    programRepo.findOne.mockResolvedValue(LIC);
    await expect(service.crearAsignatura({ nombre: 'X y Z', programId: 7, institutionId: 2 }, 42)).rejects.toThrow(BadRequestException);
    programRepo.findOne.mockResolvedValue(null);
    await expect(service.crearAsignatura({ nombre: 'X y Z', programId: 99 }, 42)).rejects.toThrow('Ese programa no existe');
  });
});

describe('InstitutionService — instituciones y programas sin duplicados', () => {
  it('crear una institución que ya existe devuelve la existente', async () => {
    const { service, institutionRepo } = armar();
    const unicor = { id: 1, name: 'Universidad de Córdoba' };
    institutionRepo.findOne.mockResolvedValue(unicor);
    await expect(service.createInstitution({ name: 'Universidad  de Córdoba', tipo: 'universidad' })).resolves.toBe(unicor);
    expect(institutionRepo.save).not.toHaveBeenCalled();
  });

  it('un colegio con grados: el programa guarda tipo «grado» y su facultad vacía', async () => {
    const { service, institutionRepo, programRepo } = armar();
    institutionRepo.findOne.mockResolvedValue({ id: 3, name: 'I. E. San José' });
    programRepo.findOne.mockResolvedValue(null);
    const p = await service.createProgram({ name: 'Básica secundaria', institutionId: 3, tipo: 'grado', maxSemesters: 11, facultad: '  ' });
    expect(p).toMatchObject({ tipo: 'grado', maxSemesters: 11, facultad: null });
  });
});

describe('InstitutionService.buscarAsignaturas — primero las del programa del docente', () => {
  it('ordena: su programa, otros programas, electivas, cursos libres', async () => {
    const { service, asignaturaRepo } = armar();
    const filas = [
      { nombre: 'Taller libre', programId: null, institutionId: null, periodoPlan: null },
      { nombre: 'Electiva de IA', programId: null, institutionId: 1, periodoPlan: null },
      { nombre: 'Algoritmia de otro programa', programId: 9, institutionId: 1, periodoPlan: 2 },
      { nombre: 'Fundamentos de Algoritmia', programId: 7, institutionId: 1, periodoPlan: 3 },
    ];
    const qb = { leftJoinAndSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue(filas) };
    Object.assign(asignaturaRepo, { createQueryBuilder: jest.fn(() => qb) });
    const r = await service.buscarAsignaturas({ q: 'a', programId: 7 });
    expect(r.map((a) => a.nombre)).toEqual(['Fundamentos de Algoritmia', 'Algoritmia de otro programa', 'Electiva de IA', 'Taller libre']);
  });

  it('sin texto ni programa no devuelve nada (no se lista el catálogo entero)', async () => {
    const { service } = armar();
    await expect(service.buscarAsignaturas({})).resolves.toEqual([]);
  });
});

describe('DTO del catálogo', () => {
  it('rechaza un tipo de programa que no es carrera ni grado y más de 20 periodos', async () => {
    const errores = await validate(plainToInstance(CrearProgramaDto, { name: 'Algo raro', institutionId: 1, tipo: 'diplomado', maxSemesters: 30 }));
    expect(errores.map((e) => e.property).sort()).toEqual(['maxSemesters', 'tipo']);
  });
  it('una asignatura necesita un nombre de 3 letras o más; lo demás es opcional', async () => {
    expect(await validate(plainToInstance(CrearAsignaturaDto, { nombre: 'IA' }))).toHaveLength(1);
    expect(await validate(plainToInstance(CrearAsignaturaDto, { nombre: 'Ética docente' }))).toHaveLength(0);
  });
});
