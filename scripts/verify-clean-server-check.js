'use strict';

/**
 * OLA 3 - PUNTO 1(d). Arranca dist/main.js, espera a que responda, hace un
 * login real, verifica un endpoint autenticado, apaga el servidor, y limpia
 * la base de datos de verificacion.
 *
 * Se invoca como proceso TOP-LEVEL propio, encadenado tras verify-clean.js
 * con `&&` a nivel de `package.json` (ver el script `verify:clean`) — NO
 * como un `spawn`/`spawnSync` lanzado DESDE verify-clean.js. Causa raiz
 * encontrada durante el cierre de Ola 3, reproducida de forma minima: en
 * este entorno Windows, despues de que un proceso Node ya ejecuto varios
 * `spawnSync` pesados (en particular `npm ci`), cualquier spawn posterior
 * en ESE MISMO proceso que a su vez genere un nieto con E/S real (este
 * mismo servidor HTTP) deja al nieto vivo pero sin abrir jamas su puerto ni
 * escribir una sola linea a stdout/stderr — probado exhaustivamente con
 * distintas combinaciones de `stdio`/`shell` sin exito. Arrancar este
 * script como hijo directo del shell (no de un proceso Node ya "usado")
 * evita el problema por completo, sea cual sea su causa exacta ultima.
 */

const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// A diferencia de verify-clean.js (que corre ANTES de `npm ci` y por eso
// parsea .env a mano), este proceso corre despues — `dotenv` ya esta
// disponible en node_modules.
require('dotenv').config({ path: path.join(ROOT, '.env') });

// Mismos defaults que verify-clean.js: los dos procesos son top-level
// separados (encadenados con `&&` en package.json, no uno hijo del otro),
// asi que no comparten `process.env` en memoria — si el shell no exporta
// VERIFY_DB_DATABASE/VERIFY_PORT explicitamente, ambos deben converger al
// mismo valor por defecto de forma independiente.
const VERIFY_DB = process.env.VERIFY_DB_DATABASE || 'stire_verify_clean';
const VERIFY_PORT = process.env.VERIFY_PORT || '3097';
const DEMO_EMAIL = 'docente.demo@stire.local';
const DEMO_PASSWORD = 'Demo1234!';
// 60 s por defecto. Tras `npm ci` los ~950 paquetes recien creados estan en frio (y, si el repo
// vive en una carpeta sincronizada como OneDrive, ademas los escanean el sincronizador y el
// antivirus): medido el 2026-09-20, el primer arranque tardo 73,9 s y el segundo, con la cache
// caliente, 8,1 s. `VERIFY_START_TIMEOUT_MS` permite darle margen a una maquina asi sin tocar el
// script; en una maquina normal no hace falta.
const START_TIMEOUT_MS = Number(process.env.VERIFY_START_TIMEOUT_MS) || 60000;

// Este proceso es el ULTIMO de la cadena (ver package.json: `verify:clean`
// encadena este script tras verify-clean.js con `&&`), asi que la limpieza
// de la base de datos de verificacion vive aqui, no en verify-clean.js —
// corre siempre, exito o fallo, vea el `finally` de main().
async function dropDatabase() {
  try {
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
    });
    await conn.query(`DROP DATABASE IF EXISTS \`${VERIFY_DB}\``);
    await conn.end();
  } catch (e) {
    console.warn(`[verify:clean:server-check] no se pudo limpiar la base de datos de verificacion: ${e.message}`);
  }
}

function waitForServer(url, timeoutMs, isAlive) {
  const deadline = Date.now() + timeoutMs;
  function attempt() {
    return fetch(url).then((res) => res.status).catch(() => null);
  }
  return new Promise((resolve, reject) => {
    (async function poll() {
      while (Date.now() < deadline) {
        if (isAlive && !isAlive()) {
          return reject(new Error('el proceso del servidor termino antes de responder'));
        }
        const status = await attempt();
        if (status !== null) return resolve(true);
        await new Promise((r) => setTimeout(r, 500));
      }
      reject(new Error(`el servidor no respondio en ${url} dentro de ${timeoutMs}ms`));
    })();
  });
}

async function main() {
  const serverEnv = { ...process.env, DB_DATABASE: VERIFY_DB, PORT: VERIFY_PORT };
  const server = spawn('node', ['dist/main.js'], { cwd: ROOT, env: serverEnv, stdio: 'pipe' });

  let serverOutput = '';
  let serverExited = false;
  server.on('error', (e) => { serverOutput += `\n[spawn error] ${e.message}`; });
  server.stdout.on('data', (d) => { serverOutput += d; });
  server.stderr.on('data', (d) => { serverOutput += d; });
  server.on('exit', () => { serverExited = true; });

  let succeeded = false;
  try {
    await waitForServer(`http://localhost:${VERIFY_PORT}/docs`, START_TIMEOUT_MS, () => !serverExited);

    console.log('login real contra el servidor recien levantado (docente de demo)');
    const loginRes = await fetch(`http://localhost:${VERIFY_PORT}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    });
    if (loginRes.status !== 200 && loginRes.status !== 201) {
      throw new Error(`login devolvio status ${loginRes.status}: ${await loginRes.text()}`);
    }
    const loginBody = await loginRes.json();
    if (!loginBody || !loginBody.token) {
      throw new Error(`login respondio 200 pero sin token: ${JSON.stringify(loginBody)}`);
    }
    console.log(`  login OK para ${DEMO_EMAIL} (token recibido)`);

    console.log('verificacion de datos sembrados via GET /enrollment/my');
    const meRes = await fetch(`http://localhost:${VERIFY_PORT}/enrollment/my`, {
      headers: { Authorization: `Bearer ${loginBody.token}` },
    });
    if (meRes.status !== 200) {
      throw new Error(`GET /enrollment/my devolvio status ${meRes.status} tras login exitoso`);
    }
    console.log('  OK, status 200');
    succeeded = true;
  } finally {
    console.log('apagado del servidor');
    server.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 1000));
    if (!server.killed) server.kill('SIGKILL');
    if (!succeeded) {
      console.error('\n--- salida del servidor (para diagnostico) ---');
      console.error(serverOutput.slice(-4000) || '(el proceso no escribio nada a stdout/stderr)');
    }
  }
}

main()
  .catch((e) => {
    console.error(`\n[verify:clean:server-check] ${e.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    console.log(`\n[verify:clean:server-check] limpieza: eliminar base de datos de verificacion ${VERIFY_DB}`);
    await dropDatabase();
    if (!process.exitCode) {
      console.log(
        '\n[verify:clean] TODO EN VERDE: npm ci -> migration:run -> db:seed:demo -> build -> start -> login real -> apagado.',
      );
    }
  });
