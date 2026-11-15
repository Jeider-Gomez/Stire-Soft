import { readFileSync } from 'fs';
import * as path from 'path';

const raizNuxt = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raizNuxt, ...p), 'utf8').replace(/\r\n/g, '\n');

describe('Registro de acciones del administrador (pantalla)', () => {
  const componente = leer('components', 'admin', 'AccionesAdmin.vue');

  it('lee GET /admin/system/acciones y nombra cada acción en español', () => {
    expect(leer('composables', 'useAccionesAdmin.ts')).toContain("'/admin/system/acciones?limit=50'");
    for (const clave of ['cambiar_rol', 'decidir_solicitud', 'desactivar_usuario']) expect(componente).toContain(clave);
  });

  it('muestra el estado vacío y el error con palabras claras', () => {
    expect(componente).toContain('Todavía no hay acciones registradas.');
    expect(componente).toContain('No se pudo cargar el registro de acciones.');
  });

  it('«Registros y mantenimiento» la incluye sin llamar a la API desde la página', () => {
    const pagina = leer('pages', 'admin', 'sistema.vue');
    expect(pagina).toContain('<AdminAccionesAdmin />');
  });
});
