import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Hallazgos de Jorge en la Semana 9: QA-ERR-08 (REPORTE_QA_S8_2026-10-08.md, el Tutor solo decía «¡Hola!").
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

const s = cargar<{ saludoSegunHora: (h?: number) => string; saludoDeRespaldo: (h?: number) => string }>('saludoTutor');

describe('saludo de respaldo del Tutor (QA-ERR-08)', () => {
  it('dice buenos días, tardes o noches según la hora', () => {
    expect(s.saludoSegunHora(8)).toBe('¡Buenos días!');
    expect(s.saludoSegunHora(14)).toBe('¡Buenas tardes!');
    expect(s.saludoSegunHora(20)).toBe('¡Buenas noches!');
    expect(s.saludoDeRespaldo(9)).toMatch(/^¡Buenos días! Soy tu Tutor de STIRE\./);
  });

  it('el store ya no saluda con «¡Hola!» cuando el servidor no responde', () => {
    const store = leer('stores', 'tutor.ts');
    expect(store).not.toContain('¡Hola! Soy tu Tutor');
    expect(store.match(/saludoDeRespaldo\(\)/g)?.length).toBe(2);
  });
});

describe('sugerencias de Jorge en STIRE (16/10)', () => {
  it('n.º 14: escanear el QR une a la clase sin pulsar «Unirse», también al llegar con ?codigo=', () => {
    const p = leer('pages', 'estudiante', 'clases.vue');
    expect(p).toContain('<EscanerQrClase @codigo="unirseDesdeQr" />');
    expect(p).toMatch(/function unirseDesdeQr\(codigo: string\) \{[\s\S]*?return handleJoinClass\(\)/);
    expect(p).toMatch(/if \(codigo\) \{\s*navigateTo\(\{ path: route\.path, query: \{\} \}, \{ replace: true \}\)\s*unirseDesdeQr\(codigo\)/);
    expect(p).not.toContain('pulsa «Unirse» para entrar');
  });

  it('n.º 15 y 16: al enviar, el agradecimiento con «Nueva sugerencia» y «Ver lo que he enviado», y el formulario vuelve en blanco', () => {
    const b = leer('components', 'layout', 'BotonSugerencias.vue');
    expect(b).toMatch(/<div v-if="enviado" class="space-y-3">[\s\S]*?Nueva sugerencia[\s\S]*?Ver lo que he enviado[\s\S]*?<\/div>\s*<\/div>\s*<form v-else/);
    expect(b).toMatch(/function nuevaSugerencia\(\) \{[\s\S]*?enviado\.value = false[\s\S]*?f\.texto = ''[\s\S]*?captura\.value = null/);
    expect(b).toMatch(/function abrir\(\) \{\s*abierto\.value = true\s*nuevaSugerencia\(\)/);
  });
});
