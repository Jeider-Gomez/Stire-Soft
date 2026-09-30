import { readFileSync } from 'fs';
import * as path from 'path';

// Al abrir un ejercicio que no es de código, la pantalla pintaba un instante el editor de código: el store empezaba
// con questionType 'coding' y, al pasar de un ejercicio a otro, conservaba el tipo del anterior mientras cargaba.
// Jest no compila frontend-nuxt/, así que se lee el store real.
const FRONT = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const store = readFileSync(path.join(FRONT, 'stores', 'workspace.ts'), 'utf8');
const pagina = readFileSync(path.join(FRONT, 'pages', 'estudiante', 'evaluacion', '[activityId].vue'), 'utf8');

describe('Pantalla del ejercicio: sin parpadeo del editor de código al cargar', () => {
  it('el ejercicio empieza sin tipo, no como «coding»', () => {
    const inicial = store.slice(store.indexOf('const currentExercise = ref<WorkspaceExercise>('));
    expect(inicial.slice(0, inicial.indexOf('})'))).toMatch(/questionType:\s*''/);
  });

  it('al cargar otro ejercicio se borra el tipo del anterior antes de pedirlo al servidor', () => {
    const carga = store.slice(store.indexOf('async function loadActivity'));
    const reinicio = carga.indexOf("questionType: ''");
    const peticion = carga.indexOf('api.get');
    expect(reinicio).toBeGreaterThan(-1);
    expect(reinicio).toBeLessThan(peticion);
  });

  it('si la carga falla, la pantalla lo dice (no queda el esqueleto de carga para siempre)', () => {
    expect(store).toMatch(/loadError\.value = msg/);
    expect(pagina).toMatch(/v-else-if="workspaceStore\.loadError"/);
  });
});
