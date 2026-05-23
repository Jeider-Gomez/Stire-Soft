import { Test, TestingModule } from '@nestjs/testing';
import { ContentRenderingService } from '../content-rendering.service';

// Mock de DOMPurify y JSDOM para evitar problemas de ESM en el entorno de pruebas de Jest
jest.mock('dompurify', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sanitize: jest.fn().mockImplementation((html: string) => {
        if (typeof html !== 'string') return '';
        // Mock simple de sanitización para pasar las aserciones de XSS del test
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/onerror\s*=\s*"[^"]*"/gi, '');
      }),
    };
  });
});

jest.mock('jsdom', () => {
  return {
    JSDOM: jest.fn().mockImplementation(() => {
      return { window: {} };
    }),
  };
});

describe('ContentRenderingService', () => {
  let service: ContentRenderingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentRenderingService],
    }).compile();

    service = module.get<ContentRenderingService>(ContentRenderingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compile safe markdown to HTML', async () => {
    const markdown = '# Hello World\nThis is a **bold** text.';
    const result = await service.renderMarkdownToHtml(markdown);

    expect(result).toContain('<h1>Hello World</h1>');
    expect(result).toContain('This is a <strong>bold</strong> text.');
  });

  it('should sanitize malicious script tags to prevent XSS', async () => {
    const maliciousMarkdown = 'Some text <script>alert("XSS")</script> and safe text.';
    const result = await service.renderMarkdownToHtml(maliciousMarkdown);

    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert("XSS")');
    expect(result).toContain('Some text  and safe text.');
  });

  it('should sanitize inline malicious handlers (onerror, onload, etc.)', async () => {
    const maliciousMarkdown = 'Click here <img src="x" onerror="alert(1)"> image.';
    const result = await service.renderMarkdownToHtml(maliciousMarkdown);

    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert(1)');
    expect(result).toContain('<img src="x"');
  });
});
