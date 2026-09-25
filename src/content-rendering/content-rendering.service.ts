import { Injectable } from '@nestjs/common';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import createDOMPurify = require('dompurify');
import { sanitizeAroundCode } from './code-segments';

export enum SanitizationProfile {
  /**
   * Autoría docente: content.body, activity.description,
   * activity_question.question. Lista blanca generosa (ADR 07):
   * encabezados, listas, tablas, imágenes, enlaces, bloques de código, e
   * iframes SOLO contra hosts embebibles permitidos (YouTube, Vimeo).
   */
  RICH = 'RICH',
  /**
   * Texto de estudiante o de la IA: submission.feedback,
   * tutor_conversation.content. Sin HTML — un estudiante nunca necesita
   * inyectar marcado, y la salida de un LLM no es HTML de confianza aunque
   * no venga de un usuario humano.
   */
  PLAIN = 'PLAIN',
}

const ALLOWED_IFRAME_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];

const RICH_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
    'strong', 'em', 'b', 'i', 'u', 's', 'blockquote',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img', 'a', 'pre', 'code', 'span', 'div', 'iframe',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class',
    'colspan', 'rowspan', 'target', 'rel',
    'width', 'height', 'allow', 'allowfullscreen', 'frameborder',
  ],
};

const PLAIN_CONFIG = { ALLOWED_TAGS: [], ALLOWED_ATTR: [] };

@Injectable()
export class ContentRenderingService {
  private readonly purify: ReturnType<typeof createDOMPurify>;

  constructor() {
    const window = new JSDOM('').window;
    // Sin cast: el DOMWindow de jsdom ya satisface WindowLike estructuralmente
    // (expone Node/Element/DocumentFragment/etc. como propiedades propias).
    // `as unknown as Window` (el tipo del DOM del navegador, no el de jsdom)
    // rompe esa forma estructural y produce TS2345 con dompurify >=3.4.5 +
    // typescript >=5.9 — build roto en cualquier checkout limpio. No añadir
    // de vuelta sin verificar `npm ci && npm run build` en un directorio
    // limpio primero.
    this.purify = createDOMPurify(window);

    // ADR 07: iframe solo contra hosts embebibles permitidos. DOMPurify no
    // tiene una opción declarativa para "lista blanca de hosts de src", así
    // que se filtra con un hook — cualquier iframe cuyo host no esté en la
    // lista se elimina del árbol, no solo se le vacía el src.
    this.purify.addHook('uponSanitizeElement', (node, data) => {
      if (data.tagName !== 'iframe') return;
      const src = (node as Element).getAttribute?.('src');
      let host: string | null = null;
      try {
        host = src ? new URL(src, 'https://invalid.local').hostname : null;
      } catch {
        host = null;
      }
      if (!host || !ALLOWED_IFRAME_HOSTS.includes(host)) {
        node.parentNode?.removeChild(node);
      }
    });
  }

  /**
   * Saneamiento AL ESCRIBIR (capa 1 de 2, ADR 07). Conserva el formato
   * Markdown original tal cual — no lo convierte a HTML — y solo elimina el
   * HTML peligroso que ya viniera incrustado en el texto (p. ej. un
   * `<script>` pegado directamente). No sustituye al saneamiento de
   * renderizado: atrapa vectores distintos (este limpia el texto fuente
   * ANTES de guardarlo; `renderMarkdownToHtml` limpia el HTML que produce
   * `marked` a partir de sintaxis Markdown, como `[x](javascript:...)`,
   * invisible aquí porque en el texto fuente es simple texto).
   */
  sanitizeRichText(markdown: string): string {
    if (!markdown) return markdown;
    const sanitize = (text: string) => this.purify.sanitize(text, RICH_CONFIG) as unknown as string;
    // Fase 25 (A7): el código (bloques ``` y código en línea) se conserva TAL CUAL y solo se sanea el resto; el frontend escapa esos
    // segmentos al pintarlos. Ver code-segments.ts (por qué es seguro y qué hay que cuidar). Si no se puede garantizar que el
    // frontend segmentará el resultado igual, se sanea el texto completo como antes.
    return sanitizeAroundCode(markdown, sanitize) ?? sanitize(markdown);
  }

  /**
   * Saneamiento AL ESCRIBIR para texto de estudiante/IA (ADR 07, perfil
   * PLAIN). Elimina cualquier etiqueta HTML — incluido su contenido para
   * `<script>`/`<style>` — dejando solo texto plano. No usa entidades HTML
   * (`&lt;`) porque este texto nunca se interpola directamente en una
   * plantilla HTML del lado servidor; lo consume la API como texto plano.
   */
  escapePlainText(text: string): string {
    if (!text) return text;
    return this.purify.sanitize(text, PLAIN_CONFIG) as unknown as string;
  }

  /**
   * Saneamiento AL RENDERIZAR (capa 2 de 2, ADR 07): único camino hacia
   * HTML. `profile` decide la lista blanca — RICH para contenido docente,
   * PLAIN si alguna vez se necesita convertir texto de estudiante/IA a HTML
   * (hoy no hay ningún endpoint que lo haga; ambos perfiles se sirven como
   * JSON/texto plano al cliente).
   */
  async renderMarkdownToHtml(
    markdownContent: string,
    profile: SanitizationProfile = SanitizationProfile.RICH,
  ): Promise<string> {
    const rawHtml = await marked.parse(markdownContent);
    const config = profile === SanitizationProfile.RICH ? RICH_CONFIG : PLAIN_CONFIG;
    return this.purify.sanitize(rawHtml, config) as unknown as string;
  }
}
