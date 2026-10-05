import { readFileSync } from 'fs';
import * as path from 'path';

// Tope estilo ASSISTments en pantalla (docs/DISENO_INTERVENCION_DOCENTE.md §4.4; BASE_TEORICA.md BT-16).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');

describe('Tope: lo que ve el estudiante', () => {
  it('en la lección, la pausa pone primero «Pedir una pista» y «Releer la explicación»; el ejercicio queda como enlace secundario', () => {
    const leccion = leer('pages', 'estudiante', 'unidad', '[id].vue');
    expect(leccion).toContain("const enPausa = computed(() => recommendedActivity.value?.reason === 'pausa')");
    expect(leccion.indexOf('Pedir una pista al Tutor')).toBeLessThan(leccion.indexOf('Releer la explicación'));
    expect(leccion.indexOf('Releer la explicación')).toBeLessThan(leccion.indexOf('Probar otro ejercicio igual'));
    expect(leccion).toContain('@click="tutorStore.openDrawer()"');
    expect(leccion).toContain('id="explicacion"');
  });

  it('en el inicio, el siguiente paso de una lección en pausa es releer la lección', () => {
    const inicio = leer('pages', 'estudiante', 'index.vue');
    expect(inicio).toContain("|| recommendedReason === 'pausa'\" :to=\"`/estudiante/unidad/${studentStore.activeUnit.id}`\"");
    expect(inicio).toContain("recommendedReason === 'pausa' ? 'Releer la lección'");
  });
});
