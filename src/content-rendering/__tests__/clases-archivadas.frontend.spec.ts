import { readFileSync } from 'fs';
import * as path from 'path';

// Fase 30 B4 y B5: Clases archivadas en index.vue, VentanaEliminarClase.vue y ajustes.vue sin api.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('Fase 30 B4 · VentanaEliminarClase.vue — cuenta regresiva, nombre y consecuencias (D3 bis)', () => {
  it('el componente existe y muestra consecuencias del impacto', () => {
    const comp = leer('components', 'docente', 'VentanaEliminarClase.vue');
    expect(comp).toContain('textoConsecuencias');
    expect(comp).toContain('Calculando');
    // Muestra matriculados si hay
    expect(comp).toContain('sePuedeEliminar');
  });

  it('tiene cuenta regresiva de 8 s y campo de nombre para confirmar (D3 bis)', () => {
    const comp = leer('components', 'docente', 'VentanaEliminarClase.vue');
    expect(comp).toContain('duracionSegundos');
    expect(comp).toContain('puedeConfirmar');
    expect(comp).toContain('nombreEscrito');
    expect(comp).toContain('Escribe el nombre de la clase para confirmar');
    // Contador visible en el botón
    expect(comp).toContain('Lee antes de continuar');
    // Botón final habilitado solo cuando el nombre coincide
    expect(comp).toContain(':disabled="!puedeEliminar || eliminando"');
  });

  it('ofrece «Archivar la clase» siempre visible (D3 bis)', () => {
    const comp = leer('components', 'docente', 'VentanaEliminarClase.vue');
    expect(comp).toMatch(/@archivar|['"]archivar['"]/);
    expect(comp).toContain('Archivar');
  });

  it('foco inicial en Cancelar y accesible (data-foco-inicial)', () => {
    const comp = leer('components', 'docente', 'VentanaEliminarClase.vue');
    expect(comp).toContain('data-foco-inicial');
    expect(comp).toContain('aria-live');
  });

  it('usa semantico-falla sin clases de color crudo', () => {
    const comp = leer('components', 'docente', 'VentanaEliminarClase.vue');
    expect(comp).toContain('semantico-falla');
    expect(comp).not.toMatch(/\b(bg|text|border)-(red|green|amber)-\d+/);
  });
});

describe('Fase 30 B4 · index.vue — clases archivadas con Restaurar', () => {
  it('separa clases activas de archivadas (isActive === false)', () => {
    const pagina = leer('pages', 'docente', 'index.vue');
    expect(pagina).toContain('clasesArchivadas');
    expect(pagina).toContain('isActive === false');
  });

  it('muestra sección «Clases archivadas (N)» plegada con Restaurar', () => {
    const pagina = leer('pages', 'docente', 'index.vue');
    expect(pagina).toContain('Clases archivadas');
    expect(pagina).toContain('@click="restaurarClase(c)"');
    expect(pagina).toContain('Restaurar');
  });

  it('el chip «Archivada» sale en la tarjeta activa (no «Inactiva»)', () => {
    const pagina = leer('pages', 'docente', 'index.vue');
    expect(pagina).toContain('Archivada');
    expect(pagina).not.toMatch(/\bInactiva\b/);
  });
});

describe('Fase 30 B4 · ajustes.vue — sin llamadas directas a la API (PAT-01)', () => {
  it('ajustes.vue no usa useApi() directamente', () => {
    const ajustes = leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue');
    expect(ajustes).not.toMatch(/\buseApi\s*\(/);
    // Delega a useAjustesClase
    expect(ajustes).toContain('useAjustesClase');
  });

  it('Ajustes integra VentanaEliminarClase (en su sección «Estado y gestión»)', () => {
    const ajustes = leer('components', 'docente', 'ajustes', 'SeccionGestion.vue');
    expect(ajustes).toContain('DocenteVentanaEliminarClase');
  });

  it('useAjustesClase.ts encapsula eliminarClase, archivarClase y guardarCompartir', () => {
    const composable = leer('composables', 'useAjustesClase.ts');
    expect(composable).toContain('async function eliminarClase(');
    expect(composable).toContain('/archivar');
    expect(composable).toContain('async function guardarCompartir(');
    // guardarCompartir recibe datos.alcancePlantilla
    expect(composable).toContain('datos.alcancePlantilla ===');
  });

  it('useClasesDocente.ts tiene restaurarClase y archivarClase', () => {
    const composable = leer('composables', 'useClasesDocente.ts');
    expect(composable).toContain('async function restaurarClase(');
    expect(composable).toContain('/restaurar');
    expect(composable).toContain('async function archivarClase(');
    expect(composable).toContain('/archivar');
  });
});
