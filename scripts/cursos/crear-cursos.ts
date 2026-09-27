/**
 * Crea los cursos pedagógicos en una instalación de STIRE, como lo haría un docente desde la aplicación:
 * inicia sesión con su cuenta y usa las mismas peticiones que las pantallas «Mis clases», «Contenidos»,
 * el editor de lecciones y el asistente «Crear ejercicio». Nada se escribe directo en la base de datos.
 *
 * Uso:
 *   STIRE_API=http://localhost:3001 DOCENTE_EMAIL=... DOCENTE_PASSWORD=... \
 *     npx ts-node -r tsconfig-paths/register scripts/cursos/crear-cursos.ts [fundamentos|pensamiento] [--actualizar]
 *
 * Si una corrida anterior quedó a medias, se retoma: lo que ya existe (por título) no se duplica.
 */
import { Api, requerida } from './api';
import { cursoFundamentos203413 } from '../../src/seeds/cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../../src/seeds/cursos/pensamiento-algoritmico';
import { aConfig, Curso, Ejercicio } from '../../src/seeds/cursos/tipos';

/** Con --actualizar, lo que ya existe recibe el texto vigente de las lecciones y los enunciados (como cuando el docente los edita). */
const ACTUALIZAR = process.argv.includes('--actualizar');

const CURSOS: Record<string, Curso> = {
  fundamentos: cursoFundamentos203413,
  pensamiento: cursoPensamientoAlgoritmico,
};

interface Clase { id: number; code: string; name: string }
interface TipoActividad { id: number; code: string }

/** «Taller de Código» para programar y HTML/CSS; «Práctica Formativa» para el resto (catálogo de la app). */
async function tiposDeActividad(api: Api): Promise<(e: Ejercicio) => number | undefined> {
  const res = await api.get<TipoActividad[] | { data?: TipoActividad[] }>('/activity-types');
  const lista = Array.isArray(res) ? res : res?.data ?? [];
  const practica = (lista.find((t) => t.code === 'AUTO-EVAL') ?? lista[0])?.id;
  const taller = lista.find((t) => t.code === 'TALLER')?.id ?? practica;
  return (e) => (e.tipo === 'coding' || e.tipo === 'html_css' ? taller : practica);
}

interface Actividad { id: number; title: string; status?: string }
interface UnidadVista { id: number; title: string }
interface TemaVista { id: number; title: string; learningUnits?: UnidadVista[] }
interface SeccionVista { id: number; title: string; isPublished: boolean; topics?: TemaVista[] }

async function crearEjercicio(api: Api, unidadId: number, e: Ejercicio, activityTypeId: number | undefined, previas: Actividad[]): Promise<boolean> {
  const puntos = e.puntos ?? 20;
  let act = previas.find((a) => a.title === e.titulo);
  if (!act) {
    act = await api.post<Actividad>('/activities', {
      learningUnitId: unidadId,
      activityTypeId,
      title: e.titulo,
      description: e.enunciado,
      difficulty: e.dificultad,
      totalPoints: puntos,
      passingScore: 60,
      attemptsAllowed: e.intentos ?? (e.tipo === 'coding' || e.tipo === 'html_css' ? 5 : 3),
      isRequired: true,
      adaptiveWeight: 0.4,
    });
  } else if (ACTUALIZAR) {
    await api.patch(`/activities/${act.id}`, { description: e.enunciado });
  }
  const preguntas = await api.get<unknown[]>(`/activity-questions/activity/${act.id}`);
  if (preguntas.length === 0) {
    await api.post('/activity-questions', { activityId: act.id, type: e.tipo, question: e.enunciado, points: puntos, order: 0, config: aConfig(e) });
  }
  if (act.status !== 'published') await api.patch(`/activities/${act.id}/publish`);
  return !previas.some((a) => a.title === e.titulo);
}

/** Busca por título lo que ya exista (una corrida anterior interrumpida) y crea solo lo que falta. */
async function crearCurso(api: Api, curso: Curso): Promise<void> {
  const mias = await api.get<Clase[]>('/class/my-classes');
  let clase = mias.find((c) => c.code === curso.codigo);
  if (clase) {
    console.log(`La clase ${curso.codigo} ya existe (id ${clase.id}): se completa lo que falte.`);
  } else {
    clase = await api.post<Clase>('/class', { name: curso.nombre, description: curso.descripcion, code: curso.codigo });
    console.log(`Clase «${clase.name}» (${clase.code}) creada, id ${clase.id}.`);
  }
  const tipoPara = await tiposDeActividad(api);
  const existentes = await api.get<SeccionVista[]>(`/sections/class/${clase.id}`);

  let nuevos = 0;
  for (const [i, s] of curso.secciones.entries()) {
    const previa = existentes.find((x) => x.title === s.titulo);
    const seccion = previa ?? (await api.post<SeccionVista>('/sections', { classId: clase.id, title: s.titulo, description: s.descripcion, order: i + 1 }));
    for (const [j, t] of s.temas.entries()) {
      const temaPrevio = previa?.topics?.find((x) => x.title === t.titulo);
      const tema = temaPrevio ?? (await api.post<TemaVista>('/topic', { sectionId: seccion.id, title: t.titulo, description: t.descripcion, order: j + 1 }));
      for (const [k, u] of t.unidades.entries()) {
        const unidadPrevia = temaPrevio?.learningUnits?.find((x) => x.title === u.titulo);
        const unidad = unidadPrevia ?? (await api.post<UnidadVista>('/learning-unit', {
          topicId: tema.id,
          title: u.titulo,
          description: u.descripcion,
          difficulty: u.dificultad,
          order: k + 1,
        }));
        const lecciones = unidadPrevia ? await api.get<Array<{ id: number; title: string }>>(`/content/unit/${unidad.id}/all`) : [];
        const leccion = lecciones.find((l) => l.title === u.leccion.titulo);
        if (leccion && ACTUALIZAR) {
          await api.patch(`/content/${leccion.id}`, { title: u.leccion.titulo, body: u.leccion.cuerpo, order: 1 });
        } else if (!leccion) {
          await api.post('/content', { learningUnitId: unidad.id, title: u.leccion.titulo, type: 'markdown', body: u.leccion.cuerpo, order: 1, isVisible: true });
        }
        const res = unidadPrevia ? await api.get<{ data?: Actividad[] } | Actividad[]>(`/activities?learningUnitId=${unidad.id}`) : [];
        const previas = Array.isArray(res) ? res : res.data ?? [];
        let creados = 0;
        for (const e of u.ejercicios) if (await crearEjercicio(api, unidad.id, e, tipoPara(e), previas)) creados++;
        nuevos += creados;
        console.log(`  · ${s.titulo} › ${t.titulo} › ${u.titulo}: ${creados} ejercicios nuevos de ${u.ejercicios.length}`);
      }
    }
    // Se publica al final, cuando la sección ya está completa, como haría un docente.
    if (!previa?.isPublished) await api.patch(`/sections/${seccion.id}/publish`);
  }
  console.log(`Listo: ${curso.codigo} completo (${nuevos} ejercicios nuevos en esta corrida).`);
}

async function main(): Promise<void> {
  const api = new Api(requerida('STIRE_API'));
  const docente = await api.login(requerida('DOCENTE_EMAIL'), requerida('DOCENTE_PASSWORD'));
  if (docente.role !== 'docente') throw new Error(`La cuenta no es de docente (rol: ${docente.role}).`);
  const elegido = process.argv.slice(2).find((a) => !a.startsWith('--'));
  const cursos = elegido ? [CURSOS[elegido]] : Object.values(CURSOS);
  if (cursos.some((c) => !c)) throw new Error(`Curso desconocido: ${elegido}. Usa: ${Object.keys(CURSOS).join(', ')}.`);
  for (const curso of cursos) await crearCurso(api, curso);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
