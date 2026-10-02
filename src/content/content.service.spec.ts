import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ContentType } from '../common/enums/content-type.enum';
import { ContentService } from './content.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';

// OLA 3 - PUNTO 3 (P0-R2, docs/REAUDITORIA_OLA2.md): las rutas de lectura
// de `content` no verificaban NADA. Mismo patrón de prueba que
// activities.service.spec.ts — AuthorizationService REAL con repos falsos,
// para probar la cadena de propiedad completa, no solo que "se llamó a algo".
describe('ContentService — P0-R2 (Ola 3)', () => {
  let service: ContentService;
  let authService: AuthorizationService;

  const mockContentRepo = {
    findByUnit: jest.fn().mockResolvedValue([{ id: 1, isVisible: true }]),
    findByUnitAll: jest.fn().mockResolvedValue([{ id: 1, isVisible: true }, { id: 2, isVisible: false }]),
    findOne: jest.fn(),
    save: jest.fn((c) => Promise.resolve(c)),
    remove: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    create: jest.fn((dto) => dto),
  };
  const mockClassRepo = { findOne: jest.fn() };
  const mockEnrollmentRepo = { findOne: jest.fn() };
  const mockLearningUnitRepo = { findOne: jest.fn() };
  const mockContentRenderingService = { sanitizeRichText: jest.fn((s: string) => s) };

  const learningUnitId = 8;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthorizationService(mockClassRepo as any, mockEnrollmentRepo as any);
    service = new ContentService(
      mockContentRepo as any,
      mockLearningUnitRepo as any,
      authService,
      mockContentRenderingService as any,
    );
    mockLearningUnitRepo.findOne.mockResolvedValue({ id: learningUnitId, topic: { section: { classId: 5 } } });
    mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10 });
  });

  // Paso 6, multimedia: el metadata de un recurso se reconstruye en el servidor, no se guarda tal como llega.
  describe('create / update con recursos multimedia', () => {
    const docenteDueño = { id: 10, role: UserRole.DOCENTE } as never;

    it('un recurso de Genially se guarda con la dirección armada por el servidor', async () => {
      const r = await service.create(
        { learningUnitId, title: 'Presentación', type: ContentType.EMBED, metadata: { url: 'https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0', embedUrl: 'javascript:alert(1)' } },
        docenteDueño,
      );
      expect(r.metadata).toEqual({ url: 'https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0', provider: 'genially', embedUrl: 'https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0' });
    });

    it('un recurso inválido es un 400 con el motivo y no se guarda', async () => {
      await expect(
        service.create({ learningUnitId, title: 'x', type: ContentType.EMBED, metadata: { url: 'http://youtu.be/abc' } }, docenteDueño),
      ).rejects.toThrow(BadRequestException);
      expect(mockContentRepo.save).not.toHaveBeenCalled();
    });

    it('al editar el enlace de una imagen se valida otra vez (sin descripción: 400)', async () => {
      mockContentRepo.findOne.mockResolvedValue({ id: 3, learningUnitId, type: ContentType.IMAGE, metadata: { url: 'https://x.org/a.png', alt: 'A' } });
      await expect(service.update(3, { metadata: { url: 'https://x.org/b.png' } }, docenteDueño)).rejects.toThrow(BadRequestException);
    });

    it('en el texto de una lección, cómo se inserta cada recurso lo arma el servidor; lo que mande el navegador se descarta', async () => {
      const body = 'Mira el video:\n\n@[Variables](https://youtu.be/dQw4w9WgXcQ)';
      const r = await service.create(
        { learningUnitId, title: 'Lección', type: ContentType.MARKDOWN, body, metadata: { insertados: { 'https://youtu.be/dQw4w9WgXcQ': { embedUrl: 'javascript:alert(1)' } } } },
        docenteDueño,
      );
      expect(r.metadata).toEqual({ insertados: { 'https://youtu.be/dQw4w9WgXcQ': { url: 'https://youtu.be/dQw4w9WgXcQ', provider: 'youtube', embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' } } });
    });

    it('al editar el texto se recalcula: sin recursos, no queda nada; un enlace inválido es un 400 con la línea', async () => {
      mockContentRepo.findOne.mockResolvedValue({ id: 4, learningUnitId, type: ContentType.MARKDOWN, body: 'x', metadata: { insertados: { a: {} } } });
      const r = await service.update(4, { body: 'Solo texto' }, docenteDueño);
      expect(r.metadata).toBeUndefined();
      mockContentRepo.findOne.mockResolvedValue({ id: 4, learningUnitId, type: ContentType.MARKDOWN, body: 'x', metadata: null });
      await expect(service.update(4, { body: 'Hola\n@[v](http://a.co)' }, docenteDueño)).rejects.toThrow('Línea 2');
    });

    it('los recursos se leen del texto ya saneado: un «&» guardado como «&amp;» sigue encontrando su recurso', async () => {
      mockContentRenderingService.sanitizeRichText.mockImplementationOnce((s: string) => s.replace(/&/g, '&amp;'));
      const r = await service.create(
        { learningUnitId, title: 'L', type: ContentType.MARKDOWN, body: '@[V](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10)' },
        docenteDueño,
      );
      expect(r.body).toBe('@[V](https://www.youtube.com/watch?v=dQw4w9WgXcQ&amp;t=10)');
      expect(Object.keys(r.metadata?.insertados ?? {})).toEqual(['https://www.youtube.com/watch?v=dQw4w9WgXcQ&amp;t=10']);
    });

    it('vista previa de un recurso para el editor: mismas reglas, sin guardar', () => {
      expect(service.vistaPreviaDeRecurso('https://youtu.be/dQw4w9WgXcQ').embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
      expect(() => service.vistaPreviaDeRecurso('ftp://x')).toThrow(BadRequestException);
    });
  });

  describe('findByUnit', () => {
    it('docente ajeno (id=99) → 403, nunca llega al repo', async () => {
      const docenteAjeno = { id: 99, role: UserRole.DOCENTE } as any;
      await expect(service.findByUnit(learningUnitId, docenteAjeno)).rejects.toThrow(ForbiddenException);
      expect(mockContentRepo.findByUnit).not.toHaveBeenCalled();
    });

    it('docente dueño (id=10) → ve el contenido visible', async () => {
      const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;
      await expect(service.findByUnit(learningUnitId, docenteDueño)).resolves.toBeDefined();
      expect(mockContentRepo.findByUnit).toHaveBeenCalledWith(learningUnitId);
    });

    it('estudiante NO matriculado → 403', async () => {
      mockEnrollmentRepo.findOne.mockResolvedValue(null);
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
      await expect(service.findByUnit(learningUnitId, estudiante)).rejects.toThrow(ForbiddenException);
      expect(mockContentRepo.findByUnit).not.toHaveBeenCalled();
    });

    it('estudiante matriculado → ve el contenido visible', async () => {
      mockEnrollmentRepo.findOne.mockResolvedValue({ classId: 5, studentId: 20, status: EnrollmentStatus.ACTIVE });
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
      await expect(service.findByUnit(learningUnitId, estudiante)).resolves.toBeDefined();
    });

    it('admin: sin verificación de propiedad', async () => {
      const admin = { id: 1, role: UserRole.ADMIN } as any;
      await service.findByUnit(learningUnitId, admin);
      expect(mockClassRepo.findOne).not.toHaveBeenCalled();
      expect(mockContentRepo.findByUnit).toHaveBeenCalledWith(learningUnitId);
    });
  });

  describe('findByUnitAll', () => {
    it('docente ajeno → 403, nunca llega al repo', async () => {
      const docenteAjeno = { id: 99, role: UserRole.DOCENTE } as any;
      await expect(service.findByUnitAll(learningUnitId, docenteAjeno)).rejects.toThrow(ForbiddenException);
      expect(mockContentRepo.findByUnitAll).not.toHaveBeenCalled();
    });

    it('docente dueño → ve TODO el contenido, incluido lo oculto', async () => {
      const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;
      const result = await service.findByUnitAll(learningUnitId, docenteDueño);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    const visibleContent = { id: 1, learningUnitId, isVisible: true, body: 'texto' };
    const hiddenContent = { id: 2, learningUnitId, isVisible: false, body: 'oculto' };

    it('docente ajeno → 403', async () => {
      mockContentRepo.findOne.mockResolvedValue(visibleContent);
      const docenteAjeno = { id: 99, role: UserRole.DOCENTE } as any;
      await expect(service.findOne(1, docenteAjeno)).rejects.toThrow(ForbiddenException);
    });

    it('estudiante matriculado, bloque OCULTO → 404 (no "prohibido", no existe todavía)', async () => {
      mockContentRepo.findOne.mockResolvedValue(hiddenContent);
      mockEnrollmentRepo.findOne.mockResolvedValue({ classId: 5, studentId: 20, status: EnrollmentStatus.ACTIVE });
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
      await expect(service.findOne(2, estudiante)).rejects.toThrow(NotFoundException);
    });

    it('estudiante matriculado, bloque visible → lo ve', async () => {
      mockContentRepo.findOne.mockResolvedValue(visibleContent);
      mockEnrollmentRepo.findOne.mockResolvedValue({ classId: 5, studentId: 20, status: EnrollmentStatus.ACTIVE });
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
      await expect(service.findOne(1, estudiante)).resolves.toBe(visibleContent);
    });

    it('estudiante NO matriculado → 403, incluso si el bloque es visible', async () => {
      mockContentRepo.findOne.mockResolvedValue(visibleContent);
      mockEnrollmentRepo.findOne.mockResolvedValue(null);
      const estudiante = { id: 20, role: UserRole.ESTUDIANTE } as any;
      await expect(service.findOne(1, estudiante)).rejects.toThrow(ForbiddenException);
    });

    it('admin ve cualquier bloque, incluido uno oculto', async () => {
      mockContentRepo.findOne.mockResolvedValue(hiddenContent);
      const admin = { id: 1, role: UserRole.ADMIN } as any;
      await expect(service.findOne(2, admin)).resolves.toBe(hiddenContent);
    });
  });
});

// OLA 3 - PUNTO 5 (P1-R4, docs/REAUDITORIA_OLA2.md): `renderMarkdownToHtml`
// existía pero ningún endpoint la invocaba — la "capa 2" del saneamiento
// era código muerto, así que [texto](javascript:alert(1)) nunca se
// neutralizaba en la práctica. Esta suite usa el `ContentRenderingService`
// REAL (DOMPurify + JSDOM reales, sin mocks) a través de
// `ContentService.findOne`, exactamente como lo llamaría el controller con
// `?format=html`, para probar que la capa 2 ahora es alcanzable de verdad.
describe('ContentService.findOne — ?format=html es real (Ola 3, Punto 5)', () => {
  let service: ContentService;
  let authService: AuthorizationService;

  const mockContentRepo = { findOne: jest.fn() };
  const mockClassRepo = { findOne: jest.fn().mockResolvedValue({ id: 5, teacherId: 10 }) };
  const mockEnrollmentRepo = { findOne: jest.fn() };
  const mockLearningUnitRepo = {
    findOne: jest.fn().mockResolvedValue({ id: 8, topic: { section: { classId: 5 } } }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockClassRepo.findOne.mockResolvedValue({ id: 5, teacherId: 10 });
    mockLearningUnitRepo.findOne.mockResolvedValue({ id: 8, topic: { section: { classId: 5 } } });
    authService = new AuthorizationService(mockClassRepo as any, mockEnrollmentRepo as any);

    // ContentRenderingService REAL — no mockeado. Es exactamente lo que
    // rompía el build en el Punto 1 de esta misma ola.
    const realRenderingService = new ContentRenderingService();

    service = new ContentService(
      mockContentRepo as any,
      mockLearningUnitRepo as any,
      authService,
      realRenderingService,
    );
  });

  const docenteDueño = { id: 10, role: UserRole.DOCENTE } as any;
  const bodyWithJsLink = '[texto](javascript:alert(1))';

  it('sin format (o format=markdown): el Markdown fuente sale intacto — sigue siendo el mismo comportamiento de antes', async () => {
    mockContentRepo.findOne.mockResolvedValue({
      id: 1, learningUnitId: 8, isVisible: true, body: bodyWithJsLink,
    });

    const result = await service.findOne(1, docenteDueño);
    expect(result.body).toBe(bodyWithJsLink);
  });

  it('format=html: convierte a HTML y neutraliza javascript: — la capa 2 ahora se ejecuta de verdad', async () => {
    mockContentRepo.findOne.mockResolvedValue({
      id: 1, learningUnitId: 8, isVisible: true, body: bodyWithJsLink,
    });

    const result = await service.findOne(1, docenteDueño, 'html');
    expect(result.body).not.toContain('javascript:');
    expect(result.body).toContain('<a>texto</a>');
  });

  it('format=html: preserva Markdown legítimo convertido a HTML seguro (tabla + bloque de código)', async () => {
    const legitMarkdown = '# Título\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```js\nconsole.log(1);\n```';
    mockContentRepo.findOne.mockResolvedValue({
      id: 1, learningUnitId: 8, isVisible: true, body: legitMarkdown,
    });

    const result = await service.findOne(1, docenteDueño, 'html');
    expect(result.body).toContain('<h1>Título</h1>');
    expect(result.body).toContain('<table>');
    expect(result.body).toContain('<code class="language-js">');
  });
});
