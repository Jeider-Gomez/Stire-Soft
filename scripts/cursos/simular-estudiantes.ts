/**
 * Simula a los estudiantes resolviendo los cursos de verdad, con las mismas peticiones que la aplicación:
 * se unen a la clase con su código, abren cada unidad y su lección, abren el ejercicio, lo resuelven
 * (a veces con el error común de un principiante), usan «Probar» en los de programar y entregan. La app
 * califica cada entrega con su motor y su juez reales y actualiza el dominio y los repasos como con
 * cualquier estudiante. Nada se escribe directo en la base de datos.
 *
 * Es determinista: la misma persona y el mismo ejercicio producen siempre la misma secuencia de intentos.
 *
 * Uso:
 *   STIRE_API=... npx ts-node -r tsconfig-paths/register scripts/cursos/simular-estudiantes.ts
 */
import { Api, esperar, requerida } from './api';
import { cursoFundamentos203413 } from '../../src/seeds/cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../../src/seeds/cursos/pensamiento-algoritmico';
import { ESTUDIANTES, Estudiante, PASSWORD_PRUEBAS } from './personas';
import { Curso, Ejercicio, respuestaConError, respuestaCorrecta } from '../../src/seeds/cursos/tipos';

const CURSOS: Curso[] = [cursoFundamentos203413, cursoPensamientoAlgoritmico];

interface SeccionVista { topics?: Array<{ learningUnits?: Array<{ id: number; title: string }> }> }
interface ActividadVista { id: number; title: string; attemptsAllowed: number; attemptsUsed?: number }
interface Entrega { status: string; totalScore?: number; maxScore?: number; passed?: boolean | null }

/** Generador pseudoaleatorio con semilla (mulberry32): la simulación es reproducible. */
function azar(semilla: string): () => number {
  let h = 1779033703 ^ semilla.length;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ejercicioDelCurso(curso: Curso, unidad: string, titulo: string): Ejercicio | undefined {
  for (const s of curso.secciones)
    for (const t of s.temas)
      for (const u of t.unidades) if (u.titulo === unidad) return u.ejercicios.find((e) => e.titulo === titulo);
  return undefined;
}

async function esperarCalificacion(api: Api, id: string): Promise<Entrega> {
  for (let i = 0; i < 30; i++) {
    const r = await api.get<Entrega>(`/submissions/${id}`);
    if (r.status === 'graded') return r;
    await esperar(1000);
  }
  throw new Error(`La entrega ${id} no se calificó a tiempo.`);
}

async function resolver(api: Api, est: Estudiante, act: ActividadVista, e: Ejercicio): Promise<string> {
  await api.get(`/activities/${act.id}`);
  const preguntas = await api.get<Array<{ id: number }>>(`/activity-questions/activity/${act.id}`);
  const preguntaId = preguntas[0].id;
  const r = azar(`${est.email}|${act.title}`);
  const intentosPermitidos = act.attemptsAllowed ?? 3;
  const intentosUsados = act.attemptsUsed ?? 0;
  let p = est.perfil.primerIntento[e.dificultad];
  const bitacora: string[] = [];

  for (let intento = intentosUsados + 1; intento <= intentosPermitidos; intento++) {
    const acierta = r() < p;
    const respuesta = acierta ? respuestaCorrecta(e) : respuestaConError(e);
    const { id } = await api.post<{ id: string }>('/submissions/start', { activityId: act.id });
    if ((e.tipo === 'coding' || e.tipo === 'html_css') && r() < est.perfil.pruebaAntes) {
      await api.post(`/submissions/${id}/run`, e.tipo === 'coding' ? { code: respuesta.code } : respuesta);
    }
    let resultado = await api.post<Entrega>(`/submissions/${id}/submit`, {
      answers: [{ questionId: preguntaId, answer: respuesta }],
      timeSpentSeconds: Math.round(60 + r() * (e.tipo === 'coding' ? 900 : 240)),
    });
    if (resultado.status !== 'graded') resultado = await esperarCalificacion(api, id);
    bitacora.push(`${resultado.totalScore ?? 0}/${resultado.maxScore ?? '?'}`);
    if (resultado.passed) break;
    p = Math.min(0.95, p + est.perfil.mejoraPorIntento);
  }
  return bitacora.join(' → ');
}

async function estudiar(est: Estudiante, base: string): Promise<void> {
  const api = new Api(base);
  await api.login(est.email, PASSWORD_PRUEBAS);
  const inscritas = await api.get<Array<{ class?: { id: number; code: string } }>>('/enrollment/my');

  for (const curso of CURSOS) {
    const limite = est.perfil.unidades[curso.codigo] ?? 0;
    if (limite === 0) continue;
    let clase = inscritas.find((i) => i.class?.code === curso.codigo)?.class;
    if (!clase) {
      await api.post('/enrollment/join', { code: curso.codigo });
      const ahora = await api.get<Array<{ class?: { id: number; code: string } }>>('/enrollment/my');
      clase = ahora.find((i) => i.class?.code === curso.codigo)?.class;
      if (!clase) throw new Error(`${est.nombre} no quedó inscrito en ${curso.codigo}.`);
      console.log(`${est.nombre} se unió a ${curso.codigo}.`);
    }

    const secciones = await api.get<SeccionVista[]>(`/sections/class/${clase.id}`);
    const unidades = secciones.flatMap((s) => (s.topics ?? []).flatMap((t) => t.learningUnits ?? [])).slice(0, limite);
    for (const u of unidades) {
      await api.get(`/learning-unit/${u.id}`);
      await api.get(`/content/unit/${u.id}`); // lee la lección
      const res = await api.get<{ data: ActividadVista[] } | ActividadVista[]>(`/activities?learningUnitId=${u.id}`);
      const actividades = Array.isArray(res) ? res : res.data;
      for (const act of actividades) {
        const e = ejercicioDelCurso(curso, u.title, act.title);
        if (!e) continue; // un ejercicio que no es de estos cursos: no se toca
        const detalle = await api.get<ActividadVista>(`/activities/${act.id}`);
        if ((detalle.attemptsUsed ?? 0) > 0) continue; // ya lo trabajó en una corrida anterior
        const bitacora = await resolver(api, est, { ...act, ...detalle }, e);
        console.log(`  ${est.nombre} · ${u.title} › ${act.title}: ${bitacora}`);
      }
    }
  }
}

async function main(): Promise<void> {
  const base = requerida('STIRE_API');
  for (const est of ESTUDIANTES) await estudiar(est, base);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
