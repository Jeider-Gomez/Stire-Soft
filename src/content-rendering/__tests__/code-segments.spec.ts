import { ContentRenderingService } from '../content-rendering.service';
import { sanitizeAroundCode } from '../code-segments';

// Fase 25, A7: el código de las lecciones se guarda tal cual; solo se sanea el resto.
describe('sanitizeRichText — segmentos de código (A7)', () => {
  const service = new ContentRenderingService();
  const clean = (text: string) => service.sanitizeRichText(text);

  describe('el código se conserva intacto', () => {
    it('un bloque ```html con <script>, <button onclick> y símbolos queda como lo escribió el docente', () => {
      const body = 'Ejemplo:\n\n```html\n<div class="tarjeta">\n  <script>console.log(1)</script>\n  <button onclick="x()">Clic</button>\n</div>\n```\n\nFin.';
      expect(clean(body)).toBe(body);
    });

    it('el código en línea conserva <, > y & sin codificarlos ni añadir cierres', () => {
      const body = 'Usa `a < b && c > d` y `<b>` en línea.';
      expect(clean(body)).toBe(body);
    });

    it('un bloque de JavaScript con comparaciones y cadenas con etiquetas', () => {
      const body = '```js\nif (a < b && c > d) { x = "<hola>"; }\n```';
      expect(clean(body)).toBe(body);
    });

    it('un bloque dentro de un código en línea se conserva completo', () => {
      const body = 'raro: `a ```<img src=x onerror=1>``` b` fin';
      expect(clean(body)).toBe(body);
    });
  });

  describe('el texto que NO es código se sigue saneando', () => {
    it('quita <script>, atributos on… y javascript: fuera del código', () => {
      const out = clean('Hola <script>alert(1)</script> <img src=x onerror="alert(1)"> <a href="javascript:alert(1)">x</a>');
      expect(out).not.toMatch(/<script/i);
      expect(out).not.toMatch(/onerror/i);
      expect(out).not.toMatch(/javascript:/i);
      expect(out).toContain('Hola');
    });

    it('sanea el texto alrededor del código y respeta el código', () => {
      const out = clean('<img src=x onerror="alert(1)"> antes `<img src=x onerror=1>` despues <script>x</script>');
      expect(out).toContain('`<img src=x onerror=1>`'); // dentro del código: intacto
      expect(out).not.toMatch(/onerror="alert/); // fuera del código: saneado
      expect(out).not.toMatch(/<script/i);
    });

    it('un bloque sin cerrar NO cuenta como código y se sanea completo', () => {
      const out = clean('```html\n<script>alert(1)</script>');
      expect(out).not.toMatch(/<script/i);
    });

    it('sin código, se comporta como siempre: sanea el HTML y conserva el Markdown', () => {
      const out = clean('Texto **negrita** con <b>html</b> y <img src=x onerror=1> y una lista:\n- uno\n- dos');
      expect(out).not.toMatch(/onerror/i);
      expect(out).toContain('**negrita**');
      expect(out).toContain('<b>html</b>');
      expect(out).toContain('- uno\n- dos');
    });
  });

  describe('detalles', () => {
    it('conserva los saltos de línea del texto que rodea al código', () => {
      const out = clean('Línea 1\n\n```js\nx\n```\n\nLínea 2\n');
      expect(out).toBe('Línea 1\n\n```js\nx\n```\n\nLínea 2\n');
    });

    it('descarta los caracteres NUL (el frontend los usa como marcador interno)', () => {
      const out = clean('a\u0000b `x\u0000y`');
      expect(out).not.toContain('\u0000');
      expect(out).toBe('ab `xy`');
    });

    it('un texto vacío o sin contenido se devuelve igual', () => {
      expect(clean('')).toBe('');
      expect(clean(undefined as unknown as string)).toBeUndefined();
    });

    it('es idempotente: guardar dos veces no cambia el resultado', () => {
      const body = 'Usa `a < b` y <b>hola</b>\n\n```html\n<script>1</script>\n```\n';
      const once = clean(body);
      expect(clean(once)).toBe(once);
    });
  });

  describe('sanitizeAroundCode — la comprobación de consistencia', () => {
    it('devuelve null si el saneado del texto cambiara los segmentos de código (el llamador cae al saneado completo)', () => {
      // Un «saneador» que INVENTA un bloque ``` al quitar una etiqueta hace que el frontend vea otro código que el servidor.
      const sneaky = (prose: string) => prose.replace('<x>', '```');
      expect(sanitizeAroundCode('a <x> b\n```\n<img src=x onerror=1>\n```', sneaky)).toBeNull();
    });

    it('devuelve el texto compuesto cuando los segmentos coinciden', () => {
      expect(sanitizeAroundCode('a `b` c', (t) => t.toUpperCase())).toBe('A `b` C');
    });
  });
});
