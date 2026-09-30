import 'reflect-metadata';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';
import { ActivityQuestionsService } from './activity-questions.service';
import { ActivityQuestionsController } from './activity-questions.controller';
import { QuestionType } from '../common/enums/question-type.enum';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { User, UserRole } from '../user/entities/user.entity';

// Paso 4b (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.5): «Duplicar como variante» dejaba una copia idéntica porque una
// pregunta no se podía editar. Ahora se edita (enunciado, puntos, datos) mientras nadie haya entregado.
type Deps = ConstructorParameters<typeof ActivityQuestionsService>;

const docente = { id: 9, role: UserRole.DOCENTE } as User;
const mcq = () => ({
  id: 5,
  activityId: 1,
  type: QuestionType.MCQ,
  question: 'Viejo',
  points: 50,
  order: 0,
  config: { options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctAnswerId: 'a' },
});

function crear(opciones: { entregas?: number; pregunta?: ReturnType<typeof mcq> | null; dueno?: boolean } = {}) {
  const questionsRepo = {
    findOne: jest.fn().mockResolvedValue(opciones.pregunta === undefined ? mcq() : opciones.pregunta),
    save: jest.fn((q: unknown) => Promise.resolve(q)),
  };
  const activitiesRepo = {
    findOne: jest.fn().mockResolvedValue({ id: 1, learningUnit: { topic: { section: { classId: 42 } } } }),
  };
  const authorization = {
    assertTeacherOwnsClass: jest.fn(() =>
      opciones.dueno === false ? Promise.reject(new ForbiddenException('No dictas esta clase')) : Promise.resolve(),
    ),
  };
  const rendering = { sanitizeRichText: jest.fn((s: string) => `limpio:${s}`) };
  const submissions = { count: jest.fn().mockResolvedValue(opciones.entregas ?? 0) };
  const service = new ActivityQuestionsService(
    questionsRepo as unknown as Deps[0],
    activitiesRepo as unknown as Deps[1],
    authorization as unknown as Deps[2],
    rendering as unknown as Deps[3],
    submissions as unknown as Deps[4],
  );
  return { service, questionsRepo, authorization, submissions };
}

describe('ActivityQuestionsService.update (paso 4b)', () => {
  it('sin entregas: guarda los datos nuevos, con el enunciado sanitizado', async () => {
    const { service, questionsRepo } = crear();
    const config = { options: [{ id: 'a', text: 'Otra A' }, { id: 'b', text: 'Otra B' }], correctAnswerId: 'b' };
    const r = await service.update(5, { question: 'Nuevo', points: 80, config }, docente);
    expect(r).toMatchObject({ question: 'limpio:Nuevo', points: 80, config, type: QuestionType.MCQ, activityId: 1 });
    expect(questionsRepo.save).toHaveBeenCalledTimes(1);
  });

  it('cuenta solo entregas enviadas o calificadas de esa actividad (un intento en curso no bloquea)', async () => {
    const { service, submissions } = crear();
    await service.update(5, { points: 60 }, docente);
    expect(submissions.count).toHaveBeenCalledWith({
      where: { activityId: 1, status: In([SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED]) },
    });
  });

  it('con entregas: 409 que explica el camino (duplicar como variante) y no guarda nada', async () => {
    const { service, questionsRepo } = crear({ entregas: 3 });
    const error = await service.update(5, { points: 60 }, docente).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).message).toMatch(/3 entregas.*variante/);
    expect(questionsRepo.save).not.toHaveBeenCalled();
  });

  it('un docente que no dicta la clase recibe 403 y no se revisa nada más', async () => {
    const { service, questionsRepo, submissions } = crear({ dueno: false });
    await expect(service.update(5, { points: 60 }, docente)).rejects.toThrow(ForbiddenException);
    expect(submissions.count).not.toHaveBeenCalled();
    expect(questionsRepo.save).not.toHaveBeenCalled();
  });

  it('una pregunta que no existe: 404', async () => {
    const { service } = crear({ pregunta: null });
    await expect(service.update(99, { points: 60 }, docente)).rejects.toThrow(NotFoundException);
  });

  it('los datos nuevos pasan por la misma validación que al crear (coding sin caso público: 400)', async () => {
    const coding = { ...mcq(), type: QuestionType.CODING, config: { language: 'javascript', testCases: [{ isPublic: true }] } };
    const { service, questionsRepo } = crear({ pregunta: coding });
    await expect(
      service.update(5, { config: { language: 'javascript', testCases: [{ isPublic: false }] } }, docente),
    ).rejects.toThrow(BadRequestException);
    expect(questionsRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza un enunciado vacío y puntos que no sean mayores que 0', async () => {
    const { service } = crear();
    await expect(service.update(5, { question: '   ' }, docente)).rejects.toThrow(BadRequestException);
    await expect(service.update(5, { points: 0 }, docente)).rejects.toThrow(BadRequestException);
  });
});

describe('ActivityQuestionsService.getEditability (paso 4b)', () => {
  it('editable mientras no haya entregas', async () => {
    const { service } = crear();
    await expect(service.getEditability(1, docente)).resolves.toEqual({ activityId: 1, editable: true, submissions: 0 });
  });

  it('no editable con entregas, y dice cuántas', async () => {
    const { service } = crear({ entregas: 2 });
    await expect(service.getEditability(1, docente)).resolves.toEqual({ activityId: 1, editable: false, submissions: 2 });
  });

  it('solo el docente de la clase', async () => {
    const { service } = crear({ dueno: false });
    await expect(service.getEditability(1, docente)).rejects.toThrow(ForbiddenException);
  });
});

describe('ActivityQuestionsController: rutas del paso 4b solo para docente y admin', () => {
  it.each(['update', 'getEditability'] as const)('%s', (metodo) => {
    const roles: unknown = Reflect.getMetadata('roles', ActivityQuestionsController.prototype[metodo]);
    expect(roles).toEqual(['docente', 'admin']);
  });
});
