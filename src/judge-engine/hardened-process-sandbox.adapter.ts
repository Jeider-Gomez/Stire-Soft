import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { SandboxAdapter, RunResult } from './sandbox-adapter.interface';
import { SANDBOX_TIMEOUT_MS } from './sandbox-limits';

// ADR 06 — aislamiento por proceso hijo del sistema operativo, no por
// contexto de JavaScript (node:vm nunca fue una frontera de seguridad:
// ver P0-01, escape confirmado y reproducido). Cuatro barreras
// independientes: entorno vacío, --permission de Node, sin generacion de
// codigo desde strings, y cortafuegos de red en el preludio del hijo.

const TIMEOUT_MS = SANDBOX_TIMEOUT_MS;
const MAX_OUTPUT_BYTES = 64 * 1024;
const MAX_HEAP_MB = 128;

/** Límites reales del sandbox, para que el panel de administración muestre el valor verdadero. */
export const SANDBOX_LIMITS = {
  timeoutMs: TIMEOUT_MS,
  maxOutputBytes: MAX_OUTPUT_BYTES,
  maxHeapMb: MAX_HEAP_MB,
} as const;

const NETWORK_GUARD = `
const deny = (w) => { throw new Error('SandboxViolation: red bloqueada (' + w + ')'); };
const patch = (mod, keys) => { let m; try { m = require(mod); } catch { return; }
  for (const k of keys) if (m && typeof m[k] === 'function') m[k] = () => deny(mod + '.' + k); return m; };
const patchProto = (proto, keys, label) => { if (!proto) return;
  for (const k of keys) if (typeof proto[k] === 'function') proto[k] = () => deny(label + '.' + k); };
const net = patch('net', ['connect', 'createConnection']);
if (net && net.Socket) net.Socket.prototype.connect = () => deny('net.Socket.connect');
patch('tls', ['connect', 'createConnection']); patch('dgram', ['createSocket']);
patch('http', ['request', 'get']); patch('https', ['request', 'get']);
patch('http2', ['connect']);
// Ola 3 P6 (docs/REAUDITORIA_OLA2.md, hallazgo P2-R1): lo de arriba bloquea
// solo el lado que INICIA una conexion saliente. Un socket de ESCUCHA
// (net.createServer(...).listen(), http(s)/http2.createServer(...).listen())
// nunca pasaba por ninguna de esas funciones, asi que el codigo del
// estudiante podia aceptar conexiones entrantes sin que el cortafuegos lo
// notara — un canal de comunicacion con el exterior tan real como uno de
// salida, solo que de sentido contrario. Mismo patron de guardia: la
// funcion de creacion del servidor lanza antes de devolver nada usable.
if (net) net.createServer = () => deny('net.createServer');
patch('http', ['createServer']);
patch('https', ['createServer']);
patch('http2', ['createServer', 'createSecureServer']);
// dgram.createSocket ya esta bloqueado arriba (linea 27) — cubre tanto el
// envio como la recepcion UDP, porque ambos requieren ese mismo socket.
// Ola 2 P4: dns.promises y dns.Resolver son superficies DISTINTAS de las
// funciones planas de 'dns' — parchear solo dns.lookup/resolve* dejaba
// pasar dns.promises.lookup() y new dns.Resolver().resolve*(), suficiente
// para exfiltrar datos codificados en el propio nombre de host consultado,
// sin necesitar que la resolución llegue a completarse.
const DNS_FLAT = ['lookup', 'lookupService', 'resolve', 'resolve4', 'resolve6', 'resolveAny',
  'resolveCname', 'resolveMx', 'resolveNs', 'resolvePtr', 'resolveSoa', 'resolveSrv',
  'resolveTxt', 'resolveCaa', 'resolveNaptr', 'reverse'];
const DNS_RESOLVER_ONLY = DNS_FLAT.filter((k) => k !== 'lookup' && k !== 'lookupService');
const dnsCb = patch('dns', DNS_FLAT);
if (dnsCb) {
  patchProto(dnsCb.Resolver && dnsCb.Resolver.prototype, DNS_RESOLVER_ONLY, 'dns.Resolver.prototype');
  if (dnsCb.promises) {
    for (const k of DNS_FLAT) {
      if (typeof dnsCb.promises[k] === 'function') dnsCb.promises[k] = () => deny('dns.promises.' + k);
    }
    patchProto(
      dnsCb.promises.Resolver && dnsCb.promises.Resolver.prototype,
      DNS_RESOLVER_ONLY,
      'dns.promises.Resolver.prototype',
    );
  }
}
patch('dns/promises', DNS_FLAT); // mismo objeto que dns.promises, se parchea igual por si acaso
try { globalThis.fetch = () => deny('fetch'); } catch {}
`;

@Injectable()
export class HardenedProcessSandboxAdapter implements SandboxAdapter {
  private readonly logger = new Logger(HardenedProcessSandboxAdapter.name);

  async executeIsolated(
    code: string,
    language: string,
    testCase: any,
  ): Promise<RunResult> {
    if (language !== 'javascript' && language !== 'js') {
      return {
        status: 'runtime_error',
        stdout: '',
        stderr: `Sandbox endurecido: solo JavaScript. Recibido: ${language}`,
        timeMs: 0,
        memoryKb: 0,
      };
    }

    const dir = mkdtempSync(join(tmpdir(), `stire-sbx-${randomUUID()}-`));
    const guardFile = join(dir, 'guard.cjs');
    const codeFile = join(dir, 'student.js');
    writeFileSync(guardFile, NETWORK_GUARD, 'utf8');
    writeFileSync(codeFile, code, 'utf8');

    const start = Date.now();
    try {
      return await new Promise<RunResult>((resolve) => {
        const child = spawn(
          process.execPath,
          [
            '--permission',
            `--allow-fs-read=${dir}`,
            '--disallow-code-generation-from-strings',
            `--max-old-space-size=${MAX_HEAP_MB}`,
            '--require',
            guardFile,
            codeFile,
          ],
          {
            // Entorno minimo declarado a mano: si el aislamiento cayera, no
            // hay secretos que robar. En Windows libuv inyecta a la fuerza
            // ciertas variables del proceso padre cuando faltan en `env` —
            // se neutralizan aqui en vez de dejar que libuv decida.
            env: this.buildSandboxEnv(dir),
            cwd: dir,
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
          },
        );

        let stdout = '';
        let stderr = '';
        let killed = false;

        const timer = setTimeout(() => {
          killed = true;
          child.kill('SIGKILL');
        }, TIMEOUT_MS);

        child.stdout.on('data', (d) => {
          stdout += d;
          if (stdout.length > MAX_OUTPUT_BYTES) {
            killed = true;
            child.kill('SIGKILL');
          }
        });
        child.stderr.on('data', (d) => {
          stderr += d;
          if (stderr.length > MAX_OUTPUT_BYTES) {
            killed = true;
            child.kill('SIGKILL');
          }
        });
        child.on('error', (e) => {
          clearTimeout(timer);
          resolve({
            status: 'runtime_error',
            stdout: '',
            stderr: `Sandbox no disponible: ${e.message}`,
            timeMs: Date.now() - start,
            memoryKb: 0,
          });
        });
        child.stdin.end(String(testCase.input ?? testCase.inputData ?? ''));

        child.on('close', (exitCode) => {
          clearTimeout(timer);
          const timeMs = Date.now() - start;
          let status: RunResult['status'];
          if (killed) {
            status = 'time_limit';
          } else if (exitCode !== 0) {
            status = 'runtime_error';
          } else {
            status =
              String(testCase.expected ?? '').trim() === stdout.trim()
                ? 'accepted'
                : 'wrong_answer';
          }

          resolve({
            status,
            stdout: stdout.trim(),
            // Nunca stderr crudo al estudiante: filtra rutas del host.
            stderr: status === 'runtime_error' ? this.sanitizeStderr(stderr) : '',
            timeMs,
            memoryKb: 0,
          });
        });
      });
    } finally {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        /* noop: limpieza de mejor esfuerzo */
      }
    }
  }

  /**
   * En Windows, uv_spawn inyecta a la fuerza HOMEDRIVE, HOMEPATH, LOGONSERVER,
   * PATH, SYSTEMDRIVE, SYSTEMROOT, TEMP, USERDOMAIN, USERNAME, USERPROFILE y
   * WINDIR en el hijo cuando no vienen declaradas en `env` — `env: {}` nunca
   * produce un entorno vacío en Windows. Como libuv solo añade lo que falta,
   * se declaran aquí neutralizadas para que no filtren datos del host
   * (nombre de máquina, usuario, rutas de perfil).
   */
  private buildSandboxEnv(workDir: string): NodeJS.ProcessEnv {
    if (process.platform !== 'win32') return {};
    return {
      SystemRoot: process.env.SystemRoot ?? 'C:\\Windows',
      SystemDrive: process.env.SystemDrive ?? 'C:',
      windir: process.env.windir ?? 'C:\\Windows',
      TEMP: workDir,
      TMP: workDir,
      PATH: '',
      HOMEDRIVE: '',
      HOMEPATH: '',
      LOGONSERVER: '',
      USERNAME: 'sandbox',
      USERDOMAIN: 'sandbox',
      USERPROFILE: '',
    };
  }

  /** Elimina rutas absolutas y da un mensaje pedagógico ante agotamiento de heap. */
  private sanitizeStderr(raw: string): string {
    if (/JavaScript heap out of memory|FATAL ERROR/i.test(raw)) {
      return `Límite de memoria excedido (${MAX_HEAP_MB} MB).`;
    }
    const first = raw.split('\n').find((l) => /Error|error/.test(l)) ?? 'Error de ejecución';
    return first.replace(/[A-Za-z]:\\[^\s)]+|\/[^\s)]+/g, '<ruta>').trim().slice(0, 300);
  }
}
