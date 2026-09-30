/**
 * Lo que comparten los simuladores de estudiantes (simular-estudiantes.ts y segundo-salon.ts): resolver un ejercicio
 * con las mismas peticiones que la aplicación, de forma reproducible.
 */
import { Api, esperar } from './api';
import { Estudiante } from './personas';
import { Curso, Ejercicio, respuestaConError, respuestaCorrecta } from '../../src/seeds/cursos/tipos';

export interface SeccionVista { topics?: Array<{ learningUnits?: Array<{ id: number; title: string }> }> }
export interface ActividadVista { id: number; title: string; attemptsAllowed: number; attemptsUsed?: number }
export interface Entrega { status: string; totalScore?: number; maxScore?: number; passed?: boolean | null }

/** Generador pseudoaleatorio con semilla (mulberry32): la simulación es reproducible. */
export function azar(semilla: string): () => number {
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

export function ejercicioDelCurso(curso: Curso, unidad: string, titulo: string): Ejercicio | undefined {
  for (const s of curso.secciones)
    for (const t of s.temas)
      for (const u of t.unidades) if (u.titulo === unidad) return u.ejercicios.find((e) => e.titulo === titulo);
  return undefined;
}

export async function esperarCalificacion(api: Api, id: string): Promise<Entrega> {
  for (let i = 0; i < 30; i++) {
    const r = await api.get<Entrega>(`/submissions/${id}`);
    if (r.status === 'graded') return r;
    await esperar(1000);
  }
  throw new Error(`La entrega ${id} no se calificó a tiempo.`);
}

export async function resolver(api: Api, est: Estudiante, act: ActividadVista, e: Ejercicio): Promise<string> {
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
