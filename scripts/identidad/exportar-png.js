#!/usr/bin/env node
/**
 * Saca los PNG del logo (fondo transparente) con Chrome sin ventana, a partir de los SVG de docs/identidad-visual/logo/.
 * También deja los íconos de la pestaña y del celular en frontend-nuxt/public/. Uso:
 *   node scripts/identidad/generar-logos.js && node scripts/identidad/exportar-png.js
 * Necesita Google Chrome instalado (variable CHROME para otra ruta).
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const RAIZ = path.join(__dirname, '..', '..');
const LOGO = path.join(RAIZ, 'docs', 'identidad-visual', 'logo');
const PNG = path.join(LOGO, 'png');
const PUBLICO = path.join(RAIZ, 'frontend-nuxt', 'public');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(PNG, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stire-logo-'));

/** Dibuja un SVG a `ancho`×`alto` px en un PNG transparente. */
function aPng(svg, destino, ancho, alto, conFuente = false) {
  const html = path.join(tmp, 'p.html');
  const fuente = conFuente ? '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=block">' : '';
  // El SVG va dentro de la página (no como <img>) para que use la fuente Inter cargada.
  const dentro = fs.readFileSync(svg, 'utf8').replace(/<svg /, `<svg style="display:block;width:${ancho}px;height:${alto}px" `);
  fs.writeFileSync(html, `<!doctype html><html><head>${fuente}<style>html,body{margin:0;background:transparent;overflow:hidden}</style></head><body>${dentro}</body></html>`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000', `--window-size=${ancho},${alto}`,
    '--virtual-time-budget=4000', `--screenshot=${destino}`, `file:///${html.replace(/\\/g, '/')}`], { stdio: 'ignore' });
}

const svg = (n) => path.join(LOGO, n);
const hechos = [];
for (const lado of [1024, 512, 256, 128]) {
  aPng(svg('stire-logo.svg'), path.join(PNG, `stire-logo-${lado}.png`), lado, Math.round((lado * 140) / 168)); hechos.push(`stire-logo-${lado}.png`);
  aPng(svg('stire-circular.svg'), path.join(PNG, `stire-circular-${lado}.png`), lado, lado); hechos.push(`stire-circular-${lado}.png`);
}
for (const lado of [512, 192, 180, 64, 32, 16]) { aPng(svg('stire-favicon.svg'), path.join(PNG, `stire-favicon-${lado}.png`), lado, lado); hechos.push(`stire-favicon-${lado}.png`); }
for (const n of ['stire-logo-sobre-oscuro', 'stire-isotipo', 'stire-un-color-oscuro', 'stire-un-color-blanco', 'stire-alto-contraste', 'stire-alto-contraste-oscuro']) {
  const [w, h] = n === 'stire-isotipo' ? [512, 427] : [512, 427];
  aPng(svg(`${n}.svg`), path.join(PNG, `${n}-512.png`), w, h); hechos.push(`${n}-512.png`);
}
for (const n of ['stire-logo-nombre', 'stire-logo-nombre-blanco']) { aPng(svg(`${n}.svg`), path.join(PNG, `${n}-1200.png`), 1200, 400, true); hechos.push(`${n}-1200.png`); }

// Íconos de la app: la pestaña (.ico con 16 y 32 px dentro), el celular (apple-touch-icon) y Android (192).
fs.copyFileSync(path.join(PNG, 'stire-favicon-180.png'), path.join(PUBLICO, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(PNG, 'stire-favicon-192.png'), path.join(PUBLICO, 'icono-192.png'));
fs.copyFileSync(path.join(PNG, 'stire-favicon-32.png'), path.join(PUBLICO, 'favicon-32.png'));
fs.copyFileSync(svg('stire-favicon.svg'), path.join(PUBLICO, 'favicon.svg'));
/** Un .ico es una cabecera y una lista de imágenes; desde Windows Vista cada imagen puede ser un PNG tal cual. */
function ico(pngs) {
  const cab = Buffer.alloc(6 + 16 * pngs.length);
  cab.writeUInt16LE(0, 0); cab.writeUInt16LE(1, 2); cab.writeUInt16LE(pngs.length, 4);
  let desplazamiento = cab.length;
  pngs.forEach(({ lado, datos }, i) => {
    const o = 6 + 16 * i;
    cab.writeUInt8(lado >= 256 ? 0 : lado, o); cab.writeUInt8(lado >= 256 ? 0 : lado, o + 1);
    cab.writeUInt16LE(1, o + 4); cab.writeUInt16LE(32, o + 6);
    cab.writeUInt32LE(datos.length, o + 8); cab.writeUInt32LE(desplazamiento, o + 12);
    desplazamiento += datos.length;
  });
  return Buffer.concat([cab, ...pngs.map((p) => p.datos)]);
}
fs.writeFileSync(path.join(PUBLICO, 'favicon.ico'), ico([16, 32].map((lado) => ({ lado, datos: fs.readFileSync(path.join(PNG, `stire-favicon-${lado}.png`)) }))));
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${hechos.length} PNG en docs/identidad-visual/logo/png y los íconos de la app en frontend-nuxt/public`);
