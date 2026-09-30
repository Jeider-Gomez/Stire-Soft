/**
 * Paso 5 de la práctica adaptativa (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.5 y §4): el segundo salón de Laura.
 *   1. Laura crea «Fundamentos de Algoritmia — grupo 2» y trae TODO el contenido de ALGO-203413 con «Traer de otra
 *      clase» (llega en borrador) y publica las secciones, como lo haría desde la pantalla.
 *   2. Cuatro estudiantes se registran y se unen con el código.
 *   3. En cada unidad responden «¿Cómo te sientes con este tema?» según su perfil (o la saltan) y siguen lo que
 *      recomienda «Continuar», no el orden de la lista. Se imprime el motivo de cada recomendación.
 * Todo por la API, con las mismas peticiones que la aplicación. Si algo ya existe, se reutiliza.
 *
 * Uso:
 *   STIRE_API=... npx ts-node -r tsconfig-paths/register scripts/cursos/segundo-salon.ts
 */
import { Api, requerida } from './api';
import { cursoFundamentos203413 } from '../../src/seeds/cursos/fundamentos-203413';
import { DOCENTE, ESTUDIANTES_GRUPO_2, Estudiante, GRUPO_2, PASSWORD_PRUEBAS } from './personas';
import { ActividadVista, ejercicioDelCurso, resolver } from './simulacion';

interface Clase { id: number; code: string; name: string }
interface Seccion { id: number; isPublished?: boolean; topics?: Array<{ learningUnits?: Array<{ id: number; title: string }> }> }
interface Recomendacion { activityId: number; title: string; allCompleted: boolean; level?: string; reason?: string; reasonMessage?: string }

/** Tope de ejercicios por unidad: el recomendador nunca debería llevar a más, pero un bucle no puede quedar abierto. */
const MAX_POR_UNIDAD = 12;

async function prepararSalon(base: string): Promise<Clase> {
  const laura = new Api(base);
  await laura.login(DOCENTE.email, PASSWORD_PRUEBAS);
  const mias = await laura.get<Clase[]>('/class/my-classes');
  const origen = mias.find((c) => c.code === GRUPO_2.origen);
  if (!origen) throw new Error(`Laura no tiene la clase ${GRUPO_2.origen}.`);

  let salon = mias.find((c) => c.code === GRUPO_2.codigo);
  if (salon) {
    console.log(`El salón ${GRUPO_2.codigo} ya existe (id ${salon.id}).`);
  } else {
    salon = await laura.post<Clase>('/class', {
      name: GRUPO_2.nombre,
      description: 'Segundo grupo de Fundamentos de Algoritmia, con el mismo contenido que ALGO-203413.',
      code: GRUPO_2.codigo,
    });
    console.log(`Laura creó «${salon.name}» (${salon.code}), id ${salon.id}.`);
  }

  let secciones = await laura.get<Seccion[]>(`/sections/class/${salon.id}`);
  if (secciones.length === 0) {
    const resumen = await laura.post<Record<string, number>>(`/reuse/classes/${salon.id}/import`, { sourceClassId: origen.id });
    console.log(`Traído de ${GRUPO_2.origen}:`, JSON.stringify(resumen));
    secciones = await laura.get<Seccion[]>(`/sections/class/${salon.id}`);
  }
  for (const s of secciones.filter((x) => !x.isPublished)) await laura.patch(`/sections/${s.id}/publish`);
  console.log(`${secciones.length} secciones publicadas.`);
  return salon;
}

async function cuenta(base: string, est: Estudiante): Promise<Api> {
  const api = new Api(base);
  try {
    await api.login(est.email, PASSWORD_PRUEBAS);
  } catch {
    await api.post('/auth/register', { email: est.email, password: PASSWORD_PRUEBAS, fullName: est.nombre });
    await api.login(est.email, PASSWORD_PRUEBAS);
    console.log(`Estudiante registrado: ${est.nombre} <${est.email}>`);
  }
  return api;
}

async function estudiar(base: string, salon: Clase, est: Estudiante): Promise<void> {
  const api = await cuenta(base, est);
  const yo = await api.get<{ user?: { id: number } }>('/auth/profile');
  const miId = yo.user?.id;
  if (!miId) throw new Error(`No se pudo leer el perfil de ${est.nombre}.`);
  const inscritas = await api.get<Array<{ class?: { code: string } }>>('/enrollment/my');
  if (!inscritas.some((i) => i.class?.code === salon.code)) {
    await api.post('/enrollment/join', { code: salon.code });
    console.log(`${est.nombre} se unió a ${salon.code}.`);
  }

  const confianza = est.perfil.confianza;
  console.log(`\n${est.nombre} — ${est.descripcion} Confianza: ${confianza ?? 'no responde'}.`);
  const secciones = await api.get<Seccion[]>(`/sections/class/${salon.id}`);
  const limite = est.perfil.unidades[GRUPO_2.codigo] ?? 0;
  const unidades = secciones.flatMap((s) => (s.topics ?? []).flatMap((t) => t.learningUnits ?? [])).slice(0, limite);

  for (const u of unidades) {
    await api.get(`/learning-unit/${u.id}`);
    await api.get(`/content/unit/${u.id}`);
    if (confianza) await api.put(`/learning-progress/unit/${u.id}/confidence`, { confianza });
    console.log(`  ${u.title}`);
    const hechas = new Set<number>();
    for (let paso = 0; paso < MAX_POR_UNIDAD; paso++) {
      const rec = await api.get<Recomendacion | null>(`/learning-progress/student/${miId}/unit/${u.id}/next-activity`);
      if (!rec || rec.allCompleted) {
        console.log('    ✔ unidad completa según el recomendador');
        break;
      }
      const detalle = await api.get<ActividadVista>(`/activities/${rec.activityId}`);
      const e = ejercicioDelCurso(cursoFundamentos203413, u.title, detalle.title);
      const sinIntentos = (detalle.attemptsUsed ?? 0) >= (detalle.attemptsAllowed ?? 3);
      if (!e || sinIntentos || hechas.has(rec.activityId)) {
        console.log(`    · recomienda «${rec.title}» (${rec.reason ?? '—'}), pero ${!e ? 'no es de este curso' : 'ya lo trabajó'}: sigue a la otra unidad`);
        break;
      }
      hechas.add(rec.activityId);
      const bitacora = await resolver(api, est, { ...detalle, id: rec.activityId }, e);
      console.log(`    → «${rec.title}» [${e.dificultad}, ${e.tipo}] motivo: ${rec.reason ?? '—'} · ${bitacora}`);
    }
  }
}

async function main(): Promise<void> {
  const base = requerida('STIRE_API');
  const salon = await prepararSalon(base);
  for (const est of ESTUDIANTES_GRUPO_2) await estudiar(base, salon, est);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
