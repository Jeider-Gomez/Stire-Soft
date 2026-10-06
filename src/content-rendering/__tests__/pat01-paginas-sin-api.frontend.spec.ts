import { readdirSync, readFileSync, statSync } from 'fs';
import * as path from 'path';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const PAGINAS_CON_API: string[] = [];

const COMPONENTES_CON_API = [
  'components/admin/HistorialRoles.vue',
  'components/EncuestaSus.vue',
  'components/InvitacionEncuesta.vue',
  'components/docente/CurriculumBuilderModals.vue',
  'components/docente/EntregaForm.vue',
  'components/estudiante/ResumenLogros.vue',
  'components/ValorarLeccion.vue',
  'components/estudiante/MisLogros.vue',
  'components/estudiante/MiCalibracion.vue',
  'components/layout/SidebarNav.vue',
  'components/layout/NotificationBell.vue',
  'components/estudiante/LogrosInicio.vue',
  'components/perfil/Vinculos.vue',
  'components/docente/MapaDeCalor.vue',
  'components/estudiante/ComoAvanzas.vue',
  'components/perfil/Form.vue',
  'components/MiNota.vue',
  'components/docente/LessonEditor.vue',
  'components/EstadisticasEstudiante.vue',
  'components/docente/TutorSettingsPanel.vue',
  'components/layout/BotonSugerencias.vue',
  'components/proyectos/EnviarAlDocente.vue',
  'components/docente/ValoracionesClase.vue',
  'components/docente/SelectorAsignatura.vue',
  'components/docente/ResourceForm.vue',
  'components/docente/UnitLessonsModal.vue',
  'components/docente/contenidos/VentanaArchivar.vue',
  'components/docente/contenidos/VentanaEliminar.vue',
  'components/docente/VentanaEliminarClase.vue',
];

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

function rutasVue(carpeta: 'pages' | 'components'): string[] {
  return archivosVue(path.join(raiz, carpeta)).map((archivo) => path.relative(raiz, archivo).replace(/\\/g, '/'));
}

describe('PAT-01: páginas sin llamadas directas a la API', () => {
  it('ninguna página ajena a la lista empieza a usar useApi() o $fetch(', () => {
    const encontradas = rutasVue('pages').filter((ruta) => /\buseApi\s*\(|\$fetch\s*\(/.test(readFileSync(path.join(raiz, ruta), 'utf8')));
    expect(encontradas.filter((ruta) => !PAGINAS_CON_API.includes(ruta))).toEqual([]);
  });

  it('cada página pendiente de la lista todavía usa useApi()', () => {
    expect(PAGINAS_CON_API.filter((ruta) => !/\buseApi\s*\(/.test(readFileSync(path.join(raiz, ruta), 'utf8')))).toEqual([]);
  });

  it('H4.1 comparte las consultas de clases y secciones entre las pantallas docentes', () => {
    const entregas = readFileSync(path.join(raiz, 'pages/docente/entregas/index.vue'), 'utf8');
    const refuerzos = readFileSync(path.join(raiz, 'pages/docente/refuerzos/index.vue'), 'utf8');
    const nuevoRefuerzo = readFileSync(path.join(raiz, 'pages/docente/refuerzos/nuevo.vue'), 'utf8');
    const rendimiento = readFileSync(path.join(raiz, 'pages/docente/rendimiento.vue'), 'utf8');
    const crearEjercicio = readFileSync(path.join(raiz, 'composables/useCrearEjercicio.ts'), 'utf8');
    const compartido = readFileSync(path.join(raiz, 'composables/useMisClases.ts'), 'utf8');

    expect(compartido).toContain("'/class/my-classes'");
    expect(compartido).toContain('`/sections/class/${classId}`');
    for (const pagina of [entregas, refuerzos, nuevoRefuerzo, rendimiento, crearEjercicio]) {
      expect(pagina).toContain('misClases');
      expect(pagina).not.toContain("'/class/my-classes'");
    }
    expect(entregas).toContain('seccionesClase');
    expect(nuevoRefuerzo).toContain('seccionesClase');
    expect(entregas).not.toContain('`/sections/class/${claseId.value}`');
    expect(nuevoRefuerzo).not.toContain('`/sections/class/${claseId.value}`');
    expect(crearEjercicio).toContain('seccionesClase');
    expect(crearEjercicio).not.toContain('`/sections/class/${classId}`');
  });

  it('H4.2 la página de la unidad delega sus consultas y acciones al composable del estudiante', () => {
    const pagina = readFileSync(path.join(raiz, 'pages/estudiante/unidad/[id].vue'), 'utf8');
    const composable = readFileSync(path.join(raiz, 'composables/useUnidadEstudiante.ts'), 'utf8');
    expect(pagina).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    expect(pagina).toContain('useUnidadEstudiante()');
    for (const ruta of ['/learning-unit/${unitId}', '/content/unit/${unitId}', '/activities?learningUnitId=${unitId}', '/entregas/mias?classId=${classId}', '/learning-progress/student/${studentId}/unit/${unitId}/next-activity', '/learning-progress/unit/${unitId}/confidence']) {
      expect(composable).toContain(ruta);
    }
  });

  it('H4.2 el inicio del estudiante delega solicitudes, recomendaciones, refuerzos y entregas', () => {
    const pagina = readFileSync(path.join(raiz, 'pages/estudiante/index.vue'), 'utf8');
    const composable = readFileSync(path.join(raiz, 'composables/useInicioEstudiante.ts'), 'utf8');
    expect(pagina).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    expect(pagina).toContain('useInicioEstudiante()');
    for (const ruta of ['/role-requests/me', '/learning-progress/student/${studentId}/unit/${unitId}/next-activity', '/refuerzos/mios', '/entregas/mias?classId=${classId}']) {
      expect(composable).toContain(ruta);
    }
  });

  it('H4.2 las páginas pequeñas del estudiante delegan sus llamadas a composables de dominio', () => {
    const paginas = [
      'pages/estudiante/entregas/[id].vue', 'pages/estudiante/proyectos/index.vue',
      'pages/estudiante/proyectos/[id].vue', 'pages/estudiante/asistencia.vue',
      'pages/estudiante/refuerzos/[id].vue', 'pages/estudiante/clases.vue',
    ];
    for (const ruta of paginas) {
      expect(readFileSync(path.join(raiz, ruta), 'utf8')).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    }
    const entregas = readFileSync(path.join(raiz, 'composables/useEntregasEstudiante.ts'), 'utf8');
    const proyectos = readFileSync(path.join(raiz, 'composables/useProyectos.ts'), 'utf8');
    const asistencia = readFileSync(path.join(raiz, 'composables/useAsistenciaEstudiante.ts'), 'utf8');
    const refuerzos = readFileSync(path.join(raiz, 'composables/useRefuerzosEstudiante.ts'), 'utf8');
    const clases = readFileSync(path.join(raiz, 'composables/useClasesEstudiante.ts'), 'utf8');
    expect(entregas).toContain('/entregas/${id}/enviar');
    expect(entregas).toContain('/proyecto-envios/${id}');
    expect(proyectos).toContain("'/proyectos/estado'");
    expect(proyectos).toContain('/proyectos/${id}');
    expect(asistencia).toContain('/asistencia/mi-codigo?dispositivo=${dispositivo}');
    expect(asistencia).toContain("'/asistencia/mia'");
    expect(refuerzos).toContain('/refuerzos/${id}/pasos/${indice}/hecho');
    expect(clases).toContain("'/enrollment/my'");
    expect(clases).toContain("'/enrollment/join'");
  });

  it('H4.3 el panel Hoy delega la carga paralela y la resolución de solicitudes', () => {
    const pagina = readFileSync(path.join(raiz, 'pages/docente/clase/[classId]/index.vue'), 'utf8');
    const composable = readFileSync(path.join(raiz, 'composables/useResumenClase.ts'), 'utf8');
    expect(pagina).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del|apiFetch)\(/);
    expect(pagina).toContain('Promise.allSettled');
    expect(composable).toContain('/analytics/class/${classId}/semana');
    expect(composable).toContain('/enrollment/${id}/${accion}');
  });

  it('H4.3 las páginas del docente delegan lecturas y acciones de entregas', () => {
    const rutas = ['pages/docente/entregas/index.vue', 'pages/docente/entregas/[id].vue', 'pages/docente/entregas/revision/[envioId].vue'];
    for (const ruta of rutas) expect(readFileSync(path.join(raiz, ruta), 'utf8')).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    const composable = readFileSync(path.join(raiz, 'composables/useEntregasDocente.ts'), 'utf8');
    for (const ruta of ['/entregas/clase/${classId}', '/entregas/${id}/detalle', '/entregas/${id}/reabrir', '/proyecto-envios/${id}/revision']) expect(composable).toContain(ruta);
  });

  it('H4.3 las páginas de refuerzos docentes delegan consultas y cambios', () => {
    for (const ruta of ['pages/docente/refuerzos/index.vue', 'pages/docente/refuerzos/nuevo.vue']) {
      expect(readFileSync(path.join(raiz, ruta), 'utf8')).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    }
    const composable = readFileSync(path.join(raiz, 'composables/useRefuerzosDocente.ts'), 'utf8');
    for (const ruta of ['/refuerzos/clase/${classId}', '/refuerzos/${id}/archivar', '/enrollment/class/${classId}', "'/refuerzos'"]) expect(composable).toContain(ruta);
  });

  it('H4.3 la asistencia de clase delega sesiones, marcas, escaneo y resumen', () => {
    const pagina = readFileSync(path.join(raiz, 'pages/docente/clase/[classId]/asistencia.vue'), 'utf8');
    const composable = readFileSync(path.join(raiz, 'composables/useAsistenciaClase.ts'), 'utf8');
    expect(pagina).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    for (const ruta of ['/asistencia/clase/${classId}/sesiones', '/asistencia/sesiones/${sesionId}/escanear', '/asistencia/clase/${classId}/resumen']) expect(composable).toContain(ruta);
  });

  it('H4.3 las páginas de rendimiento docente delegan las métricas por clase y estudiante', () => {
    for (const ruta of ['pages/docente/rendimiento.vue', 'pages/docente/estudiante/[studentId].vue']) {
      expect(readFileSync(path.join(raiz, ruta), 'utf8')).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    }
    const composable = readFileSync(path.join(raiz, 'composables/useRendimiento.ts'), 'utf8');
    expect(composable).toContain('/analytics/class/${classId}');
    expect(composable).toContain('/analytics/student/${studentId}');
  });

  it('H4.4 las cinco páginas admin delegan estado, catálogo, sugerencias y resultados SUS', () => {
    const rutas = ['pages/admin/sistema.vue', 'pages/admin/dashboard.vue', 'pages/admin/catalogo.vue', 'pages/admin/sugerencias.vue', 'pages/admin/usabilidad.vue'];
    for (const ruta of rutas) expect(readFileSync(path.join(raiz, ruta), 'utf8')).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del|apiFetch)\(/);
    const sistema = readFileSync(path.join(raiz, 'composables/useAdminSistema.ts'), 'utf8');
    const catalogo = readFileSync(path.join(raiz, 'composables/useCatalogoAsignaturas.ts'), 'utf8');
    const sugerencias = readFileSync(path.join(raiz, 'composables/useSugerencias.ts'), 'utf8');
    const sus = readFileSync(path.join(raiz, 'composables/useResultadosSus.ts'), 'utf8');
    expect(sistema).toContain("'/admin/system/status'");
    expect(sistema).toContain('/admin/system/logs?level=${level}&limit=100');
    expect(catalogo).toContain("'/asignaturas/revision'");
    expect(sugerencias).toContain('/reportes/${id}/captura');
    expect(sus).toContain("'/usabilidad/sus/resultados'");
  });

  it('H4.5 las páginas de cuenta delegan solicitudes públicas sin exponer el transporte', () => {
    const rutas = ['pages/auth/register.vue', 'pages/auth/forgot-password.vue', 'pages/auth/reset-password.vue'];
    for (const ruta of rutas) expect(readFileSync(path.join(raiz, ruta), 'utf8')).not.toMatch(/\buseApi\s*\(|api\.(get|post|patch|put|del)\(/);
    const cuenta = readFileSync(path.join(raiz, 'composables/useCuentaPublica.ts'), 'utf8');
    for (const ruta of ["'/tutor/api-key'", "'/auth/forgot-password'", "'/auth/reset-password'"]) expect(cuenta).toContain(ruta);
  });

  it('los componentes solo usan useApi() en la lista inicial, cuyo tamaño solo puede bajar', () => {
    const encontrados = rutasVue('components').filter((ruta) => /\buseApi\s*\(/.test(readFileSync(path.join(raiz, ruta), 'utf8')));
    expect(encontrados.filter((ruta) => !COMPONENTES_CON_API.includes(ruta))).toEqual([]);
    expect(encontrados.length).toBeLessThanOrEqual(COMPONENTES_CON_API.length);
  });
});
