/**
 * Un estudiante nuevo con un perfil al azar recorre el curso como en la app (pedido de Jeider, 20/11): se registra, se
 * une a la clase, abre cada lección y hace el ejercicio que STIRE le recomienda (con las competencias en «recomendar»,
 * por la competencia que más le cuesta), hasta terminar la lección o quedarse sin intentos. Al final muestra lo que
 * STIRE sabe de él: sus competencias, su calendario de repasos y cómo crecerían los repasos en un semestre con SM-2.
 *
 * Todo pasa por la API, como un estudiante real; nada se escribe en la base. Úsalo solo contra un servidor de pruebas.
 *
 *   STIRE_API=http://localhost:3001 npx ts-node -r tsconfig-paths/register scripts/cursos/simular-al-azar.ts \
 *     [--semilla 1234] [--clase ALGO-203413] [--lecciones 6]
 */
import { Api, requerida } from './api';
import { cursoFundamentos203413 } from '../../src/seeds/cursos/fundamentos-203413';
import { Estudiante, PASSWORD_PRUEBAS, Perfil } from './personas';
import { ActividadVista, SeccionVista, azar, ejercicioDelCurso, resolver } from './simulacion';
import { calculateNextReview, calidadDeRepaso, EstadoRepaso } from '../../src/common/utils/spaced-repetition';

const arg = (nombre: string): string | undefined => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const entre = (r: () => number, min: number, max: number) => Math.round((min + r() * (max - min)) * 100) / 100;

/** Un perfil creíble al azar: acierta menos en lo difícil, mejora al reintentar y a veces prueba antes de entregar. */
function perfilAlAzar(r: () => number, lecciones: number): Perfil & { confianza?: 1 | 2 | 3 } {
  const basico = entre(r, 0.35, 0.95);
  const intermedio = Math.round(basico * entre(r, 0.5, 0.9) * 100) / 100;
  const avanzado = Math.round(intermedio * entre(r, 0.4, 0.85) * 100) / 100;
  const c = Math.floor(r() * 4);
  return {
    primerIntento: { basico, intermedio, avanzado },
    mejoraPorIntento: entre(r, 0.1, 0.4),
    pruebaAntes: entre(r, 0.2, 0.95),
    unidades: { 'ALGO-203413': lecciones },
    ...(c > 0 ? { confianza: c as 1 | 2 | 3 } : {}),
  };
}

interface Siguiente { activityId: number; title: string; allCompleted: boolean; reason: string; reasonMessage: string; level: string }
interface Competencias { modo: string; competencias: Array<{ nombre: string; logrados: number; posibles: number; nivel: number; estado: string }>; practicar: { nombre: string; ejercicio: { title: string } | null } | null }
interface Repaso { learningUnitId: number; learningUnitTitle?: string | null; nextReviewDate: string; intervalDays: number; easeFactor: number; daysUntil?: number }

async function main(): Promise<void> {
  const base = requerida('STIRE_API');
  const semilla = arg('semilla') ?? String(Date.now() % 100000);
  const codigo = arg('clase') ?? 'ALGO-203413';
  const lecciones = Number(arg('lecciones') ?? 6);
  const r = azar(`al-azar|${semilla}`);
  const perfil = perfilAlAzar(r, lecciones);
  const est: Estudiante = {
    nombre: `Estudiante al azar ${semilla}`,
    email: `simulacion.azar.${semilla}@example.com`,
    descripcion: 'Perfil generado al azar',
    perfil,
  };

  console.log(`\n=== ${est.nombre} (semilla ${semilla}) ===`);
  console.log(`Acierta al primer intento: básico ${perfil.primerIntento.basico}, intermedio ${perfil.primerIntento.intermedio}, avanzado ${perfil.primerIntento.avanzado}`);
  console.log(`Mejora por intento ${perfil.mejoraPorIntento} · prueba antes de entregar ${perfil.pruebaAntes} · dice sentirse ${['(no responde)', 'nuevo', 'con dudas', 'seguro'][perfil.confianza ?? 0]}`);

  const api = new Api(base);
  try {
    await api.post('/auth/register', { email: est.email, password: PASSWORD_PRUEBAS, fullName: est.nombre, confirmaMayorDeEdad: true, aceptaTerminos: true });
  } catch (e) {
    if (!/409|existe|registrad/i.test((e as Error).message)) throw e;
  }
  const yo = await api.login(est.email, PASSWORD_PRUEBAS);
  let inscritas = await api.get<Array<{ class?: { id: number; code: string } }>>('/enrollment/my');
  if (!inscritas.some((i) => i.class?.code === codigo)) {
    await api.post('/enrollment/join', { code: codigo });
    inscritas = await api.get('/enrollment/my');
  }
  const clase = inscritas.find((i) => i.class?.code === codigo)?.class;
  if (!clase) throw new Error(`No quedó en la clase ${codigo} (si pide aprobación, apruébalo como docente y repite).`);

  const secciones = await api.get<SeccionVista[]>(`/sections/class/${clase.id}`);
  const unidades = secciones.flatMap((s) => (s.topics ?? []).flatMap((t) => t.learningUnits ?? [])).slice(0, lecciones);
  let entregas = 0;
  for (const u of unidades) {
    console.log(`\n▸ ${u.title}`);
    await api.get(`/learning-unit/${u.id}`);
    if (perfil.confianza) await api.put(`/learning-progress/unit/${u.id}/confidence`, { confianza: perfil.confianza });
    await api.get(`/content/unit/${u.id}`);
    const hechos = new Set<number>();
    for (let paso = 0; paso < 8; paso++) {
      const s = await api.get<Siguiente | null>(`/learning-progress/student/${yo.id}/unit/${u.id}/next-activity`);
      if (!s || hechos.has(s.activityId) || s.reason === 'pausa' || (s.allCompleted && paso > 0)) {
        if (s?.reasonMessage) console.log(`    STIRE: ${s.reasonMessage}`);
        break;
      }
      hechos.add(s.activityId);
      const e = ejercicioDelCurso(cursoFundamentos203413, u.title, s.title);
      if (!e) { console.log(`    (${s.title}: no es del curso sembrado, se salta)`); break; }
      const detalle = await api.get<ActividadVista>(`/activities/${s.activityId}`);
      const bitacora = await resolver(api, est, { ...detalle, id: s.activityId, title: s.title }, e);
      entregas += bitacora.split('→').length;
      console.log(`    ${s.level} · ${s.title}: ${bitacora}`);
      console.log(`      por qué: ${s.reasonMessage}`);
    }
  }

  const comp = await api.get<Competencias>(`/analytics/student/${yo.id}/competencias?classId=${clase.id}`);
  console.log(`\n=== Competencias (modo «${comp.modo}») tras ${entregas} entregas ===`);
  for (const c of comp.competencias.filter((x) => x.posibles > 0)) {
    console.log(`  ${c.nombre.padEnd(32)} ${String(c.logrados).padStart(2)}/${String(c.posibles).padEnd(2)}  nivel ${Math.round(c.nivel * 100)} %  ${c.estado}`);
  }
  if (comp.practicar) console.log(`  Elegido para ti: «${comp.practicar.nombre}» → ${comp.practicar.ejercicio?.title ?? '(sin ejercicio libre)'}`);

  const repasos = await api.get<Repaso[] | { data: Repaso[] }>('/review-schedules/due');
  const lista = Array.isArray(repasos) ? repasos : repasos.data;
  console.log(`\n=== Calendario de repasos (${lista.length} lecciones) ===`);
  for (const x of lista) {
    console.log(`  ${(x.learningUnitTitle ?? `lección ${x.learningUnitId}`).padEnd(36)} vuelve el ${x.nextReviewDate.slice(0, 10)} · intervalo ${x.intervalDays} d · facilidad ${x.easeFactor}`);
  }

  // Cómo crecería un repaso en un semestre (16 semanas), si repasa cada vez que vence, con su probabilidad de acertar.
  console.log('\n=== Proyección de un semestre con SM-2 (si repasa el día que vence) ===');
  for (const nivel of ['basico', 'intermedio'] as const) {
    let estado: EstadoRepaso = { repetitions: 0, intervalDays: 1, easeFactor: 2.5 };
    let dia = 0;
    const linea: string[] = [];
    while (dia <= 112) {
      const p = Math.min(0.95, perfil.primerIntento[nivel] + 0.1 * estado.repetitions);
      const aprobado = r() < p;
      const calidad = calidadDeRepaso({ aprobado, primerIntento: true, seSentiaSeguro: perfil.confianza === 3 });
      estado = calculateNextReview(estado, calidad);
      linea.push(`día ${dia}: ${aprobado ? '✓' : '✗'}→${estado.intervalDays} d`);
      dia += estado.intervalDays;
    }
    console.log(`  ${nivel}: ${linea.join(' · ')}  (${linea.length} repasos)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
