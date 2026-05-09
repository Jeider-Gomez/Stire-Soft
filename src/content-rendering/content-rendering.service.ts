import { Injectable } from '@nestjs/common';
import { marked } from 'marked';

@Injectable()
export class ContentRenderingService {
  /**
   * Renderiza Markdown a HTML seguro en el backend para SEO
   * o para inyección directa evitando pesados parsers en el frontend.
   */
  async renderMarkdownToHtml(markdownContent: string): Promise<string> {
    // Aquí se configuraría DOMPurify para evitar XSS si fuera necesario
    return marked.parse(markdownContent);
  }
}
