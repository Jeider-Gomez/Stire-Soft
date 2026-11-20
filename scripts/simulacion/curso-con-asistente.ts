/**
 * Un docente arma su curso con el Asistente (pedido de Jeider, 20/11): pide la estructura del curso, ejercicios de
 * opción múltiple y ejercicios de programar, con distintas versiones del pedido. El script mide la calidad de cada
 * borrador, sin juzgar el contenido a ojo. Lo que se puede contar sin un experto:
 *   - si el borrador llegó (o por qué no), y cuánto tardó;
 *   - estructura: módulos, temas y lecciones, cuántas de cada dificultad, títulos repetidos;
 *   - opción múltiple: que la respuesta correcta exista, opciones repetidas, a qué competencias de STIRE apunta cada
 *     pregunta (con el mismo etiquetado del curso) y la escalera de dificultad;
 *   - programación: cuántos ejercicios trae, cuántos casos, y que la solución propuesta corrió en el juez (el servidor
 *     ya lo exige y descarta los que no corren).
 * Lo pedagógico (si la explicación es buena) lo juzga una persona: el informe deja los borradores completos para eso.
 *
 * Necesita una clave gratuita de Google AI Studio en la variable STIRE_CLAVE_GOOGLE (nunca en el repositorio) y un
 * servidor local de pruebas. Cada borrador gasta un pedido de la capa gratuita; el script espera entre pedidos para no
 * pasar el límite del Asistente (8 por minuto) ni el de Google.
 *
 *   STIRE_API=http://localhost:3001 STIRE_CLAVE_GOOGLE=... npx ts-node -r tsconfig-paths/register \
 *     scripts/simulacion/curso-con-asistente.ts [--repeticiones 2]
 */
import { writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import { Api, esperar, requerida } from '../cursos/api';
import { competenciasDeActividad } from '../../src/common/utils/competencias';

const arg = (nombre: string, def: string) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const REPETICIONES = Number(arg('repeticiones', '2'));
const PAUSA_MS = 9000;
const DOCENTE = { email: 'docente.demo@stire.local', clave: 'Demo1234!' };

const CONTEXTO_BASE = { asignatura: 'Fundamentos de Algoritmia', clase: 'Grupo de prueba del Asistente' };

/** Las versiones del pedido: el mismo trabajo dicho de formas distintas, como lo diría un docente. */
const VERSIONES: Array<{ id: string; tipo: 'estructura' | 'ejercicios' | 'programacion'; contexto: Record<string, unknown>; pedido: string }> = [
  { id: 'estructura-sin-pedido', tipo: 'estructura', contexto: {}, pedido: '' },
  { id: 'estructura-novatos', tipo: 'estructura', contexto: {}, pedido: 'Para estudiantes de primer semestre que nunca han programado. 16 semanas.' },
  { id: 'estructura-corta', tipo: 'estructura', contexto: {}, pedido: 'Un curso corto de 6 semanas, solo lo esencial.' },
  { id: 'ejercicios-operadores', tipo: 'ejercicios', contexto: { leccion: 'Operadores y orden', cantidad: 4 }, pedido: '' },
  { id: 'ejercicios-operadores-escalera', tipo: 'ejercicios', contexto: { leccion: 'Operadores y orden', cantidad: 4 }, pedido: 'En escalera: de básico a avanzado, con el error más común como distractor.' },
  { id: 'ejercicios-entrada', tipo: 'ejercicios', contexto: { leccion: 'Leer los datos que entran', cantidad: 4 }, pedido: 'Con ejemplos de la vida diaria en Montería.' },
  { id: 'programacion-condicionales', tipo: 'programacion', contexto: { leccion: 'Decidir con if y else', cantidad: 2 }, pedido: '' },
  { id: 'programacion-condicionales-basico', tipo: 'programacion', contexto: { leccion: 'Decidir con if y else', cantidad: 2 }, pedido: 'Muy básicos, para quien escribe su primer if.' },
];

type Resultado = { version: string; repeticion: number; ms: number; ok: boolean; error?: string; medidas?: Record<string, unknown>; borrador?: unknown };

function medirEstructura(b: { modulos: Array<{ titulo: string; temas: Array<{ titulo: string; lecciones: Array<{ titulo: string; dificultad: string }> }> }> }) {
  const lecciones = b.modulos.flatMap((m) => m.temas.flatMap((t) => t.lecciones));
  const titulos = lecciones.map((l) => l.titulo.trim().toLowerCase());
  const porDificultad: Record<string, number> = {};
  for (const l of lecciones) porDificultad[l.dificultad] = (porDificultad[l.dificultad] ?? 0) + 1;
  return {
    modulos: b.modulos.length,
    temas: b.modulos.reduce((n, m) => n + m.temas.length, 0),
    lecciones: lecciones.length,
    porDificultad,
    titulosRepetidos: titulos.length - new Set(titulos).size,
  };
}

function medirEjercicios(b: { ejercicios: Array<{ enunciado: string; opciones: string[]; correcta: number; dificultad: string }> }, leccion: string) {
  const porDificultad: Record<string, number> = {};
  const competencias: Record<string, number> = {};
  let correctaFuera = 0;
  let opcionesRepetidas = 0;
  let sinCompetencia = 0;
  b.ejercicios.forEach((e, i) => {
    porDificultad[e.dificultad] = (porDificultad[e.dificultad] ?? 0) + 1;
    if (!(e.correcta >= 0 && e.correcta < e.opciones.length)) correctaFuera++;
    if (new Set(e.opciones.map((o) => o.trim().toLowerCase())).size < e.opciones.length) opcionesRepetidas++;
    const comps = competenciasDeActividad({ id: i, leccion, questionType: 'multiple_choice', codigo: [e.enunciado, ...e.opciones].join('\n') });
    if (!comps.length) sinCompetencia++;
    for (const c of comps) competencias[c] = (competencias[c] ?? 0) + 1;
  });
  // ¿Va de lo fácil a lo difícil? (recomendación 1 de Toscano)
  const orden = { basico: 0, intermedio: 1, avanzado: 2 } as Record<string, number>;
  const niveles = b.ejercicios.map((e) => orden[e.dificultad] ?? 0);
  const enEscalera = niveles.every((n, i) => i === 0 || n >= niveles[i - 1]);
  return { ejercicios: b.ejercicios.length, porDificultad, enEscalera, correctaFuera, opcionesRepetidas, sinCompetencia, competencias };
}

function medirProgramacion(b: { ejercicios: Array<{ casos?: unknown[] } & Record<string, unknown>> }) {
  return {
    ejercicios: b.ejercicios.length,
    casosPorEjercicio: b.ejercicios.map((e) => (Array.isArray(e.casos) ? e.casos.length : 0)),
  };
}

async function main(): Promise<void> {
  const base = requerida('STIRE_API');
  const claveGoogle = requerida('STIRE_CLAVE_GOOGLE');
  const api = new Api(base);
  await api.login(DOCENTE.email, DOCENTE.clave);
  await api.put('/asistente/api-key', { apiKey: claveGoogle });
  console.log(`Clave guardada para el docente de prueba. ${VERSIONES.length} versiones × ${REPETICIONES} repeticiones.`);

  const resultados: Resultado[] = [];
  for (let rep = 1; rep <= REPETICIONES; rep++) {
    for (const v of VERSIONES) {
      const inicio = Date.now();
      try {
        const r = await api.post<{ borrador: Record<string, unknown> }>('/asistente/borrador', {
          tipo: v.tipo,
          contexto: { ...CONTEXTO_BASE, ...v.contexto },
          ...(v.pedido ? { pedido: v.pedido } : {}),
        });
        const b = r.borrador as never;
        const medidas =
          v.tipo === 'estructura' ? medirEstructura(b) : v.tipo === 'ejercicios' ? medirEjercicios(b, String(v.contexto.leccion)) : medirProgramacion(b);
        resultados.push({ version: v.id, repeticion: rep, ms: Date.now() - inicio, ok: true, medidas, borrador: r.borrador });
        console.log(`  ✓ ${v.id} (${rep}) ${Math.round((Date.now() - inicio) / 100) / 10} s ${JSON.stringify(medidas)}`);
      } catch (e) {
        resultados.push({ version: v.id, repeticion: rep, ms: Date.now() - inicio, ok: false, error: (e as Error).message.slice(0, 300) });
        console.log(`  ✗ ${v.id} (${rep}): ${(e as Error).message.slice(0, 160)}`);
      }
      await esperar(PAUSA_MS);
    }
  }

  // La clave no se queda guardada en la base de pruebas.
  await api.delete('/asistente/api-key').catch(() => undefined);

  const dir = path.join(__dirname, '..', '..', 'docs', 'calidad', 'simulacion');
  mkdirSync(dir, { recursive: true });
  const archivo = path.join(dir, `asistente-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(archivo, JSON.stringify({ fecha: new Date().toISOString(), repeticiones: REPETICIONES, resultados }, null, 2));
  const ok = resultados.filter((r) => r.ok).length;
  console.log(`\n${ok} de ${resultados.length} borradores llegaron. Guardado en ${archivo}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
