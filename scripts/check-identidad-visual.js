#!/usr/bin/env node
/**
 * Revisa que un trabajo de identidad visual se quedó en su territorio (ver docs/identidad-visual/README.md).
 *
 *   npm run check:identidad                 compara contra origin/main
 *   npm run check:identidad -- v1.0.0-beta.1   compara contra otra rama o etiqueta
 *
 * Solo usa Node y git (no necesita `npm ci`). Termina con código 1 si algún archivo cae FUERA del
 * territorio; los AVISOS (script de un .vue, directivas, ids, nuevas dependencias) no bloquean:
 * son cosas para mirar con el integrador antes de unir la rama.
 */
const { execFileSync } = require('node:child_process');

/** Territorio de identidad visual: estilo, marca y la parte visible (template) de las pantallas. */
const LIBRE = [
  /^frontend-nuxt\/tailwind\.config\.ts$/,
  /^frontend-nuxt\/assets\//,
  /^frontend-nuxt\/public\//,
  /^frontend-nuxt\/app\.vue$/,
  /^frontend-nuxt\/error\.vue$/,
  /^frontend-nuxt\/(layouts|components|pages)\/.+\.vue$/,
  /^docs\/identidad-visual\//,
  /^docs\/material-visual\//,
];
/** Se puede tocar, pero mezcla estilo con configuración: hay que mirar qué cambió. */
const CON_CUIDADO = [/^frontend-nuxt\/nuxt\.config\.ts$/];

function classify(path) {
  if (LIBRE.some((re) => re.test(path))) return 'libre';
  if (CON_CUIDADO.some((re) => re.test(path))) return 'cuidado';
  return 'fuera';
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** Contenido de todos los bloques <script> de un .vue, sin espacios sobrantes (reformatear no cuenta). */
function scriptOf(vue) {
  return norm([...vue.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n'));
}

/** Directivas que definen comportamiento (no estilo): v-if, v-for, v-model, @click, etc. Solo sus nombres. */
function behaviorOf(vue) {
  const template = vue.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<style\b[\s\S]*?<\/style>/g, '');
  const found = template.match(/(?<=\s)(?:v-(?:model|if|else-if|else|for|show|on|html|slot)[\w:.-]*|@[\w:.-]+|#[\w-]+)(?=[=\s>])/g) ?? [];
  const counts = {};
  for (const d of found) counts[d] = (counts[d] ?? 0) + 1;
  return counts;
}

/** Atributos que scripts de prueba y lectores de pantalla usan para encontrar cosas. */
function anchorsOf(vue) {
  return new Set([...vue.matchAll(/\b(id|role|aria-label|data-testid)="([^"]+)"/g)].map((m) => `${m[1]}="${m[2]}"`));
}

/** Compara la versión base y la nueva de un .vue y devuelve avisos legibles (vacío = nada raro). */
function compareVue(before, after) {
  const avisos = [];
  if (scriptOf(before) !== scriptOf(after)) {
    avisos.push('cambió su bloque <script> (la lógica no es territorio de identidad visual; hay que revisarlo)');
  }
  const b = behaviorOf(before);
  const a = behaviorOf(after);
  const perdidas = Object.keys(b).filter((d) => (a[d] ?? 0) < b[d]).map((d) => `${d} (${b[d]} → ${a[d] ?? 0})`);
  if (perdidas.length) avisos.push(`perdió directivas de comportamiento: ${perdidas.join(', ')}`);
  const anclas = anchorsOf(after);
  const faltan = [...anchorsOf(before)].filter((x) => !anclas.has(x));
  if (faltan.length) avisos.push(`ya no tiene: ${faltan.join(', ')}`);
  return avisos;
}

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
}

function main() {
  const base = process.argv[2] || 'origin/main';
  let mergeBase;
  try {
    mergeBase = git(['merge-base', base, 'HEAD']).trim();
  } catch {
    console.error(`No encuentro «${base}». Prueba primero: git fetch origin`);
    process.exit(2);
  }

  const cambios = new Map(); // ruta -> M | A | D
  for (const linea of git(['diff', '--name-status', '--no-renames', mergeBase]).split('\n').filter(Boolean)) {
    const [estado, ...resto] = linea.split('\t');
    cambios.set(resto.join('\t'), estado[0]);
  }
  for (const ruta of git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean)) cambios.set(ruta, 'A');

  const fuera = [];
  const avisos = [];
  for (const [ruta, estado] of [...cambios].sort()) {
    const zona = classify(ruta);
    if (zona === 'fuera') {
      fuera.push(`${estado} ${ruta}`);
      continue;
    }
    if (zona === 'cuidado') avisos.push(`${ruta}: mezcla estilo con configuración; deja solo lo de <head>/marca y avisa`);
    if (ruta.endsWith('.vue') && estado === 'M') {
      let antes;
      try {
        antes = git(['show', `${mergeBase}:${ruta}`]);
      } catch {
        continue;
      }
      const despues = require('node:fs').readFileSync(ruta, 'utf8');
      for (const a of compareVue(antes, despues)) avisos.push(`${ruta}: ${a}`);
    }
    if (ruta.endsWith('.vue') && estado === 'D') avisos.push(`${ruta}: eliminado; confirma que ninguna ruta o import lo usaba`);
  }

  console.log(`Base de comparación: ${base} (${mergeBase.slice(0, 7)}) · ${cambios.size} archivo(s) cambiado(s)\n`);
  if (fuera.length) {
    console.log('✖ FUERA de tu territorio (no deberían ir en esta rama):');
    fuera.forEach((f) => console.log('   ' + f));
    console.log('  Si de verdad hacen falta, habla con quien integra antes de subirlos.\n');
  }
  if (avisos.length) {
    console.log('⚠ Para mirar antes de pedir la unión:');
    avisos.forEach((a) => console.log('   ' + a));
    console.log('');
  }
  if (!fuera.length && !avisos.length) console.log('✔ Todo dentro del territorio de identidad visual.');
  else if (!fuera.length) console.log('✔ Nada fuera del territorio (revisa los avisos de arriba).');
  process.exit(fuera.length ? 1 : 0);
}

if (require.main === module) main();

module.exports = { classify, compareVue, scriptOf, behaviorOf };
