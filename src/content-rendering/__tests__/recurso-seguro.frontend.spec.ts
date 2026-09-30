import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// frontend-nuxt/utils/recursoSeguro.ts: la segunda barrera antes de poner un recurso en un iframe o en un <img>.
// Jest no compila frontend-nuxt/, así que se transpila aquí igual que en plural.frontend.spec.ts.
interface Util {
  urlInsertable: (v: unknown) => string | null;
  urlEnlace: (v: unknown) => string | null;
  urlImagen: (v: unknown, apiBase: string) => string | null;
}

function cargar(): Util {
  const file = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', 'recursoSeguro.ts');
  const js = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as unknown as Util;
}

const { urlInsertable, urlEnlace, urlImagen } = cargar();

describe('recursoSeguro (pantalla): solo se inserta lo de sitios permitidos', () => {
  it('acepta las direcciones que arma el servidor', () => {
    expect(urlInsertable('https://www.youtube-nocookie.com/embed/abc')).toBe('https://www.youtube-nocookie.com/embed/abc');
    expect(urlInsertable('https://view.genial.ly/64f0')).toBe('https://view.genial.ly/64f0');
  });

  it('rechaza otro sitio, http, javascript: y valores que no son texto', () => {
    for (const malo of ['https://evil.example/embed', 'http://view.genial.ly/x', 'javascript:alert(1)', 42, null]) {
      expect(urlInsertable(malo)).toBeNull();
    }
  });

  it('un enlace para abrir solo si es http(s)', () => {
    expect(urlEnlace('https://kahoot.it/x')).toBe('https://kahoot.it/x');
    expect(urlEnlace('javascript:alert(1)')).toBeNull();
    expect(urlEnlace('data:text/html,hola')).toBeNull();
  });

  it('una imagen subida lleva la dirección de la API; una de la web debe ser https', () => {
    expect(urlImagen('/media/0f8fad5b-d9cb-469f-a165-70867728950e', 'https://api.x/')).toBe('https://api.x/media/0f8fad5b-d9cb-469f-a165-70867728950e');
    expect(urlImagen('https://upload.wikimedia.org/a.png', 'https://api.x')).toBe('https://upload.wikimedia.org/a.png');
    expect(urlImagen('/admin', 'https://api.x')).toBeNull();
    expect(urlImagen('http://x.org/a.png', 'https://api.x')).toBeNull();
  });
});
