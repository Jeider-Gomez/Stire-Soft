import { readFileSync } from 'fs';
import * as path from 'path';

// Rediseño R0 (docs/PLAN_REDISENO_DOCENTE.md): el aspecto nuevo vive solo en el panel del docente y respeta los temas.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');

describe('Aspecto del panel del docente (R0)', () => {
  const css = leer('assets', 'css', 'panel-docente.css');

  it('el layout del docente lleva el atributo y ningún otro layout lo lleva', () => {
    expect(leer('layouts', 'teacher.vue')).toContain('data-panel="docente"');
    for (const otro of ['student.vue', 'admin.vue', 'auth.vue', 'workspace.vue']) {
      expect(leer('layouts', otro)).not.toContain('data-panel=');
    }
  });

  it('el CSS se carga después de los temas y de main.css', () => {
    const config = leer('nuxt.config.ts');
    expect(config.indexOf("'~/assets/css/temas.css'")).toBeLessThan(config.indexOf("'~/assets/css/main.css'"));
    expect(config.indexOf("'~/assets/css/main.css'")).toBeLessThan(config.indexOf("'~/assets/css/panel-docente.css'"));
  });

  it('toda regla queda dentro de [data-panel="docente"] (el estudiante no cambia)', () => {
    const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const selectores = sinComentarios.match(/[^{}]+(?=\{)/g) ?? [];
    for (const s of selectores) {
      if (s.trim().startsWith('@media')) continue;
      expect(s).toContain('[data-panel="docente"]');
    }
  });

  it('no toca el alto contraste: lo excluye o no lo menciona sin :not', () => {
    const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(sinComentarios).not.toMatch(/\[data-contraste="alto"\](?!\))/);
    expect(sinComentarios).toContain(':not([data-contraste="alto"])');
  });

  it('cambia el fondo solo en claro y no redefine colores del tema oscuro', () => {
    expect(css).toMatch(/:not\(\[data-tema="oscuro"\]\)[^{]*\[data-panel="docente"\]\s*\{[^}]*--c-stire-canvas/);
    expect(css).not.toMatch(/\[data-tema="oscuro"\]\s*\[data-panel/);
  });

  it('con reducir el movimiento las transiciones se quitan', () => {
    expect(css).toContain('[data-movimiento="reducido"]');
    expect(css).toContain('prefers-reduced-motion: reduce');
  });

  it('usa la letra del sistema, sin fuentes externas (desde el 26/10 en toda la app, no solo en el panel)', () => {
    expect(css).not.toMatch(/@import|googleapis/);
    const tw = readFileSync(path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'tailwind.config.ts'), 'utf8');
    expect(tw).toMatch(/interfaz: \['-apple-system'/);
    expect(tw).toMatch(/poppins: \['-apple-system'/);
    // Inter queda solo para el nombre «stire_» del logo; Poppins ya no se descarga.
    const main = readFileSync(path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'assets', 'css', 'main.css'), 'utf8');
    expect(main).toContain('family=Inter:wght@800&');
    expect(main).not.toContain('Poppins');
  });
});
