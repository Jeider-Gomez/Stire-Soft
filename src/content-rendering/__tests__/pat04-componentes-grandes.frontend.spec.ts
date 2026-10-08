import { readdirSync, readFileSync, statSync } from 'fs';
import * as path from 'path';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const GRANDES: Record<string, { lineas: number; motivo: string }> = {
  'components/CodeEditor.vue': { lineas: 438, motivo: 'Editor CodeMirror; edicion, estado y comandos forman una sola herramienta.' },
  'components/docente/LessonEditor.vue': { lineas: 336, motivo: 'Editor de una leccion; contenido y estado de edicion van juntos.' },
  'components/docente/SelectorAsignatura.vue': { lineas: 324, motivo: 'Seleccion y busqueda del catalogo forman una unica interaccion.' },
  'components/docente/ArbolContenidos.vue': { lineas: 401, motivo: 'Árbol de módulos, temas y lecciones con menú Más y bloques archivados; Fase 30 B3.' },
  'components/docente/UnitLessonsModal.vue': { lineas: 392, motivo: 'Gestiona las lecciones de una unidad en una sola ventana.' },
  'components/exercise/HtmlCssExercise.vue': { lineas: 331, motivo: 'Renderiza y gestiona la interaccion de un solo tipo de ejercicio.' },
  'components/layout/SidebarNav.vue': { lineas: 304, motivo: 'Navegacion por rol y comportamiento responsive de una unica barra lateral. 335 -> 304 el 07/10: las clases del docente salieron a ClasesDelMenu.vue.' },
  'components/perfil/Form.vue': { lineas: 362, motivo: 'Formulario de perfil con una unica accion de guardado y secciones de la misma cuenta.' },
  'components/proyectos/EditorDiagrama.vue': { lineas: 791, motivo: 'Excluido por instruccion; lienzo y estado grafico estrechamente acoplados.' },
  'components/tutor/TutorChatDrawer.vue': { lineas: 572, motivo: 'Interaccion de conversacion en un unico panel; mensajes, compositor y clave comparten el store.' },
  'pages/admin/dashboard.vue': { lineas: 394, motivo: 'Resumen del sistema; la carga de estado ya se comparte mediante useAdminSistema. +1 el 07/10: la tabla se desplaza con el teclado (WCAG 2.1.1).' },
  'pages/admin/sistema.vue': { lineas: 396, motivo: 'Gestion de estado, registros y limpieza; la carga de estado se comparte mediante useAdminSistema. +2 el 07/10: el registro se enfoca con el teclado (WCAG 2.1.1).' },
  'pages/auth/register.vue': { lineas: 423, motivo: 'Un unico flujo de registro en dos pasos; validacion y envio comparten el mismo formulario.' },
  'pages/docente/contenidos.vue': { lineas: 407, motivo: 'Coordina estados y acciones del arbol curricular; el arbol se extrae a ArbolContenidos.vue.' },
  'pages/docente/index.vue': { lineas: 426, motivo: 'Inicio docente con tarjetas de clase y sección de clases archivadas; Fase 30 B4.' },
  'pages/docente/rendimiento.vue': { lineas: 364, motivo: 'Panel de analitica del rendimiento; filtros y metricas describen una misma vista.' },
  'pages/docente/ejercicios/crear.vue': { lineas: 411, motivo: 'Orquesta el alta de ejercicio y delega configuracion especifica a constructores por tipo.' },
  'pages/estudiante/index.vue': { lineas: 392, motivo: 'Dashboard del aprendizaje del estudiante; el aviso de solicitud de rol se separo a AvisoSolicitudRol.vue. 415 -> 392 el 08/10: el avance del curso y del dominio salieron a TuAvance.vue.' },
  'pages/estudiante/evaluacion/[activityId].vue': { lineas: 411, motivo: 'Orquesta una evaluacion y selecciona los componentes existentes segun el tipo de actividad. +3 el 07/10: el nombre del ejercicio en el título de la página (WCAG 2.4.2). +6 el 07/10: plegar el enunciado (hallazgo de José, S08-E01); la franja y su memoria ya están fuera (FranjaPanelPlegado.vue, usePanelPlegable.ts). 537 -> 423 el 07/10: el resultado de la entrega salió a ResultadoEntrega.vue (y SinIntentos.vue). 411 el 08/10: la guía paso a paso (PasosCodigo.vue) entra y «Cómo se califica» sale a ComoSeCalifica.vue.' },
  'pages/estudiante/unidad/[id].vue': { lineas: 395, motivo: 'Orquesta la vista de una unidad; los bloques de contenido ya tienen componentes especializados. +3 el 07/10: el nombre de la lección en el título de la página (WCAG 2.4.2).' },
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
