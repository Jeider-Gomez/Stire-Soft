// Entrar v3 (Fase C; cuadros «Entrar» y «Entrar-celular» de scripts/diseno-v3/lienzo).
import * as fs from 'fs';
import * as path from 'path';

const raiz = path.resolve(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => fs.readFileSync(path.join(raiz, ...p), 'utf8');

describe('Entrar (v3)', () => {
  const login = leer('pages', 'auth', 'login.vue');

  it('«Tengo un código» guarda la clase como el QR y «Crear cuenta» la lleva consigo', () => {
    expect(login).toContain('volver: `/estudiante/clases?codigo=${encodeURIComponent(limpio)}`');
    expect(login).toContain("@input=\"codigo = codigoMientrasEscribe(codigo); faltaCodigo = ''\"");
    expect(login).toContain(":to=\"{ path: '/auth/register', query: route.query }\"");
  });

  it('mientras entra se ve a qué clase se va a unir', () => {
    expect(login).toContain('Al entrar te unes a la clase');
    expect(login).toContain('rutaDeVuelta(route.query.volver)');
  });

  it('las pestañas son accesibles: tablist, aria-selected y flechas', () => {
    expect(login).toContain('role="tablist" aria-label="Forma de entrar"');
    expect(login).toContain(':aria-selected="pestana === p.id"');
    expect(login).toContain('@keydown.left.prevent="cambiarPestana"');
  });

  it('pestañas y chips se tocan en 44 px (regla 11)', () => {
    expect(login).toContain('min-h-[44px] rounded-[9px]');
    expect(leer('assets', 'css', 'entrar-v3.css')).toContain(".chip-demo::after { content: ''; position: absolute; inset: -7px 0; }");
  });

  it('muestra «¿Qué es STIRE?» con el video de presentación', () => {
    expect(login).toContain('<PresentacionVideoSTIRE');
  });

  it('la mascota es decorativa y no se asoma en el celular', () => {
    const m = leer('components', 'auth', 'MascotaEntrar.vue');
    expect(m).toContain('class="mascota-entrar hidden sm:block" aria-hidden="true"');
  });

  it('los colores salen de los tokens del tema (claro, oscuro y alto contraste)', () => {
    const css = leer('assets', 'css', 'entrar-v3.css');
    expect(css).toContain('background: rgb(var(--c-base-texto-primario));');
    expect(css).not.toMatch(/#14213d/i);
  });
});
