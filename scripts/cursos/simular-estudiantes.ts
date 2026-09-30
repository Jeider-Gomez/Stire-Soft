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
import { Api, requerida } from './api';
import { cursoFundamentos203413 } from '../../src/seeds/cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../../src/seeds/cursos/pensamiento-algoritmico';
import { ESTUDIANTES, Estudiante, PASSWORD_PRUEBAS } from './personas';
import { Curso } from '../../src/seeds/cursos/tipos';
import { ActividadVista, SeccionVista, ejercicioDelCurso, resolver } from './simulacion';

const CURSOS: Curso[] = [cursoFundamentos203413, cursoPensamientoAlgoritmico];

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
      if (est.perfil.confianza) await api.put(`/learning-progress/unit/${u.id}/confidence`, { confianza: est.perfil.confianza });
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
