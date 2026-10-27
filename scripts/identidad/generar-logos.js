#!/usr/bin/env node
/**
 * Genera los archivos del logo de STIRE en docs/identidad-visual/logo/ (SVG) a partir de la geometría del logo aprobado
 * (STIRE_logo_5.svg, viewBox de 200). Los PNG se sacan después con scripts/identidad/exportar-png.ps1 (Chrome sin
 * ventana). Uso: node scripts/identidad/generar-logos.js
 */
const fs = require('node:fs');
const path = require('node:path');

const SALIDA = path.join(__dirname, '..', '..', 'docs', 'identidad-visual', 'logo');
fs.mkdirSync(SALIDA, { recursive: true });

const COLOR = { marco: '#7B2FBF', atras: '#00C2A8', pantalla: '#082B6B', gafas: '#00C2A8', patilla: '#008F7C', lente: '#FFFFFF', ojo: '#7B2FBF', boca: '#FFFFFF' };
const mono = (c, f) => ({ marco: c, atras: c, pantalla: c, gafas: c, patilla: c, lente: f, ojo: c, boca: f });
// Alto contraste (igual que la app): pantalla negra, gafas amarillas, lentes blancas, marco del color del texto.
const altoContraste = (marco) => ({ marco, atras: marco, pantalla: '#000000', gafas: '#FFD60A', patilla: '#FFD60A', lente: '#FFFFFF', ojo: '#000000', boca: '#FFD60A' });

const t = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
const base = 'M36 150 H126.5 V151 a4.5 4.5 0 0 0 4.5 4.5 H147 a4.5 4.5 0 0 0 4.5 -4.5 V150 H164 a6 6 0 0 1 0 12 H36 a6 6 0 0 1 0 -12 Z';

/** La cara: gafas (patillas por debajo de las lentes), ojos < > y sonrisa. */
function cara(c) {
  return `<g ${t}><path d="M46 70 L30 62 M158 70 L174 62" stroke="${c.patilla}" stroke-width="6.5"/><path d="M46 70 L30 62 M158 70 L174 62" stroke="${c.gafas}" stroke-width="3.8"/><path d="M95 73 Q100 66 105 73" stroke="${c.gafas}" stroke-width="6"/></g>`
    + `<rect x="45.5" y="62.5" width="52" height="44" rx="16" fill="none" stroke="${c.gafas}" stroke-width="4"/><rect x="107.5" y="62.5" width="52" height="44" rx="16" fill="none" stroke="${c.gafas}" stroke-width="4"/>`
    + `<rect x="43" y="58" width="52" height="44" rx="16" fill="${c.lente}" stroke="${c.gafas}" stroke-width="7.5"/><rect x="105" y="58" width="52" height="44" rx="16" fill="${c.lente}" stroke="${c.gafas}" stroke-width="7.5"/>`
    + `<path d="M76 70 L66 80 L76 90 M128 70 L138 80 L128 90" ${t} stroke="${c.ojo}" stroke-width="8.5"/>`
    + `<path d="M82 114 Q100 127 118 114" ${t} stroke="${c.boca}" stroke-width="6"/>`;
}

/** Logo completo: tarjeta de atrás, marco, pantalla, cara y la base con el hueco del mouse. `sep` separa las piezas. */
function completo(c, sep) {
  const s = sep ? ` stroke="${sep}" stroke-width="3.5" paint-order="stroke"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 26 168 140" width="168" height="140">`
    + `<rect x="34" y="32" width="148" height="100" rx="18" fill="${c.atras}"${s}/>`
    + `<rect x="26" y="40" width="148" height="100" rx="18" fill="${c.marco}"${s}/>`
    + `<rect x="38" y="52" width="124" height="76" rx="10" fill="${c.pantalla}"/>${cara(c)}`
    + `<path d="${base}" fill="${c.marco}"/></svg>\n`;
}

/** Isotipo: sin la tarjeta de atrás (botones, avatares, encabezados). */
function isotipo(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="22 36 156 130" width="156" height="130">`
    + `<rect x="26" y="40" width="148" height="100" rx="18" fill="${c.marco}"/><rect x="38" y="52" width="124" height="76" rx="10" fill="${c.pantalla}"/>${cara(c)}`
    + `<path d="${base}" fill="${c.marco}"/></svg>\n`;
}

/** Circular: para fotos de perfil y recortes redondos. */
function circular(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 10 180 180" width="180" height="180">`
    + `<circle cx="100" cy="100" r="86" fill="${c.marco}"/><circle cx="100" cy="100" r="76" fill="${c.pantalla}"/>`
    + `<g transform="translate(100 87) scale(1.1) translate(-100 -80)">${cara(c).replace(/<path d="M82 114[^>]*\/>/, '')}</g>`
    + `<g transform="translate(100 140) scale(1.1) translate(-100 -120)"><path d="M82 114 Q100 127 118 114" ${t} stroke="${c.boca}" stroke-width="6"/></g></svg>\n`;
}

/** Favicon: el dibujo simplificado de 64 px, con trazos gruesos para tamaños pequeños. */
function favicon(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect x="1" y="3" width="62" height="58" rx="14" fill="${c.marco}"/><rect x="3.5" y="5.5" width="57" height="53" rx="12" fill="${c.pantalla}"/>`
    + `<g transform="translate(32 33.5) scale(1.1) translate(-32 -28)"><g fill="none" stroke-linecap="round"><path d="M10.5 17 L5.5 14.5 M53.5 17 L58.5 14.5" stroke="${c.gafas}" stroke-width="3"/><path d="M29.5 18 H34.5" stroke="${c.gafas}" stroke-width="3.5"/></g>`
    + `<rect x="10.5" y="11" width="19" height="19" rx="6" fill="${c.lente}" stroke="${c.gafas}" stroke-width="3.5"/><rect x="34.5" y="11" width="19" height="19" rx="6" fill="${c.lente}" stroke="${c.gafas}" stroke-width="3.5"/>`
    + `<path d="M22 16.5 L18 20.5 L22 24.5 M42 16.5 L46 20.5 L42 24.5" fill="none" stroke="${c.ojo}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M24 37.5 Q32 44.5 40 37.5" fill="none" stroke="${c.boca}" stroke-width="4.2" stroke-linecap="round"/></g></svg>\n`;
}

/** Logo con nombre «stire_»: el texto usa Inter Bold; si no está instalada, el PNG es la versión segura. */
function conNombre(c, colorTexto) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="600" height="200">`
    + `<g transform="translate(10 30) scale(1)"><svg x="0" y="0" width="168" height="140" viewBox="20 26 168 140">${completo(c, '#FFFFFF').replace(/^<svg[^>]*>|<\/svg>\n$/g, '')}</svg></g>`
    + `<text x="210" y="138" font-family="Inter, 'Segoe UI', system-ui, sans-serif" font-weight="700" font-size="104" letter-spacing="-3.6" fill="${colorTexto}">st<tspan>ı</tspan>re</text>`
    + `<circle cx="300" cy="67" r="11" fill="#00C2A8"/>`
    + `<rect x="424" y="125" width="56" height="13" rx="6.5" fill="#00C2A8"/></svg>\n`;
}

const archivos = {
  'stire-logo.svg': completo(COLOR, '#FFFFFF'),
  'stire-logo-sobre-oscuro.svg': completo(COLOR, '#0B1020'),
  'stire-isotipo.svg': isotipo(COLOR),
  'stire-circular.svg': circular(COLOR),
  'stire-favicon.svg': favicon(COLOR),
  'stire-logo-nombre.svg': conNombre(COLOR, '#0B3D91'),
  'stire-logo-nombre-blanco.svg': conNombre(COLOR, '#FFFFFF'),
  'stire-un-color-oscuro.svg': completo(mono('#18213A', '#FFFFFF'), '#FFFFFF'),
  'stire-un-color-blanco.svg': completo(mono('#FFFFFF', '#18213A'), '#18213A'),
  'stire-alto-contraste.svg': completo(altoContraste('#020617'), '#FFFFFF'),
  'stire-alto-contraste-oscuro.svg': completo(altoContraste('#FFFFFF'), '#000000'),
};
for (const [nombre, svg] of Object.entries(archivos)) fs.writeFileSync(path.join(SALIDA, nombre), svg);
console.log(`${Object.keys(archivos).length} SVG en ${path.relative(process.cwd(), SALIDA)}`);
