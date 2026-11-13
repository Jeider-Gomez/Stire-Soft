// Página de inicio pública (v3, Fase C; cuadros «Pagina-inicio» y «Pagina-inicio-celular» del lienzo).
import * as fs from 'fs';
import * as path from 'path';

const raiz = path.resolve(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => fs.readFileSync(path.join(raiz, ...p), 'utf8');

describe('Página de inicio', () => {
  const pagina = leer('pages', 'index.vue');
  const secciones = leer('components', 'presentacion', 'Secciones.vue');

  it('sin sesión, la raíz muestra la página; con sesión, sigue yendo al panel del rol', () => {
    const m = leer('middleware', 'auth.global.ts');
    expect(m).toContain("if (to.path === '/') return");
    expect(m).toContain('return navigateTo(getDashboardForRole(role))');
    expect(pagina).toContain('definePageMeta({ layout: false })');
  });

  it('tiene las partes del cuadro: video, cómo funciona, cómo enseña, repasos, docentes, accesibilidad y el código', () => {
    expect(pagina).toContain('<PresentacionVideoEnLinea');
    for (const id of ['como-funciona', 'como-ensena', 'repasos', 'docentes', 'accesibilidad']) expect(secciones).toContain(`id="${id}"`);
    expect(pagina).toContain('<PresentacionCodigoClase');
  });

  it('las capturas existen y tienen texto alternativo', () => {
    for (const f of ['v3-inicio.webp', 'v3-tutor.webp', 'v3-repasos.webp', 'v3-docente.webp']) {
      expect(fs.existsSync(path.join(raiz, 'public', 'inicio', f))).toBe(true);
    }
    expect(secciones).toContain(':alt="p.alt"');
  });

  it('«Unirme» abre Entrar en el código y «Soy docente» abre el registro como docente', () => {
    expect(pagina).toContain("query: { forma: 'codigo' }");
    expect(leer('pages', 'auth', 'login.vue')).toContain("route.query.forma === 'codigo' ? 'codigo' : 'cuenta'");
    expect(pagina).toContain("query: { rol: 'docente' }");
    expect(leer('pages', 'auth', 'register.vue')).toContain("route.query.rol === 'docente' ? 'docente' : 'estudiante'");
  });

  it('el código de la franja se guarda como el del QR', () => {
    const c = leer('components', 'presentacion', 'CodigoClase.vue');
    expect(c).toContain('volver: `/estudiante/clases?codigo=${encodeURIComponent(limpio)}`');
    expect(c).toContain('<form novalidate');
  });

  it('el video en la página no arranca solo y trae subtítulos y transcripción', () => {
    const v = leer('components', 'presentacion', 'VideoEnLinea.vue');
    expect(v).not.toMatch(/autoplay/);
    expect(v).toContain('<track kind="captions" srclang="es"');
    expect(v).toContain(':aria-expanded="verTexto"');
  });

  it('palabras humanas: sin rachas ni presión, y nada de «trabado» ni «rezago»', () => {
    expect(secciones).toContain('Sin rachas diarias ni presión');
    expect(pagina + secciones).not.toMatch(/trabad|rezag|bloquead/i);
  });

  it('en oscuro las etiquetas usan la versión clara de su color (contraste AA)', () => {
    expect(secciones).toContain(":root[data-tema='oscuro'] .etiqueta-seccion { color: rgb(var(--c-sec-menta-icono)); }");
  });
});
