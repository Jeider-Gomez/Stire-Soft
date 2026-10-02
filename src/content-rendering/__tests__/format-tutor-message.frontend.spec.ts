import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { JSDOM } from 'jsdom';

const archivo = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', 'formatTutorMessage.ts');
const js = ts.transpileModule(readFileSync(archivo, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { formatTutorMessage } = mod.exports as { formatTutorMessage: (t: string) => string };
const textoVisible = (html: string) => new JSDOM(`<div>${html}</div>`).window.document.body.textContent ?? '';
const etiquetas = (html: string) => [...new JSDOM(`<div>${html}</div>`).window.document.body.firstElementChild!.querySelectorAll("*")].map((e) => e.tagName.toLowerCase());

// Prueba con Gemini real (02/10/2026): la respuesta llega escapada del servidor y el chat la escapaba otra vez.
describe('Chat del Tutor: el texto escapado por el servidor se ve bien y sigue siendo inerte', () => {
  it('«<-» del pseudocódigo y «<h1>» de HTML se leen tal cual, no «&lt;-»', () => {
    const delServidor = 'Asigna con `nombre &lt;- "Ana"` y compara con `intentos &lt; 5`. En HTML: `&lt;h1&gt;Hola&lt;/h1&gt;`';
    const visto = textoVisible(formatTutorMessage(delServidor));
    expect(visto).toContain('nombre <- "Ana"');
    expect(visto).toContain('intentos < 5');
    expect(visto).toContain('<h1>Hola</h1>');
    expect(visto).not.toContain('&lt;');
  });

  it('un bloque de código escapado también se ve bien', () => {
    const visto = textoVisible(formatTutorMessage('```\nSi edad &gt;= 18 Entonces\n  Escribir &quot;Puede votar&quot;\nFinSi\n```'));
    expect(visto).toContain('Si edad >= 18 Entonces');
    expect(visto).toContain('Escribir "Puede votar"');
  });

  it('sigue sin ejecutar HTML: un <script> o un onerror (escapados o no) quedan como texto', () => {
    for (const malo of ['&lt;script&gt;alert(1)&lt;/script&gt;', '<img src=x onerror="alert(1)">', '&lt;img src=x onerror=alert(1)&gt;']) {
      const html = formatTutorMessage(malo);
      expect(etiquetas(html).filter((t) => !['code', 'pre', 'strong', 'br', 'ul', 'ol', 'li', 'p'].includes(t))).toEqual([]);
      expect(html).not.toMatch(/<script|<img/i);
    }
  });

  it('un «&lt;» escrito a propósito por el estudiante (llega como &amp;lt;) no se convierte en «<»', () => {
    expect(textoVisible(formatTutorMessage('Escribe &amp;lt; en HTML'))).toContain('Escribe &lt; en HTML');
  });
});
