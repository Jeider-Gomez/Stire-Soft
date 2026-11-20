/**
 * Simulación de un docente y sus estudiantes, de punta a punta, por la API (pedido de Jeider, 20/11; insumo del artículo).
 *
 * 1. El docente crea dos clases iguales copiando su curso, como en «Nueva clase › Copiar una de mis clases».
 *    En la clase A las competencias recomiendan ejercicios; en la B solo informan (el recomendador va como siempre).
 * 2. Los mismos N estudiantes simulados (perfil al azar con semilla) entran a las dos clases y estudian las primeras L
 *    lecciones siguiendo el ejercicio que STIRE les recomienda.
 * 3. El docente mira cómo va cada clase por competencia.
 *
 * Modelo del estudiante simulado («estudiante simulado» como método de evaluación: VanLehn, Ohlsson y Nason, 1994):
 * cada uno tiene una habilidad oculta por competencia (0 a 1). La probabilidad de acertar un ejercicio es la habilidad
 * media de sus competencias menos lo que pesa su dificultad, y cada intento la sube un poco (aprende practicando).
 * El simulador conoce esa habilidad y STIRE no: así se puede medir qué tan bien la estima la ecuación de Toscano.
 *
 * Solo contra un servidor local arrancado con TRUST_PROXY=1 (cada estudiante llega con su propia IP).
 *
 *   npx ts-node -r tsconfig-paths/register scripts/simulacion/docente-y-estudiantes.ts --estudiantes 15 --lecciones 6
 */
import { writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import { cursoFundamentos203413 } from '../../src/seeds/cursos/fundamentos-203413';
import { Ejercicio, respuestaConError, respuestaCorrecta } from '../../src/seeds/cursos/tipos';
import { competenciasDeActividad, COMPETENCIAS, type IdCompetencia } from '../../src/common/utils/competencias';
import { azar, ejercicioDelCurso } from '../cursos/simulacion';

const arg = (n: string, d: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const BASE = arg('api', 'http://localhost:3001');
const N = Number(arg('estudiantes', '15'));
const L = Number(arg('lecciones', '6'));
const SEMILLA = arg('semilla', '20261120');
const CLAVE = 'Simula123.';
const DOCENTE = { email: arg('docente', 'docente.demo@stire.local'), clave: arg('clave-docente', 'Demo1234!') };
const ORIGEN = Number(arg('origen', '2')); // clase del docente que se copia (Fundamentos de Algoritmia)
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error('Solo contra un servidor local.');

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

class Cliente {
  token = '';
  constructor(private readonly ip: string) {}
  async pedir<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
    for (let intento = 0; ; intento++) {
      await pausa(650);
      const r = await fetch(BASE + ruta, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': this.ip, ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}) },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      });
      const texto = await r.text();
      if (r.status === 429 && intento < 6) { await pausa(15_000); continue; }
      if (!r.ok) throw new Error(`${metodo} ${ruta} → ${r.status}: ${texto.slice(0, 300)}`);
      return (texto ? JSON.parse(texto) : null) as T;
    }
  }
  async entrar(email: string, clave: string) {
    const r = await this.pedir<{ access_token: string; user: { id: number } }>('POST', '/auth/login', { email, password: clave });
    this.token = r.access_token;
    return r.user;
  }
}

// ─── El estudiante simulado ───────────────────────────────────────────────────────────────────────────────────────────
interface Simulado { n: number; habilidad: Record<string, number>; aprende: number; descuido: number; confianza?: 1 | 2 | 3 }
const PESO_DIFICULTAD: Record<string, number> = { basico: 0, intermedio: 0.15, avanzado: 0.3 };

function crearSimulado(n: number): Simulado {
  const r = azar(`${SEMILLA}|perfil|${n}`);
  const base = 0.2 + r() * 0.6; // qué tan fuerte llega en general
  const habilidad: Record<string, number> = {};
  for (const c of COMPETENCIAS) habilidad[c.id] = Math.min(0.95, Math.max(0.05, base + (r() - 0.5) * 0.5));
  const c = Math.floor(r() * 4);
  return { n, habilidad, aprende: 0.05 + r() * 0.15, descuido: r() * 0.08, ...(c > 0 ? { confianza: c as 1 | 2 | 3 } : {}) };
}

function competenciasDe(e: Ejercicio, leccion: string): IdCompetencia[] {
  const x = e as unknown as Record<string, unknown>;
  return competenciasDeActividad({ id: 0, leccion, questionType: e.tipo, codigo: [e.enunciado, String(x.inicial ?? ''), String(x.plantilla ?? '')].join('\n') });
}

function probabilidad(s: Simulado, comps: IdCompetencia[], dificultad: string): number {
  if (comps.length === 0) return 0.5;
  const media = comps.reduce((a, c) => a + s.habilidad[c], 0) / comps.length;
  return Math.min(0.97, Math.max(0.03, media - (PESO_DIFICULTAD[dificultad] ?? 0) - s.descuido));
}

/** Practicar enseña: cada intento acerca un poco la habilidad a 1 (más si acertó). */
function aprender(s: Simulado, comps: IdCompetencia[], acerto: boolean) {
  for (const c of comps) s.habilidad[c] = Math.min(0.97, s.habilidad[c] + s.aprende * (acerto ? 1 : 0.6) * (1 - s.habilidad[c]));
}

interface Medida {
  clase: 'A' | 'B'; n: number; entregas: number; aprobadas: number; fallidas: number; leccionesCompletas: number;
  sinIntentos: number; motivos: Record<string, number>;
  estimacion: Array<{ id: string; nivel: number; posibles: number; real: number }>;
  habilidadFinal: number;
}

async function estudiar(clase: 'A' | 'B', classId: number, codigo: string, perfil: Simulado): Promise<Medida> {
  const s: Simulado = { ...perfil, habilidad: { ...perfil.habilidad } };
  const r = azar(`${SEMILLA}|${clase}|${s.n}`);
  const api = new Cliente(`10.${clase === 'A' ? 1 : 2}.${Math.floor(s.n / 250)}.${(s.n % 250) + 1}`);
  const email = `simulacion.${SEMILLA}.${clase.toLowerCase()}${String(s.n).padStart(3, '0')}@example.com`;
  try {
    await api.pedir('POST', '/auth/register', { email, password: CLAVE, fullName: `Simulado ${clase}${s.n}`, confirmaMayorDeEdad: true, aceptaTerminos: true });
  } catch (e) {
    if (!/409/.test((e as Error).message)) throw e;
  }
  const yo = await api.entrar(email, CLAVE);
  const mias = await api.pedir<Array<{ class?: { id: number } }>>('GET', '/enrollment/my');
  if (!mias.some((m) => m.class?.id === classId)) await api.pedir('POST', '/enrollment/join', { code: codigo });

  const m: Medida = { clase, n: s.n, entregas: 0, aprobadas: 0, fallidas: 0, leccionesCompletas: 0, sinIntentos: 0, motivos: {}, estimacion: [], habilidadFinal: 0 };
  const secciones = await api.pedir<Array<{ topics?: Array<{ learningUnits?: Array<{ id: number; title: string }> }> }>>('GET', `/sections/class/${classId}`);
  const unidades = secciones.flatMap((x) => (x.topics ?? []).flatMap((t) => t.learningUnits ?? [])).slice(0, L);

  for (const u of unidades) {
    await api.pedir('GET', `/content/unit/${u.id}`);
    if (s.confianza) await api.pedir('PUT', `/learning-progress/unit/${u.id}/confidence`, { confianza: s.confianza });
    const hechos = new Set<number>();
    for (let paso = 0; paso < 10; paso++) {
      const sig = await api.pedir<{ activityId: number; title: string; allCompleted: boolean; reason: string } | null>(
        'GET', `/learning-progress/student/${yo.id}/unit/${u.id}/next-activity`);
      if (process.env.SIM_DEPURAR) console.log('   ', clase + s.n, u.title, JSON.stringify(sig));
      if (!sig) break;
      if (sig.allCompleted && paso > 0) { m.leccionesCompletas++; break; }
      if (sig.reason === 'pausa' || hechos.has(sig.activityId)) { m.sinIntentos++; break; }
      hechos.add(sig.activityId);
      m.motivos[sig.reason] = (m.motivos[sig.reason] ?? 0) + 1;
      const e = ejercicioDelCurso(cursoFundamentos203413, u.title, sig.title);
      if (!e) { console.log(`    (${sig.title}: no está en el curso sembrado)`); break; }
      const comps = competenciasDe(e, u.title);
      const det = await api.pedir<{ attemptsAllowed?: number; attemptsUsed?: number }>('GET', `/activities/${sig.activityId}`);
      const preguntas = await api.pedir<Array<{ id: number }>>('GET', `/activity-questions/activity/${sig.activityId}`);
      for (let i = (det.attemptsUsed ?? 0) + 1; i <= (det.attemptsAllowed ?? 3); i++) {
        const acierta = r() < probabilidad(s, comps, e.dificultad);
        const { id } = await api.pedir<{ id: string }>('POST', '/submissions/start', { activityId: sig.activityId });
        let res = await api.pedir<{ status: string; passed?: boolean | null }>('POST', `/submissions/${id}/submit`, {
          answers: [{ questionId: preguntas[0].id, answer: acierta ? respuestaCorrecta(e) : respuestaConError(e) }],
          timeSpentSeconds: Math.round(60 + r() * 300),
        });
        for (let k = 0; res.status !== 'graded' && k < 30; k++) { await pausa(1000); res = await api.pedir('GET', `/submissions/${id}`); }
        m.entregas++;
        aprender(s, comps, !!res.passed);
        if (res.passed) { m.aprobadas++; break; }
        m.fallidas++;
      }
    }
  }

  const comp = await api.pedir<{ competencias: Array<{ id: string; nivel: number; posibles: number }> }>(
    'GET', `/analytics/student/${yo.id}/competencias?classId=${classId}`);
  m.estimacion = comp.competencias.filter((c) => c.posibles > 0).map((c) => ({ id: c.id, nivel: c.nivel, posibles: c.posibles, real: s.habilidad[c.id] }));
  const trabajadas = m.estimacion.map((x) => x.real);
  m.habilidadFinal = trabajadas.length ? trabajadas.reduce((a, b) => a + b, 0) / trabajadas.length : 0;
  console.log(`  ${clase}${s.n}: ${m.entregas} entregas, ${m.aprobadas} aprobadas, ${m.leccionesCompletas}/${L} lecciones`);
  return m;
}

// ─── Estadística simple ──────────────────────────────────────────────────────────────────────────────────────────────
const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const de = (xs: number[]) => Math.sqrt(media(xs.map((x) => (x - media(xs)) ** 2)));
function pearson(xs: number[], ys: number[]) {
  const mx = media(xs), my = media(ys);
  const num = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  return num / Math.sqrt(xs.reduce((a, x) => a + (x - mx) ** 2, 0) * ys.reduce((a, y) => a + (y - my) ** 2, 0));
}

async function main() {
  const t0 = Date.now();
  const docente = new Cliente('10.9.9.9');
  await docente.entrar(DOCENTE.email, DOCENTE.clave);
  console.log('El docente crea las dos clases copiando su curso…');
  const clases: Record<'A' | 'B', { id: number; code: string }> = {} as never;
  for (const [c, modo] of [['A', 'recomendar'], ['B', 'informar']] as const) {
    const code = `SIM-${SEMILLA.slice(-4)}-${c}`;
    const existentes = await docente.pedir<Array<{ id: number; code: string }>>('GET', '/class/my-classes');
    let clase = existentes.find((x) => x.code === code);
    if (!clase) {
      clase = await docente.pedir<{ id: number; code: string }>('POST', '/class', {
        name: `Simulación ${c} · competencias ${modo === 'recomendar' ? 'recomiendan' : 'solo informan'}`, code, requiresApproval: false, periodo: '2026-2',
      });
      await docente.pedir('POST', `/reuse/classes/${clase.id}/import`, { sourceClassId: ORIGEN });
    }
    // La copia queda en borrador: el docente publica sus módulos (en «Contenido») para que los estudiantes los vean.
    const modulos = await docente.pedir<Array<{ id: number; isPublished: boolean }>>('GET', `/sections/class/${clase.id}`);
    for (const mod of modulos.filter((x) => !x.isPublished)) await docente.pedir('PATCH', `/sections/${mod.id}/publish`, {});
    await docente.pedir('PATCH', `/analytics/class/${clase.id}/competencias/modo`, { modo });
    clases[c] = { id: clase.id, code: clase.code };
    console.log(`  Clase ${c} (${modo}): id ${clase.id}, código ${clase.code}`);
  }

  const perfiles = Array.from({ length: N }, (_, i) => crearSimulado(i + 1));
  console.log(`${N} estudiantes en cada clase, ${L} lecciones…`);
  const medidas = await Promise.all(
    (['A', 'B'] as const).flatMap((c) => perfiles.map((p, i) => pausa(i * 400).then(() => estudiar(c, clases[c].id, clases[c].code, p)))),
  );

  console.log('El docente mira sus clases…');
  const vista: Record<string, unknown> = {};
  for (const c of ['A', 'B'] as const) vista[c] = await docente.pedir('GET', `/analytics/class/${clases[c].id}/competencias`);

  // Resultados
  const de_ = (c: 'A' | 'B') => medidas.filter((m) => m.clase === c);
  const resumen = (['A', 'B'] as const).map((c) => {
    const g = de_(c);
    return {
      clase: c,
      entregas: [media(g.map((m) => m.entregas)), de(g.map((m) => m.entregas))],
      aprobadas: media(g.map((m) => m.aprobadas)),
      fallidas: media(g.map((m) => m.fallidas)),
      tasaAprobacion: media(g.map((m) => (m.entregas ? m.aprobadas / m.entregas : 0))),
      leccionesCompletas: media(g.map((m) => m.leccionesCompletas)),
      sinIntentos: media(g.map((m) => m.sinIntentos)),
      habilidadFinal: [media(g.map((m) => m.habilidadFinal)), de(g.map((m) => m.habilidadFinal))],
      motivos: g.reduce((acc, m) => { for (const [k, v] of Object.entries(m.motivos)) acc[k] = (acc[k] ?? 0) + v; return acc; }, {} as Record<string, number>),
    };
  });
  const pares = medidas.flatMap((m) => m.estimacion);
  const conPocos = pares.filter((p) => p.posibles <= 3), conMas = pares.filter((p) => p.posibles > 3);
  const validez = {
    pares: pares.length,
    r: pearson(pares.map((p) => p.nivel), pares.map((p) => p.real)),
    errorMedio: media(pares.map((p) => Math.abs(p.nivel - p.real))),
    pocos: { n: conPocos.length, error: media(conPocos.map((p) => Math.abs(p.nivel - p.real))) },
    mas: { n: conMas.length, error: media(conMas.map((p) => Math.abs(p.nivel - p.real))), r: conMas.length > 2 ? pearson(conMas.map((p) => p.nivel), conMas.map((p) => p.real)) : null },
  };
  const salida = { fecha: new Date().toISOString(), semilla: SEMILLA, estudiantes: N, lecciones: L, minutos: (Date.now() - t0) / 60000, clases, resumen, validez, vista, medidas };
  const dir = path.join(__dirname, '..', '..', 'docs', 'calidad', 'simulacion');
  mkdirSync(dir, { recursive: true });
  const archivo = path.join(dir, `resultados-${SEMILLA}.json`);
  writeFileSync(archivo, JSON.stringify(salida, null, 2));
  console.log(JSON.stringify({ resumen, validez }, null, 2));
  console.log(`Guardado en ${archivo}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
