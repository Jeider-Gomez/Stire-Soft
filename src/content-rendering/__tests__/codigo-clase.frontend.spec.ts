import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { normalizarCodigo as normalizarServidor } from '../../class/codigo-clase';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
function cargar<T>(): T {
  const js = ts.transpileModule(readFileSync(path.join(raiz, 'utils', 'codigoClase.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}
const u = cargar<{
  normalizarCodigo: (t: string) => string;
  sugerirCodigo: (n: string, azar?: () => number) => string;
  urlDeIngreso: (o: string, c: string) => string;
  rutaDeVuelta: (v: unknown) => string | null;
  codigoDesdeQr: (t: string) => string | null;
}>();
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('Código y QR de la clase (frontend)', () => {
  it('normaliza igual que el servidor', () => {
    for (const t of ['algo web', ' Algo_Wéb ', 'pensar--algo', 'año 1']) expect(u.normalizarCodigo(t)).toBe(normalizarServidor(t));
  });

  it('la sugerencia usa la primera palabra del nombre y 4 caracteres sin 0/O ni 1/I/L', () => {
    expect(u.sugerirCodigo('Pensamiento algorítmico', () => 0)).toBe('PENSAM-AAAA');
    expect(u.sugerirCodigo('', () => 0.99)).toMatch(/^CLASE-[A-Z2-9]{4}$/);
    const muchas = new Set(Array.from({ length: 200 }, () => u.sugerirCodigo('Algoritmia')));
    expect(muchas.size).toBeGreaterThan(195);
    for (const c of muchas) expect(c).not.toMatch(/-.*[01OIL]/);
  });

  it('el QR lleva la página para unirse con el código escrito', () => {
    expect(u.urlDeIngreso('https://stire-soft.vercel.app/', 'ALGO-7KQ2')).toBe('https://stire-soft.vercel.app/estudiante/clases?codigo=ALGO-7KQ2');
    expect(leer('components', 'docente', 'VentanaQrClase.vue')).toContain('QRCode.toCanvas(lienzo.value, urlDeIngreso(window.location.origin, props.codigo)');
  });

  it('tras iniciar sesión o registrarse vuelve a la página del QR, nunca a otro sitio', () => {
    expect(u.rutaDeVuelta('/estudiante/clases?codigo=ALGO-7KQ2')).toBe('/estudiante/clases?codigo=ALGO-7KQ2');
    for (const malo of ['//evil.com', 'https://evil.com', '/\\evil.com', '/auth/login', 5, undefined]) expect(u.rutaDeVuelta(malo)).toBeNull();
    expect(leer('middleware', 'auth.global.ts')).toContain("query: { volver: to.fullPath }");
    expect(leer('pages', 'auth', 'login.vue')).toContain('rutaDeVuelta(route.query.volver) ?? rutaDelRol(');
    expect(leer('pages', 'auth', 'register.vue')).toContain("rutaDeVuelta(route.query.volver) ?? '/estudiante'");
  });

  it('la página del estudiante toma el código del QR y el docente ve si el código está libre', () => {
    const clases = leer('pages', 'estudiante', 'clases.vue');
    expect(clases).toContain("normalizarCodigo(route.query.codigo)");
    expect(clases).toContain('Escaneaste el código de una clase');
    expect(leer('composables', 'useClasesDocente.ts')).toContain('/class/codigo-disponible?codigo=');
  });

  it('el escáner dentro de la app toma el código del QR de STIRE y no sigue un QR ajeno', () => {
    expect(u.codigoDesdeQr('https://stire-soft.vercel.app/estudiante/clases?codigo=prueba-j5x4')).toBe('PRUEBA-J5X4');
    expect(u.codigoDesdeQr('  ALGO-203413 ')).toBe('ALGO-203413');
    expect(u.codigoDesdeQr('https://evil.com/robar?codigo=ALGO')).toBeNull();
    expect(u.codigoDesdeQr('hola mundo, esto no es un código!!')).toBeNull();
    const clases = leer('pages', 'estudiante', 'clases.vue');
    expect(clases).toContain('<EscanerQrClase @codigo=');
    const escaner = leer('components', 'EscanerQrClase.vue');
    expect(escaner).toContain('<CamaraQr @leido="alLeer"');
    expect(escaner).toContain('cámara de tu celular');
    // lector del navegador si existe; si no (Chrome en Windows, iPhone), jsQR
    const lector = leer('utils', 'lectorQr.ts');
    expect(lector).toContain("new Nativo({ formats: ['qr_code'] })");
    expect(lector).toContain("await import('jsqr')");
    // la cámara se apaga al cerrar
    expect(leer('components', 'CamaraQr.vue')).toContain('flujo?.getTracks().forEach((t) => t.stop())');
  });
});
