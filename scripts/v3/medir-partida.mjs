// Mide el punto de partida de la v3 (Fase A) y sirve igual para medir al final (Fase G) y comparar:
//   · tiempos de carga de 4 rutas por rol: primera visita (sin caché) y con caché en computador, y primera visita en
//     un celular con conexión lenta (3G rápida, CPU 4× más lenta) — P59;
//   · problemas de accesibilidad que encuentra axe (WCAG 2.1 A y AA) en cada ruta.
//
// Se corre contra el frontend de producción (`npx nuxi generate` + `npx nuxi preview`), no contra `nuxt dev`, que es
// mucho más lento y no representa lo que ve la gente. Las claves NO van en el repositorio: se pasan por variables.
//
//   MED_BASE=http://localhost:3000 \
//   MED_ESTUDIANTE=estudiante1.demo@stire.local MED_DOCENTE=docente.demo@stire.local MED_CLAVE_DEMO=... \
//   MED_ADMIN=... MED_CLAVE_ADMIN=... \
//   MED_PLAYWRIGHT=<ruta a playwright-core> MED_CHROMIUM=<ruta a chrome.exe> MED_AXE=<ruta a axe-core/axe.min.js> \
//   MED_SERVIR=frontend-nuxt/.output/public \
//   node scripts/v3/medir-partida.mjs docs/v3/medicion/partida.json
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const req = createRequire(import.meta.url);
const { chromium } = req(process.env.MED_PLAYWRIGHT || 'playwright-core');
const AXE = fs.readFileSync(process.env.MED_AXE || req.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.MED_BASE || 'http://localhost:3000';
const SALIDA = process.argv[2] || 'medicion.json';

export const RUTAS = {
  estudiante: ['/estudiante', '/estudiante/unidad/1', '/estudiante/repasos', '/estudiante/progreso'],
  docente: ['/docente', '/docente/clase/1', '/docente/entregas', '/docente/contenidos'],
  admin: ['/admin', '/admin/dashboard', '/admin/catalogo', '/admin/sistema'], // /admin es Usuarios
};
const CUENTAS = {
  estudiante: [process.env.MED_ESTUDIANTE, process.env.MED_CLAVE_DEMO],
  docente: [process.env.MED_DOCENTE, process.env.MED_CLAVE_DEMO],
  admin: [process.env.MED_ADMIN, process.env.MED_CLAVE_ADMIN],
};
// Perfil «3G rápida» de las herramientas de Chrome y un celular de gama media.
const LENTA = { offline: false, latency: 563, downloadThroughput: (1.6 * 1024 * 1024) / 8 * 0.9, uploadThroughput: (750 * 1024) / 8 * 0.9 };
const CELULAR = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

async function entrar(navegador, rol) {
  const [correo, clave] = CUENTAS[rol];
  if (!correo || !clave) throw new Error(`Falta la cuenta de ${rol} (variables MED_*)`);
  const ctx = await navegador.newContext();
  const p = await ctx.newPage();
  await p.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
  await p.fill('#email', correo);
  await p.fill('#password', clave);
  await Promise.all([p.waitForURL((u) => !u.pathname.startsWith('/auth'), { timeout: 30000 }), p.click('button[type="submit"]')]);
  // Las cuentas de prueba que nunca aceptaron las condiciones las aceptan una vez; si no, toda ruta lleva ahí.
  if (new URL(p.url()).pathname === '/aceptar-terminos') {
    await p.check('#acepta-condiciones');
    await Promise.all([p.waitForURL((u) => u.pathname !== '/aceptar-terminos', { timeout: 30000 }), p.click('form button[type="submit"]')]);
  }
  const estado = await ctx.storageState();
  await ctx.close();
  return estado;
}

/** Abre la ruta y espera a que no haya red; devuelve ms hasta ese punto y el LCP del navegador. */
async function cargar(p, ruta) {
  const t0 = Date.now();
  await p.goto(BASE + ruta, { waitUntil: 'networkidle', timeout: 120000 });
  const total = Date.now() - t0;
  const lcp = await p.evaluate(() => new Promise((ok) => {
    let ultimo = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) ultimo = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    setTimeout(() => ok(Math.round(ultimo)), 300);
  }));
  // Lo que bajó la página: KB transferidos (comprimidos) y cuántos pedidos; separa el JavaScript del resto.
  const red = await p.evaluate(() => {
    const todo = [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')];
    const kb = (l) => Math.round(l.reduce((s, e) => s + (e.transferSize || 0), 0) / 1024);
    return { kb: kb(todo), kbJs: kb(todo.filter((e) => /\.js(\?|$)/.test(e.name))), pedidos: todo.length };
  });
  return { total, lcp, ...red, url: new URL(p.url()).pathname };
}

async function axe(p) {
  // El recorrido guiado aparece a los 1,5 s y tarda 0,4 s en entrar: se espera a que esté quieto para revisarlo también.
  await p.waitForTimeout(2500);
  await p.addScriptTag({ content: AXE });
  const r = await p.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return res.violations.map((v) => ({ id: v.id, impacto: v.impact, nodos: v.nodes.length, donde: v.nodes.slice(0, 3).map((n) => n.target.join(' ')), detalle: v.nodes[0]?.failureSummary?.slice(0, 200) }));
  });
  return r;
}

// MED_SERVIR=frontend-nuxt/.output/public sirve el frontend generado en el puerto de MED_BASE, con los archivos en memoria,
// comprimidos con gzip y con la vuelta a 200.html de una SPA (como Vercel). `npx serve` se cae con EMFILE en Windows.
let servidor;
if (process.env.MED_SERVIR) {
  const http = await import('node:http');
  const zlib = await import('node:zlib');
  const raizSpa = path.resolve(process.env.MED_SERVIR);
  const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain' };
  const memoria = new Map();
  const leerArchivo = (f) => {
    if (!memoria.has(f)) {
      const cuerpo = fs.readFileSync(f);
      const tipo = TIPOS[path.extname(f)] || 'application/octet-stream';
      memoria.set(f, { tipo, cuerpo, gz: /text|javascript|json|svg/.test(tipo) ? zlib.gzipSync(cuerpo) : null });
    }
    return memoria.get(f);
  };
  servidor = http.createServer((q, r) => {
    const ruta = decodeURIComponent(new URL(q.url, 'http://x').pathname);
    let f = path.join(raizSpa, ruta);
    if (!f.startsWith(raizSpa) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      const indice = path.join(f, 'index.html');
      f = f.startsWith(raizSpa) && fs.existsSync(indice) ? indice : path.join(raizSpa, '200.html');
    }
    const a = leerArchivo(f);
    const gz = a.gz && /gzip/.test(q.headers['accept-encoding'] || '');
    r.writeHead(200, { 'content-type': a.tipo, 'cache-control': ruta.startsWith('/_nuxt/') ? 'public, max-age=31536000, immutable' : 'no-cache', ...(gz ? { 'content-encoding': 'gzip' } : {}) });
    r.end(gz ? a.gz : a.cuerpo);
  });
  await new Promise((ok) => servidor.listen(Number(new URL(BASE).port), ok));
}

const navegador = await chromium.launch(process.env.MED_CHROMIUM ? { executablePath: process.env.MED_CHROMIUM } : {});
const resultado = { fecha: new Date().toISOString(), base: BASE, rutas: [] };
for (const rol of Object.keys(RUTAS)) {
  const estado = await entrar(navegador, rol);
  for (const ruta of RUTAS[rol]) {
    // Computador: primera visita (contexto nuevo, caché vacía) y luego con caché.
    const ctx = await navegador.newContext({ storageState: estado, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const fria = await cargar(p, ruta);
    const caliente = await cargar(p, ruta);
    const problemas = await axe(p);
    await ctx.close();
    // Celular con conexión lenta, primera visita.
    const cc = await navegador.newContext({ ...CELULAR, storageState: estado });
    const pc = await cc.newPage();
    const cdp = await cc.newCDPSession(pc);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', LENTA);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const celular = await cargar(pc, ruta);
    await cc.close();
    if (caliente.url !== ruta) throw new Error(`${ruta} terminó en ${caliente.url}: la medición no sería de esa pantalla`);
    const fila = { rol, ruta, llego: caliente.url, fria, caliente, celular, axe: problemas };
    resultado.rutas.push(fila);
    console.log(`${rol.padEnd(10)} ${ruta.padEnd(24)} fría ${fria.total} ms · caché ${caliente.total} ms · celular lento ${celular.total} ms (${celular.kb} KB, JS ${celular.kbJs} KB, ${celular.pedidos} pedidos) · axe ${problemas.reduce((s, v) => s + v.nodos, 0)} (${problemas.length} reglas)`);
  }
}
await navegador.close();
servidor?.close();
fs.mkdirSync(path.dirname(path.resolve(SALIDA)), { recursive: true });
fs.writeFileSync(SALIDA, JSON.stringify(resultado, null, 2));
console.log(`Guardado en ${SALIDA}`);
