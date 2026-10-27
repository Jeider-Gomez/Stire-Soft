import { readFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

// Público de 18 años o más (22/10/2026, docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md): registro con edad y términos,
// páginas públicas, cuentas antiguas que aceptan una vez e investigación opcional y revocable.
const front = (r: string) => readFileSync(join(__dirname, '../../../frontend-nuxt', r), 'utf8');

// utils/legal.ts es del frontend: se transpila aquí, como en manual-usuario.frontend.spec.ts.
type Doc = { titulo: string; secciones: Array<{ titulo: string; parrafos: string[] }> };
const legal = (() => {
  const js = ts.transpileModule(front('utils/legal.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as {
    POLITICA: Doc; TERMINOS: Doc; VERSION_TERMINOS: string;
    terminosAlDia: (u: { terminosVersion?: string | null; mayorDeEdadConfirmadoEn?: string | null } | null) => boolean;
    servidorConTerminos: (u: object | null) => boolean;
  };
})();
const { POLITICA, TERMINOS, VERSION_TERMINOS, terminosAlDia, servidorConTerminos } = legal;

describe('Términos y mayoría de edad en la pantalla', () => {
  it('terminosAlDia exige la versión vigente y la confirmación de edad', () => {
    expect(terminosAlDia({ terminosVersion: VERSION_TERMINOS, mayorDeEdadConfirmadoEn: '2026-10-22T00:00:00Z' })).toBe(true);
    expect(terminosAlDia({ terminosVersion: VERSION_TERMINOS, mayorDeEdadConfirmadoEn: null })).toBe(false);
    expect(terminosAlDia({ terminosVersion: '2026-01-01', mayorDeEdadConfirmadoEn: '2026-01-01' })).toBe(false);
    expect(terminosAlDia(null)).toBe(false);
  });

  it('mientras el backend nuevo no está desplegado (el usuario no trae el campo), no se pide aceptar', () => {
    expect(servidorConTerminos({ id: 1, email: 'a@b.co' })).toBe(false);
    expect(servidorConTerminos({ id: 1, terminosVersion: null })).toBe(true);
    expect(servidorConTerminos(null)).toBe(false);
  });

  it('los términos dicen que STIRE es para 18 años o más y que la clave de Gemini es propia', () => {
    const texto = JSON.stringify(TERMINOS);
    expect(texto).toContain('18 años o más');
    expect(texto).toContain('tu propia clave gratuita de Google AI Studio');
  });

  it('la política avisa qué recibe Google, que no se envían nombre ni correo y que la investigación se autoriza al aceptar y se retira en el perfil', () => {
    const texto = JSON.stringify(POLITICA);
    expect(texto).toMatch(/Google puede usar ese contenido/);
    expect(texto).toMatch(/no le envía tu nombre ni tu correo/);
    expect(texto).toMatch(/fines investigativos, que autorizas al aceptar/);
    expect(texto).toMatch(/retirar esa autorización cuando quieras/);
  });

  it('una sola casilla, sin marcar, con la edad, los términos y los fines investigativos (Jeider, 26/10)', () => {
    const casillas = front('components/legal/CasillasAceptacion.vue');
    expect(casillas).not.toMatch(/checked/);
    expect(casillas.match(/type="checkbox"/g)).toHaveLength(1);
    expect(casillas.match(/default: false/g)).toHaveLength(3);
    expect(casillas).toContain('con fines investigativos');
    expect(casillas).toContain('set: (v: boolean) => { mayorDeEdad.value = v; terminos.value = v; investigacion.value = v }');
  });

  it('el registro no deja crear la cuenta sin las dos casillas y envía la decisión', () => {
    const registro = front('pages/auth/register.vue');
    expect(registro).toContain('<LegalCasillasAceptacion');
    expect(registro).toMatch(/faltaAceptar\.value = !confirmaMayorDeEdad\.value \|\| !aceptaTerminos\.value/);
    expect(registro).toContain('consienteInvestigacion: consienteInvestigacion.value');
  });

  it('las cuentas sin aceptar van a /aceptar-terminos; términos y política se leen sin cuenta', () => {
    const mw = front('middleware/auth.global.ts');
    expect(mw).toContain("to.path === '/terminos' || to.path === '/privacidad'");
    expect(mw).toMatch(/if \(servidorConTerminos\(authStore\.user\) && !terminosAlDia\(authStore\.user\)\)/);
    expect(front('pages/aceptar-terminos.vue')).toContain('authStore.aceptarTerminos');
  });

  it('en el perfil se puede dejar de participar en la investigación', () => {
    expect(front('pages/estudiante/perfil.vue')).toContain('<PerfilInvestigacion');
    expect(front('pages/docente/perfil.vue')).toContain('<PerfilInvestigacion');
    expect(front('components/perfil/Investigacion.vue')).toContain('decidirInvestigacion(!participa.value)');
  });
});
