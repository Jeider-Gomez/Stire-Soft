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
    expect(login).toContain('<AuthMarcoEntrar');
    expect(leer('components', 'auth', 'MarcoEntrar.vue')).toContain('<PresentacionVideoSTIRE');
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

  it('Crear cuenta usa el mismo marco, conserva los dos pasos y muestra la clase del QR', () => {
    const r = leer('pages', 'auth', 'register.vue');
    expect(r).toContain('<AuthMarcoEntrar compacto');
    expect(r).toContain("{{ paso === 1 ? 'Paso 1 de 2 · Lo necesario' : 'Paso 2 de 2 · Opcional' }}");
    expect(r).toContain('<legend class="mb-1.5 text-[15px] font-semibold">Voy a usar STIRE como</legend>');
    expect(r).toContain('Al crear tu cuenta te unes a la clase');
    expect(r).not.toContain('confirmPassword');
    // errores bajo cada campo, enlazados al campo (PAT-03)
    expect(r).toContain(":aria-describedby=\"faltan.fullName ? 'nombre-falta' : undefined\"");
  });

  it('estados del cuadro «Entrar-estados»: abriendo con la mascota, error con salida y código con «Unirme a la clase»', () => {
    expect(login).toContain('<AuthAbriendo v-if="accesoConcedido" />');
    expect(leer('components', 'auth', 'Abriendo.vue')).toContain('Abriendo tu inicio…');
    expect(login).toContain("noCoinciden.value ? 'El correo o la contraseña no coinciden.' : texto");
    expect(login).toContain('crea una contraseña nueva</NuxtLink>');
    expect(login).toContain('>Unirme a la clase</button>');
  });

  it('recuperar y crear la contraseña nueva usan el mismo marco; la respuesta no dice si la cuenta existe', () => {
    const f = leer('pages', 'auth', 'forgot-password.vue');
    expect(f).toContain('<AuthMarcoEntrar compacto');
    expect(f).toContain('Te escribimos al correo');
    expect(f).toContain("res?.message || 'Si el correo está registrado");
    expect(leer('pages', 'auth', 'reset-password.vue')).toContain('<AuthMarcoEntrar compacto');
  });
});
