import { spawnSync } from 'child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { gunzipSync } from 'zlib';

// deploy/backup-db.sh guardaba stire-AAAA-MM-DD.sql.gz: la copia manual antes de un despliegue y la copia diaria del
// mismo día se pisaban (por eso el procedimiento de despliegue tenía que copiarla a mano con la hora). Además, si el
// volcado fallaba a mitad, quedaba un .sql.gz truncado con nombre de copia buena.
// La prueba corre el script REAL con un `docker` falso en el PATH, sin base de datos.
const SCRIPT = path.join(__dirname, '..', '..', 'deploy', 'backup-db.sh');

function hayBash(): boolean {
  return spawnSync('bash', ['-c', 'exit 0']).status === 0;
}

function prepararCarpeta(salidaDocker: string, codigoDocker: number): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'stire-backup-'));
  mkdirSync(path.join(dir, 'deploy'));
  mkdirSync(path.join(dir, 'bin'));
  copyFileSync(SCRIPT, path.join(dir, 'deploy', 'backup-db.sh'));
  writeFileSync(path.join(dir, '.env.prod'), ['DB_ROOT_PASSWORD=x', 'DB_DATABASE=basestire', ''].join('\n'));
  const docker = path.join(dir, 'bin', 'docker');
  writeFileSync(docker, ['#!/usr/bin/env bash', `printf '%s' '${salidaDocker}'`, `exit ${codigoDocker}`, ''].join('\n'));
  chmodSync(docker, 0o755);
  return dir;
}

// El `docker` falso va primero en el PATH, relativo a la carpeta de la prueba (funciona igual en Linux y en Git Bash).
function correr(dir: string) {
  return spawnSync('bash', ['-c', 'export PATH="$PWD/bin:$PATH"; bash deploy/backup-db.sh'], { cwd: dir });
}

const describirSiHayBash = hayBash() ? describe : describe.skip;

describirSiHayBash('deploy/backup-db.sh', () => {
  const carpetas: string[] = [];
  afterAll(() => carpetas.forEach((d) => rmSync(d, { recursive: true, force: true })));

  it('guarda la copia con fecha y hora, y el contenido es el volcado comprimido', () => {
    const dir = prepararCarpeta('VOLCADO-DE-PRUEBA', 0);
    carpetas.push(dir);
    const r = correr(dir);
    expect(r.status).toBe(0);
    const copias = readdirSync(path.join(dir, 'backups'));
    expect(copias).toHaveLength(1);
    expect(copias[0]).toMatch(/^stire-\d{4}-\d{2}-\d{2}-\d{4}\.sql\.gz$/);
    expect(gunzipSync(readFileSync(path.join(dir, 'backups', copias[0]))).toString()).toBe('VOLCADO-DE-PRUEBA');
    expect(r.stdout.toString()).toContain(`Copia lista: backups/${copias[0]}`);
  });

  it('si el volcado falla, termina con error y no deja ninguna copia (ni a medias)', () => {
    const dir = prepararCarpeta('VOLCADO-CORTADO', 1);
    carpetas.push(dir);
    const r = correr(dir);
    expect(r.status).not.toBe(0);
    expect(readdirSync(path.join(dir, 'backups'))).toEqual([]);
  });
});
