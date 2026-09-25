import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ActivityQuestionsService } from './activity-questions.service';
import { QuestionType } from '../common/enums/question-type.enum';
import { UserRole } from '../user/entities/user.entity';
import { PublicationStatus } from '../common/enums/status.enum';

// Regresión del punto 6 del Bloque 4: una pregunta CODING sin ningún
// testCase público deja al estudiante programando a ciegas.
//
// OLA 2 P2: create() ahora también verifica ownership (AuthorizationService)
// resolviendo Activity -> LearningUnit -> Topic -> Section -> classId, así
// que el mock de `activitiesRepository` debe devolver esa cadena completa
// para los casos que sí deben llegar a guardar.
describe('ActivityQuestionsService.create', () => {
  let service: ActivityQuestionsService;
  const teacher = { id: 9, role: UserRole.DOCENTE } as any;

  const mockRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((q) => Promise.resolve(q)),
  };
  const mockActivitiesRepository = {
    findOne: jest.fn().mockResolvedValue({
      id: 1,
      status: PublicationStatus.PUBLISHED,
      learningUnit: { topic: { section: { classId: 42 } } },
    }),
  };
  const mockAuthorizationService = {
    assertTeacherOwnsClass: jest.fn().mockResolvedValue(undefined),
    assertEnrolledInClass: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockActivitiesRepository.findOne.mockResolvedValue({
      id: 1,
      status: PublicationStatus.PUBLISHED,
      learningUnit: { topic: { section: { classId: 42 } } },
    });
    mockAuthorizationService.assertTeacherOwnsClass.mockResolvedValue(undefined);
    mockAuthorizationService.assertEnrolledInClass.mockResolvedValue(undefined);
    const mockContentRenderingService = { sanitizeRichText: jest.fn((s: string) => s) };
    service = new ActivityQuestionsService(
      mockRepo as any,
      mockActivitiesRepository as any,
      mockAuthorizationService as any,
      mockContentRenderingService as any,
    );
  });

  describe('validación de testCases públicos', () => {
    it('CODING sin ningún testCase isPublic:true → 400', async () => {
      const dto = {
        activityId: 1,
        type: QuestionType.CODING,
        question: 'Suma dos números',
        config: { language: 'javascript', testCases: [{ label: 'oculto', isPublic: false }] },
      } as any;

      await expect(service.create(dto, teacher)).rejects.toThrow(BadRequestException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('CODING con testCases vacío → 400', async () => {
      const dto = {
        activityId: 1,
        type: QuestionType.CODING,
        question: 'Suma dos números',
        config: { language: 'javascript', testCases: [] },
      } as any;

      await expect(service.create(dto, teacher)).rejects.toThrow(BadRequestException);
    });

    it('CODING con al menos un testCase isPublic:true → se crea', async () => {
      const dto = {
        activityId: 1,
        type: QuestionType.CODING,
        question: 'Suma dos números',
        config: {
          language: 'javascript',
          testCases: [
            { label: 'público', isPublic: true, expected: '3' },
            { label: 'oculto', isPublic: false, expected: '7' },
          ],
        },
      } as any;

      await expect(service.create(dto, teacher)).resolves.toBeDefined();
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('Fase 26: CODING en un lenguaje que el juez no ejecuta (python) → 400 y no se guarda', async () => {
      const dto = {
        activityId: 1,
        type: QuestionType.CODING,
        question: 'Suma',
        config: { language: 'python', testCases: [{ label: 'p', isPublic: true, expected: '3' }] },
      } as any;
      await expect(service.create(dto, teacher)).rejects.toThrow(/solo ejecuta JavaScript/);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('Fase 26: CODING sin language (usa JavaScript por defecto) o con "js" → se crea', async () => {
      const base = { activityId: 1, type: QuestionType.CODING, question: 'Suma' } as any;
      await service.create({ ...base, config: { testCases: [{ isPublic: true, expected: '3' }] } }, teacher);
      await service.create({ ...base, config: { language: 'js', testCases: [{ isPublic: true, expected: '3' }] } }, teacher);
      expect(mockRepo.save).toHaveBeenCalledTimes(2);
    });

    it('Fase 26: FILL_CODE acepta un lenguaje de resaltado válido o ninguno, y rechaza uno desconocido', async () => {
      const base = { activityId: 1, type: QuestionType.FILL_CODE, question: 'Completa' } as any;
      const cfg = { codeTemplate: 'for i in ___:', blanks: [{ id: 'b1', answer: 'range(3)' }] };
      await service.create({ ...base, config: { ...cfg, language: 'python' } }, teacher);
      await service.create({ ...base, config: cfg }, teacher);
      expect(mockRepo.save).toHaveBeenCalledTimes(2);
      await expect(service.create({ ...base, config: { ...cfg, language: 'brainfuck' } }, teacher)).rejects.toThrow(/no es válido para resaltar/);
      expect(mockRepo.save).toHaveBeenCalledTimes(2);
    });

    it('otros tipos de pregunta (MCQ) no exigen testCases', async () => {
      const dto = {
        activityId: 1,
        type: QuestionType.MCQ,
        question: '¿2+2?',
        config: { options: [{ id: 'a', text: '4' }], correctAnswerId: 'a' },
      } as any;

      await expect(service.create(dto, teacher)).resolves.toBeDefined();
    });

    it('Fase 25: HTML_CSS válida (con solución modelo que cumple todas las reglas) → se crea', async () => {
      const dto = {
        activityId: 1,
        type: QuestionType.HTML_CSS,
        question: 'Crea una página',
        points: 20,
        order: 0,
        config: {
  starterHtml: '<h1></h1>',
  starterCss: '',
  modelSolution: { html: '<h1>Hola</h1><ul><li>a</li></ul>', css: 'h1{color:red}' },
  rules: [
    { id: 'titulo', label: 'Hay un h1 con «Hola»', hint: 'Escribe Hola', isPublic: true, weight: 10, check: { kind: 'text', selector: 'h1', mode: 'contains', value: 'Hola' } },
    { id: 'lista', label: 'Hay una lista', isPublic: true, weight: 10, check: { kind: 'element_exists', selector: 'ul' } },
    { id: 'secreta', label: 'ETIQUETA-SECRETA', isPublic: false, weight: 30, check: { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red'] } },
  ],
},
      } as any;
      await service.create(dto, teacher);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });

    it('Fase 25: HTML_CSS cuya solución modelo NO cumple una regla → 400 que nombra la regla, y no se guarda', async () => {
      const config = {
  starterHtml: '<h1></h1>',
  starterCss: '',
  modelSolution: { html: '<h1>Hola</h1><ul><li>a</li></ul>', css: 'h1{color:red}' },
  rules: [
    { id: 'titulo', label: 'Hay un h1 con «Hola»', hint: 'Escribe Hola', isPublic: true, weight: 10, check: { kind: 'text', selector: 'h1', mode: 'contains', value: 'Hola' } },
    { id: 'lista', label: 'Hay una lista', isPublic: true, weight: 10, check: { kind: 'element_exists', selector: 'ul' } },
    { id: 'secreta', label: 'ETIQUETA-SECRETA', isPublic: false, weight: 30, check: { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red'] } },
  ],
};
      config.rules.push({ id: 'imposible', label: 'Hay una tabla', isPublic: true, weight: 10, check: { kind: 'element_exists', selector: 'table' } });
      const dto = { activityId: 1, type: QuestionType.HTML_CSS, question: 'x', points: 20, order: 0, config } as any;
      await expect(service.create(dto, teacher)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto, teacher)).rejects.toThrow(/"imposible"/);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('Fase 25: HTML_CSS sin ninguna regla pública → 400', async () => {
      const config = {
  starterHtml: '<h1></h1>',
  starterCss: '',
  modelSolution: { html: '<h1>Hola</h1><ul><li>a</li></ul>', css: 'h1{color:red}' },
  rules: [
    { id: 'titulo', label: 'Hay un h1 con «Hola»', hint: 'Escribe Hola', isPublic: true, weight: 10, check: { kind: 'text', selector: 'h1', mode: 'contains', value: 'Hola' } },
    { id: 'lista', label: 'Hay una lista', isPublic: true, weight: 10, check: { kind: 'element_exists', selector: 'ul' } },
    { id: 'secreta', label: 'ETIQUETA-SECRETA', isPublic: false, weight: 30, check: { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red'] } },
  ],
};
      config.rules = config.rules.map((r: any) => ({ ...r, isPublic: false }));
      const dto = { activityId: 1, type: QuestionType.HTML_CSS, question: 'x', points: 20, order: 0, config } as any;
      await expect(service.create(dto, teacher)).rejects.toThrow(/al menos una regla pública/);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('BE-01: ai_evaluated se rechaza al crearla (no hay evaluador que la califique) y no se guarda', async () => {
      const dto = { activityId: 1, type: QuestionType.AI_EVALUATED, question: 'Explica…', config: {} } as any;

      await expect(service.create(dto, teacher)).rejects.toThrow(/ai_evaluated/);
    });
  });

  // OLA 2 P2: sin esto, un docente podía inyectar preguntas (con su
  // respuesta correcta) en actividades de otro docente.
  describe('ownership — un docente no puede crear preguntas en actividades ajenas', () => {
    const dto = {
      activityId: 1,
      type: QuestionType.MCQ,
      question: '¿2+2?',
      config: { options: [{ id: 'a', text: '4' }], correctAnswerId: 'a' },
    } as any;

    it('llama a assertTeacherOwnsClass con el classId resuelto de la cadena Activity->LearningUnit->Topic->Section', async () => {
      await service.create(dto, teacher);
      expect(mockAuthorizationService.assertTeacherOwnsClass).toHaveBeenCalledWith(teacher, 42);
    });

    it('propaga el rechazo de AuthorizationService (docente ajeno) y no guarda nada', async () => {
      mockAuthorizationService.assertTeacherOwnsClass.mockRejectedValueOnce(
        new ForbiddenException('No dictas esta clase'),
      );

      await expect(service.create(dto, teacher)).rejects.toThrow('No dictas esta clase');
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('actividad sin cadena resoluble (learningUnit/topic/section rotos) → falla cerrado, no guarda', async () => {
      mockActivitiesRepository.findOne.mockResolvedValueOnce({ id: 1, learningUnit: null });

      await expect(service.create(dto, teacher)).rejects.toThrow(NotFoundException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  // OLA 3 - PUNTO 2/3 (P1-R2, docs/REAUDITORIA_OLA2.md): create() ya
  // verificaba ownership, pero la lectura (findByActivity) no — cualquier
  // cuenta con rol docente podía leer el `config` crudo (respuesta correcta)
  // de actividades de OTRO docente.
  describe('findByActivity — P1-R2 (Ola 3)', () => {
    it('docente ajeno → 403, nunca llega al repo de preguntas', async () => {
      (mockRepo as any).findByActivityId = jest.fn();
      const docenteAjeno = { id: 99, role: UserRole.DOCENTE } as any;
      mockAuthorizationService.assertTeacherOwnsClass.mockRejectedValueOnce(
        new ForbiddenException('No dictas esta clase'),
      );

      await expect(service.findByActivity(1, docenteAjeno)).rejects.toThrow(ForbiddenException);
      expect((mockRepo as any).findByActivityId).not.toHaveBeenCalled();
    });

    it('docente dueño → llega al repo y recibe las preguntas', async () => {
      (mockRepo as any).findByActivityId = jest.fn().mockResolvedValue([{ id: 1 }]);
      const docenteDueño = { id: 9, role: UserRole.DOCENTE } as any;

      await expect(service.findByActivity(1, docenteDueño)).resolves.toEqual([{ id: 1 }]);
      expect(mockAuthorizationService.assertTeacherOwnsClass).toHaveBeenCalledWith(docenteDueño, 42);
    });

    it('estudiante matriculado: valida la matrícula antes de devolver preguntas redactadas', async () => {
      (mockRepo as any).findByActivityId = jest.fn().mockResolvedValue([{ id: 1 }]);
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;

      await service.findByActivity(1, estudiante);
      expect(mockAuthorizationService.assertTeacherOwnsClass).not.toHaveBeenCalled();
      expect(mockAuthorizationService.assertEnrolledInClass).toHaveBeenCalledWith(estudiante, 42);
      expect((mockRepo as any).findByActivityId).toHaveBeenCalledWith(1);
    });

    it('estudiante no matriculado → 403 y nunca consulta las preguntas', async () => {
      (mockRepo as any).findByActivityId = jest.fn();
      const estudianteAjeno = { id: 20, role: UserRole.ESTUDIANTE } as any;
      mockAuthorizationService.assertEnrolledInClass.mockRejectedValueOnce(
        new ForbiddenException('No estás matriculado en esta clase'),
      );

      await expect(service.findByActivity(1, estudianteAjeno)).rejects.toThrow(ForbiddenException);
      expect((mockRepo as any).findByActivityId).not.toHaveBeenCalled();
    });

    it('estudiante matriculado no puede leer preguntas de una actividad no publicada', async () => {
      (mockRepo as any).findByActivityId = jest.fn();
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
      mockActivitiesRepository.findOne.mockResolvedValueOnce({
        id: 1,
        status: PublicationStatus.DRAFT,
        learningUnit: { topic: { section: { classId: 42 } } },
      });

      await expect(service.findByActivity(1, estudiante)).rejects.toThrow(NotFoundException);
      expect((mockRepo as any).findByActivityId).not.toHaveBeenCalled();
    });
  });
});
