import { readdirSync, readFileSync, statSync } from 'fs';
import * as path from 'path';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const GRANDES: Record<string, { lineas: number; motivo: string }> = {
  'components/CodeEditor.vue': { lineas: 438, motivo: 'Editor CodeMirror coherente: edición, estado y comandos forman una sola herramienta.' },
  'components/docente/CurriculumBuilderModals.vue': { lineas: 429, motivo: 'Conjunto de ventanas de configuración; se separarán individualmente en H.5.' },
  'components/docente/LessonEditor.vue': { lineas: 336, motivo: 'Editor de lección con contenido y estado estrechamente relacionados.' },
  'components/docente/SelectorAsignatura.vue': { lineas: 324, motivo: 'Selector y búsqueda del catálogo forman una única interacción.' },
  'components/docente/UnitLessonsModal.vue': { lineas: 385, motivo: 'Ventana de lecciones con selección y edición de su contenido.' },
  'components/docente/exercise-builders/HtmlCssExerciseBuilder.vue': { lineas: 645, motivo: 'Pendiente de separar editor, vista previa y formulario en H.5.' },
  'components/exercise/HtmlCssExercise.vue': { lineas: 331, motivo: 'Renderizado interactivo de un solo tipo de ejercicio.' },
  'components/layout/SidebarNav.vue': { lineas: 335, motivo: 'Navegación y estado responsive forman una única barra lateral.' },
  'components/perfil/Form.vue': { lineas: 362, motivo: 'Formulario de perfil; en H.5 se revisarán secciones separables.' },
  'components/proyectos/EditorDiagrama.vue': { lineas: 791, motivo: 'Excluido por instrucción: el lienzo y su estado van juntos; ya se dividió.' },
  'components/tutor/TutorChatDrawer.vue': { lineas: 572, motivo: 'Pendiente de separar estado del chat y lista de mensajes en H.5.' },
  'pages/admin/dashboard.vue': { lineas: 393, motivo: 'Pendiente de compartir el estado de sistema con admin/sistema.vue en H.5.' },
  'pages/admin/sistema.vue': { lineas: 394, motivo: 'Pendiente de compartir el estado de sistema con admin/dashboard.vue en H.5.' },
  'pages/auth/register.vue': { lineas: 423, motivo: 'Pendiente de extraer los pasos del registro en H.5.' },
  'pages/docente/contenidos.vue': { lineas: 407, motivo: 'Organiza la clase, los estados y los modales; el árbol curricular se separó en ArbolContenidos.vue.' },
  'pages/docente/index.vue': { lineas: 387, motivo: 'Excluido por instrucción: archivo en trabajo de Antigravity.' },
  'pages/docente/rendimiento.vue': { lineas: 364, motivo: 'Pendiente de revisar la separación de sus secciones en H.5.' },
  'pages/docente/clase/[classId]/ajustes.vue': { lineas: 695, motivo: 'Excluido por instrucción: archivo en trabajo de Antigravity.' },
  'pages/docente/ejercicios/crear.vue': { lineas: 411, motivo: 'Pendiente de separar selector, formulario y configuración por tipo en H.5.' },
  'pages/estudiante/index.vue': { lineas: 462, motivo: 'Pendiente de extraer las tarjetas del inicio en H.5.' },
  'pages/estudiante/evaluacion/[activityId].vue': { lineas: 528, motivo: 'Pendiente de revisar los componentes por tipo de ejercicio en H.5.' },
  'pages/estudiante/unidad/[id].vue': { lineas: 392, motivo: 'Pendiente de separar bloques de la lección en H.5.' },
};

function archivosVue(dir: string): string[] {
  let todos: string[] = [];
  let entradas: string[] = [];
  try { entradas = readdirSync(dir); } catch { return []; }
  for (const entrada of entradas) {
    const archivo = path.join(dir, entrada);
    if (statSync(archivo).isDirectory()) todos = todos.concat(archivosVue(archivo));
    else if (entrada.endsWith('.vue')) todos.push(archivo);
  }
  return todos;
}

const grandesActuales = ['components', 'pages']
  .flatMap((carpeta) => archivosVue(path.join(raiz, carpeta)))
  .map((archivo) => ({
    ruta: path.relative(raiz, archivo).replace(/\\/g, '/'),
    lineas: readFileSync(archivo, 'utf8').split(/\r?\n/).length - 1,
  }))
  .filter(({ lineas }) => lineas > 300);

describe('PAT-04: componentes y páginas grandes revisados', () => {
  it('no aparece un archivo Vue nuevo por encima de 300 líneas', () => {
    expect(grandesActuales.filter(({ ruta }) => !(ruta in GRANDES)).map(({ ruta }) => ruta)).toEqual([]);
  });

  it('los archivos del mapa no crecen por encima del tamaño registrado', () => {
    expect(grandesActuales.filter(({ ruta, lineas }) => ruta in GRANDES && lineas > GRANDES[ruta].lineas)).toEqual([]);
  });

  it('todo archivo que permanece grande tiene un motivo documentado', () => {
    expect(Object.entries(GRANDES).filter(([, valor]) => !valor.motivo.trim()).map(([ruta]) => ruta)).toEqual([]);
  });
});
