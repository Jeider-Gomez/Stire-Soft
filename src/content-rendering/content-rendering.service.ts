import { Injectable } from '@nestjs/common';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import createDOMPurify = require('dompurify');

@Injectable()
export class ContentRenderingService {
  private readonly purify: createDOMPurify.DOMPurifyI;

  constructor() {
    const window = new JSDOM('').window;
    this.purify = createDOMPurify(window);
  }

  /**
   * Renderiza Markdown a HTML seguro en el backend para SEO
   * o para inyección directa evitando pesados parsers en el frontend.
   */
  async renderMarkdownToHtml(markdownContent: string): Promise<string> {
    const rawHtml = await marked.parse(markdownContent);
    return this.purify.sanitize(rawHtml);
  }
}

