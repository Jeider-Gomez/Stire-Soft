import { readFileSync } from 'fs';
import * as path from 'path';

// 27/10, pedido de Jeider: «revisa la disposición de todas las ventanas para aprovechar el espacio». El marco del docente
// ya no recorta a 6xl; todas las pestañas de una clase tienen el mismo ancho (la barra de pestañas no salta al cambiar);
// Hoy y Ajustes usan dos columnas en pantallas anchas; las ventanas de editar ejercicios y explicaciones son más anchas.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('el docente aprovecha el ancho de la pantalla', () => {
  it('el marco del docente deja hasta 90rem', () => {
    expect(leer('layouts', 'teacher.vue')).toContain('max-w-[90rem] mx-auto w-full');
  });
  it('todas las pestañas de una clase tienen el mismo ancho', () => {
    const paginas = [
      ['pages', 'docente', 'contenidos.vue'], ['pages', 'docente', 'rendimiento.vue'], ['pages', 'docente', 'entregas', 'index.vue'],
      ['pages', 'docente', 'refuerzos', 'index.vue'], ['pages', 'docente', 'clase', '[classId]', 'index.vue'],
      ['pages', 'docente', 'clase', '[classId]', 'ajustes.vue'], ['pages', 'docente', 'clase', '[classId]', 'asistencia.vue'],
      ['pages', 'docente', 'clase', '[classId]', 'notas.vue'], ['pages', 'docente', 'estudiante', '[studentId].vue'],
    ];
    for (const p of paginas) expect(leer(...p).match(/<div class="(max-w-\S+) mx-auto/)?.[1]).toBe('max-w-7xl');
  });
  it('Hoy y Ajustes en dos columnas en pantallas anchas', () => {
    expect(leer('pages', 'docente', 'clase', '[classId]', 'index.vue')).toContain('xl:grid-cols-[minmax(0,1fr),380px]');
    expect(leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue')).toContain('<div class="grid gap-6 lg:grid-cols-2 items-start">');
  });
  it('las ventanas de editar un ejercicio, el banco y la explicación son anchas', () => {
    expect(leer('components', 'docente', 'ejercicios', 'VentanaEditarEjercicio.vue')).toContain('ancho="4xl"');
    expect(leer('components', 'docente', 'ejercicios', 'VentanaBancoEjercicios.vue')).toContain('ancho="4xl"');
    expect(leer('components', 'docente', 'UnitLessonsModal.vue')).toContain('shadow-xl max-w-4xl');
  });
});
