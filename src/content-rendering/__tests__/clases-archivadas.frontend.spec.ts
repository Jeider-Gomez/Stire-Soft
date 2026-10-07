import { readFileSync } from 'fs';
import * as path from 'path';

// Fase 30 B4 y B5: Clases archivadas en index.vue, VentanaEliminarClase.vue y ajustes.vue sin api.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('Fase 30 B4 · VentanaEliminarClase.vue — consecuencias y confirmar con una casilla (D3 bis, simplificada el 07/10)', () => {
  it('el componente existe y muestra consecuencias del impacto', () => {
    const comp = leer('components', 'docente', 'VentanaEliminarClase.vue');
    expect(comp).toContain('textoConsecuencias');
    expect(comp).toContain('Calculando');
    // Muestra matriculados si hay
    expect(comp).toContain('sePuedeEliminar');
  });

  it('se confirma con una casilla, sin cuenta regresiva ni escribir el nombre (07/10, Jeider: «es tedioso»)', () => {
    const comp = leer('components', 'docente', 'VentanaEliminarClase.vue');
    expect(comp).toContain('puedeConfirmar(entendido.value)');
    expect(comp).toContain('<input v-model="entendido" type="checkbox"');
    expect(comp).toContain('Entiendo que la clase se borra para siempre');
    expect(comp).not.toContain('nombreEscrito');
    expect(comp).not.toContain('segundosRestantes');
    // Botón final habilitado solo con la casilla marcada (y si el servidor dice que se puede)
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
