import { readFileSync } from 'fs';
import * as path from 'path';

// PAT-04 (07/10): Ajustes de la clase tenía 604 líneas con ocho secciones y su lógica. Ahora la página organiza y cada
// sección independiente es un componente en components/docente/ajustes/.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
// Sin depender del salto de línea: en Windows, Git puede dejar los archivos con CRLF.
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8').replace(/\r\n/g, '\n');
const SECCIONES = ['SeccionAvance', 'SeccionLogros', 'SeccionCompartir', 'SeccionDatos', 'SeccionGestion'];
const pagina = leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue');

describe('Ajustes de la clase dividido (PAT-04)', () => {
  it('la página organiza: corta, sin API y con una etiqueta por sección', () => {
    expect(pagina.split('\n').length).toBeLessThanOrEqual(200);
    expect(pagina).not.toMatch(/\buseApi\s*\(/);
    for (const s of SECCIONES) expect(pagina).toContain(`<DocenteAjustes${s} :ajustes="ajustes"`);
    // Quién está en la clase y cómo se entra se quedan aquí: comparten la ventana de «Quitar de la clase».
    expect(pagina).toContain('Solicitudes para entrar');
    expect(pagina).toContain('¿Quitar estudiante de la clase?');
  });

  it('cada sección es un componente de menos de 300 líneas, con su lógica y sin llamar a la API', () => {
    for (const s of SECCIONES) {
      const c = leer('components', 'docente', 'ajustes', `${s}.vue`);
      expect(c.split('\n').length).toBeLessThan(300);
      expect(c).toContain('defineProps<{ ajustes: EstadoAjustesClase');
      expect(c).not.toMatch(/\buseApi\s*\(/);
    }
  });

  it('los errores al eliminar o archivar la clase y al aprobar estudiantes se muestran (aviso de error)', () => {
    const gestion = leer('components', 'docente', 'ajustes', 'SeccionGestion.vue');
    // Antes iban a `errorEliminarClase` y `saveError`, que nada mostraba cerca del botón que falló.
    expect(gestion).not.toContain('errorEliminarClase');
    expect(gestion).toContain("avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo eliminar la clase.') })");
    expect(gestion).toContain("avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo cambiar el estado de la clase.') })");
    expect(pagina).toContain("avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo procesar la solicitud.') })");
    expect(pagina).not.toContain('saveError');
  });

  it('el formulario de datos se llena una vez: guardar logros o avance no borra lo que el docente estaba escribiendo', () => {
    const datos = leer('components', 'docente', 'ajustes', 'SeccionDatos.vue');
    expect(datos).toMatch(/if \(c && !lleno\.value\) \{ llenarFormulario\(c\); lleno\.value = true \}/);
  });
});
