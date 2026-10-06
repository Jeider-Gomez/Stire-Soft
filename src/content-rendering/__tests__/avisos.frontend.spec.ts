import { readFileSync } from 'fs';
import * as path from 'path';

// Fase 30 B1: Sistema de avisos compartido para toda la app del docente (D4).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('Fase 30 B1 · Sistema de avisos compartido (useAvisos y AvisosPantalla)', () => {
  it('useAvisos.ts define avisar, cerrar, tipos permitidos y límite de avisos', () => {
    const composable = leer('composables', 'useAvisos.ts');
    expect(composable).toContain('export function useAvisos()');
    expect(composable).toContain("type TipoAviso = 'exito' | 'error' | 'info'");
    expect(composable).toContain('function avisar(');
    expect(composable).toContain('function cerrar(');
    // Límite reactivo de máximo 3 avisos visibles (MAX = 3)
    expect(composable).toContain('const MAX = 3');
    // Autocierre de 6 segundos (6000ms) salvo para errores
    expect(composable).toContain('6000');
    expect(composable).toMatch(/tipo\s*!==\s*'error'/);
  });

  it('AvisosPantalla.vue usa roles accesibles (status/alert), botón cerrar y acción Deshacer', () => {
    const componente = leer('components', 'AvisosPantalla.vue');
    // Roles accesibles según D4 / B1
    expect(componente).toContain(":role=\"aviso.tipo === 'error' ? 'alert' : 'status'\"");
    // Botón de cerrar con aria-label
    expect(componente).toMatch(/aria-label="Cerrar aviso"/);
    // Botón Deshacer opcional
    expect(componente).toContain('v-if="aviso.deshacer"');
    expect(componente).toContain('Deshacer');
    // Respeta prefers-reduced-motion o transición accesible
    expect(componente).toContain('motion-reduce:');
  });

  it('AvisosPantalla.vue usa tokens semánticos y no clases de color crudo', () => {
    const componente = leer('components', 'AvisosPantalla.vue');
    expect(componente).toContain('semantico-pasa');
    expect(componente).toContain('semantico-falla');
    // info usa acento-ambar (identidad visual)
    expect(componente).toContain('acento-ambar');
    expect(componente).not.toMatch(/\b(bg|text|border)-(red|green|amber)-\d+/);
  });

  it('el layout del docente monta AvisosPantalla', () => {
    const layout = leer('layouts', 'teacher.vue');
    expect(layout).toContain('<AvisosPantalla />');
  });
});
