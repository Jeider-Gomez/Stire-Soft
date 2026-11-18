// Prueba de estrés de STIRE (pedido del profesor Toscano, 20/10). Paso 2: la batería de casos.
//
// Cada usuario virtual es un estudiante que hace una sesión real, con pausas de persona (1 a 3 s) entre pasos:
//   1. Entrar (POST /auth/login)            5. El siguiente ejercicio de la lección
//   2. Su perfil y sus clases               6. Sus competencias
//   3. El contenido de la clase             7. Responder opción múltiple (empezar y entregar)
//   4. Su tablero de avance                 8. Programar: empezar, probar el código 2 veces y entregar
// Las etapas suben la cantidad de estudiantes a la vez (por defecto 10, 30, 60 y 100). Cada uno llega con su propia IP
// (X-Forwarded-For), como en producción detrás del proxy; el servidor local debe arrancar con TRUST_PROXY=1.
//
//   node scripts/estres/bateria.mjs --etapas 10,30,60,100 --segundos 45
//
// Solo apunta a localhost salvo que se pase --permitir-remoto (no se le hace estrés al servidor real sin decidirlo).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const arg = (n, def) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const BASE = arg('api', 'http://localhost:3001');
const ETAPAS = arg('etapas', '10,30,60,100').split(',').map(Number);
const SEGUNDOS = Number(arg('segundos', '45'));
const SALIDA = arg('salida', join(aqui, '..', '..', 'docs', 'calidad', 'estres'));
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE) && !process.argv.includes('--permitir-remoto')) {
  console.error(`No se hace estrés a ${BASE} sin --permitir-remoto.`);
  process.exit(1);
}
const cfg = JSON.parse(readFileSync(join(aqui, 'config.local.json'), 'utf8'));

// Azar con semilla: la misma corrida se repite igual.
let semilla = 20261118;
const azar = () => ((semilla = (semilla * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const pensar = () => pausa(1000 + azar() * 2000);

/** Mediciones por caso: tiempo de cada pedido y si salió bien. */
const medidas = new Map();
function anotar(caso, ms, ok, estado) {
  const m = medidas.get(caso) ?? { tiempos: [], errores: 0, estados: {} };
  m.tiempos.push(ms);
  if (!ok) m.errores++;
  m.estados[estado] = (m.estados[estado] ?? 0) + 1;
  medidas.set(caso, m);
}

async function pedir(caso, u, metodo, ruta, cuerpo) {
  const t0 = performance.now();
  let estado = 'red';
  let datos = null;
  try {
    const r = await fetch(BASE + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': u.ip, ...(u.token ? { Authorization: `Bearer ${u.token}` } : {}) },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
    estado = r.status;
    datos = await r.json().catch(() => null);
  } catch (e) {
    estado = e.name === 'TimeoutError' ? 'tiempo' : 'red';
  }
  anotar(caso, performance.now() - t0, typeof estado === 'number' && estado < 400, estado);
  return { estado, datos };
}

async function sesion(u, hasta) {
  const login = await pedir('1. Entrar', u, 'POST', '/auth/login', { email: u.email, password: cfg.clave });
  u.token = login.datos?.access_token ?? login.datos?.token;
  u.id = login.datos?.user?.id;
  if (!u.token) return;
  let vuelta = 0;
  while (Date.now() < hasta) {
    await pedir('2. Perfil', u, 'GET', '/auth/profile');
    await pedir('2. Mis clases', u, 'GET', '/enrollment/my');
    await pensar();
    await pedir('3. Contenido de la clase', u, 'GET', `/sections/class/${cfg.clase}`);
    await pedir('4. Tablero de avance', u, 'GET', `/analytics/student/${u.id}`);
    await pensar();
    const m = cfg.mcq[(u.n + vuelta) % cfg.mcq.length];
    await pedir('5. Siguiente ejercicio', u, 'GET', `/learning-progress/student/${u.id}/unit/${m.unidad}/next-activity`);
    await pedir('6. Competencias', u, 'GET', `/analytics/student/${u.id}/competencias?classId=${cfg.clase}`);
    await pensar();
    const e1 = await pedir('7. Empezar opción múltiple', u, 'POST', '/submissions/start', { activityId: m.id });
    if (e1.datos?.id) {
      await pensar();
      await pedir('7. Entregar opción múltiple', u, 'POST', `/submissions/${e1.datos.id}/submit`, { answers: [{ questionId: m.qid, answer: m.respuesta }] });
    }
    if (Date.now() >= hasta) break;
    const p = cfg.programar[(u.n + vuelta) % cfg.programar.length];
    const e2 = await pedir('8. Empezar programar', u, 'POST', '/submissions/start', { activityId: p.id });
    if (e2.datos?.id) {
      await pensar();
      await pedir('8. Probar código', u, 'POST', `/submissions/${e2.datos.id}/run`, { code: p.codigo });
      await pensar();
      await pedir('8. Probar código', u, 'POST', `/submissions/${e2.datos.id}/run`, { code: p.codigo });
      await pedir('8. Entregar programar', u, 'POST', `/submissions/${e2.datos.id}/submit`, { answers: [{ questionId: p.qid, answer: { code: p.codigo } }] });
    }
    vuelta++;
    await pensar();
  }
}

const percentil = (xs, p) => {
  if (!xs.length) return 0;
  const o = [...xs].sort((a, b) => a - b);
  return o[Math.min(o.length - 1, Math.ceil((p / 100) * o.length) - 1)];
};

const resultados = [];
for (const n of ETAPAS) {
  medidas.clear();
  const usuarios = cfg.estudiantes.slice(0, n).map((email, i) => ({ email, n: i, ip: `10.20.${Math.floor(i / 250)}.${(i % 250) + 1}` }));
  if (usuarios.length < n) console.warn(`Solo hay ${usuarios.length} estudiantes preparados para la etapa de ${n}.`);
  const inicio = Date.now();
  const hasta = inicio + SEGUNDOS * 1000;
  // Llegan escalonados en los primeros 5 s, como una clase que entra.
  await Promise.all(usuarios.map(async (u, i) => { await pausa((i / usuarios.length) * 5000); await sesion(u, hasta); }));
  const duracion = (Date.now() - inicio) / 1000;
  const casos = [...medidas.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([caso, m]) => ({
    caso, pedidos: m.tiempos.length, errores: m.errores, estados: m.estados,
    p50: Math.round(percentil(m.tiempos, 50)), p95: Math.round(percentil(m.tiempos, 95)), max: Math.round(Math.max(...m.tiempos)),
  }));
  const total = casos.reduce((s, c) => s + c.pedidos, 0);
  const errores = casos.reduce((s, c) => s + c.errores, 0);
  const todos = [...medidas.values()].flatMap((m) => m.tiempos);
  const etapa = { usuarios: usuarios.length, segundos: Math.round(duracion), pedidos: total, porSegundo: +(total / duracion).toFixed(1), errores, tasaError: +((errores / Math.max(total, 1)) * 100).toFixed(2), p50: Math.round(percentil(todos, 50)), p95: Math.round(percentil(todos, 95)), casos };
  resultados.push(etapa);
  console.log(`${usuarios.length} estudiantes: ${total} pedidos (${etapa.porSegundo}/s), p50 ${etapa.p50} ms, p95 ${etapa.p95} ms, errores ${errores} (${etapa.tasaError} %)`);
  await pausa(5000);
}

mkdirSync(SALIDA, { recursive: true });
const fecha = new Date().toISOString().slice(0, 10);
writeFileSync(join(SALIDA, `resultados-${fecha}.json`), JSON.stringify({ fecha, api: BASE, segundosPorEtapa: SEGUNDOS, etapas: resultados }, null, 1));
console.log(`Resultados en ${join(SALIDA, `resultados-${fecha}.json`)}`);
