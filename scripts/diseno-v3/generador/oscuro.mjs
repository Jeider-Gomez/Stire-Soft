// Versión en tema oscuro (Cielo y sol · cielo de noche) de una pantalla clara del lienzo.
import fs from 'node:fs';
import { LOGO, TEMAS } from './logo_final.mjs';

const NOCHE = 'radial-gradient(circle at 88% 8%,rgba(92,203,255,.20),rgba(0,0,0,0) 42%),linear-gradient(120deg,#0B2B3F 0%,#0F3550 58%,#163B5C 100%)';
const CIELO_RE = /radial-gradient\(circle at 88% 8%,rgba\(255,255,255,\.6\),rgba\(0,0,0,0\) 42%\),linear-gradient\(120deg,#8DEBFF 0%,#5CCBFF 58%,#7FB8FF 100%\)/g;
const FONDO = { '#FFFFFF':'#131C2E','#FFF':'#131C2E','#F7F9FC':'#0B1220','#EEF3F9':'#1B263B','#D5F6F0':'#0F3A3A','#E3EAF3':'#263349','#E3F7F3':'#0F3A3A','#E3F5F2':'#0F3A3A','#E7F6EF':'#0E3326','#F3EAFB':'#2A1D45','#FFF8E6':'#2E2410','#FFF1C2':'#3A2E0E','#CBD5E1':'#334155' };
const TEXTO = { '#14213D':'#E8F6FF','#4A5873':'#A7B4C8','#047857':'#5EE6A8','#5B2192':'#C9A8F5','#7A4B00':'#FFD97A','#B45309':'#FBBF5A','#B91C1C':'#FF8A8A','#009985':'#5EE6D0','#0B6B5E':'#5EE6D0','#B4233C':'#FF8FA3','#0B4F7A':'#8FD3FF','#C2410C':'#FDBA74','#0A7F70':'#5EE6D0','#1D6FD1':'#8FC8FF','#A35F00':'#FFD97A','#D12F3A':'#FF8A8A','#7C3AED':'#C9A8F5','#0E7490':'#67E8F9','#B42318':'#FF8A8A' };
const BORDE = { '#E3EAF3':'#263349','#CBD5E1':'#334155','#B8CBEA':'#334155','#D3E0F4':'#263349' };

const up = (h) => h.toUpperCase();
const lum=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return (0.299*(n>>16)+0.587*((n>>8)&255)+0.114*(n&255))/255};
function estilo(st) {
  // sobre sol o sobre el degradado turquesa-cielo el texto sigue oscuro (contraste)
  if (/background:#(FFC94D|9FE3D8|FFE08A|FFC2C2)/i.test(st)) return st;
  const bg = (st.match(/background:(#[0-9A-Fa-f]{3,6})\b/) || [])[1];
  const col = (st.match(/(?:^|;)\s*color:(#[0-9A-Fa-f]{3,6})\b/) || [])[1];
  // el botón principal: azul noche en claro, sol en oscuro
  const alto=+((st.match(/(?:^|;)height:(\d+)px/)||[])[1]||0);
  if (bg && up(bg) === '#14213D' && col && ['#FFF', '#FFFFFF'].includes(up(col)) && (alto===0||alto<=56) && !/font-family:Poppins/.test(st))
    return st.replace(/background:#14213D/i, 'background:#FFC94D').replace(/((?:^|;)\s*color:)#(FFF|FFFFFF)\b/i, '$1#14213D');
  if (bg && up(bg) === '#14213D') st = st.replace(/background:#14213D/i, 'background:#1E3A5F');
  st = st.replace(/background:(#[0-9A-Fa-f]{3,6})\b/g, (m, c) => 'background:' + (FONDO[up(c)] || (lum(c) > .85 ? '#1B263B' : c)));
  st = st.replace(/background:rgba\(255,255,255,\.(5|55|6|65|7|72|75|8|85|9|92|94)\)/g, 'background:rgba(255,255,255,.10)');
  st = st.replace(/((?:^|;)\s*color:)(#[0-9A-Fa-f]{3,6})\b/g, (m, p, c) => p + (TEXTO[up(c)] || (lum(c)<.3 ? '#E8F6FF' : c)));
  st = st.replace(/(border(?:-[a-z]+)?:[^;]*?)(#[0-9A-Fa-f]{3,6})\b/g, (m, p, c) => p + (BORDE[up(c)] || c));
  return st;
}

export function oscurecer(s) {
  s = s.replace(/#00C2A8 0%,#5CCBFF 100%/g, '#0E7C70 0%,#1F6FA3 100%');
  s = s.replace(CIELO_RE, NOCHE);
  // el saludo sobre el cielo de noche: texto claro
  s = s.replace(/style="([^"]*)"/g, (m, st) => `style="${estilo(st)}"`);
  // colores de página en <helmet>
  s = s.replace(/body\{margin:0;([^}]*)color:#14213D;background:#F7F9FC\}/, 'body{margin:0;$1color:#E8F6FF;background:#0B1220}').replace(/a\{color:#14213D\}/, 'a{color:#8DEBFF}');
  // dentro del cielo de noche, el texto oscuro que quedó pasa a claro
  s = s.split('color:#14213D;').join('color:#14213D;'); // botones de sol conservan su tinta
  // el logo en su versión oscura (nombre en blanco)
  let i = 0;
  while ((i = s.indexOf('<span role="img" aria-label="STIRE"', i)) >= 0) {
    let d = 0, j = -1; const re = /<\/?span\b/g; re.lastIndex = i; let m;
    while ((m = re.exec(s))) { d += m[0] === '<span' ? 1 : -1; if (d === 0) { j = s.indexOf('>', m.index) + 1; break; } }
    if (j < 0) break;
    const b = s.slice(i, j);
    const alto = +(b.match(/height:(\d+)px/) || [0, 32])[1];
    const bgs = [...s.slice(0, i).matchAll(/background:(#[0-9A-Fa-f]{3,6})\b/g)];
    const bg = bgs.length ? bgs[bgs.length - 1][1] : '#131C2E';
    const nuevo = LOGO({ ...TEMAS.oscuro, bg, hueco: bg }, alto);
    s = s.slice(0, i) + nuevo + s.slice(j); i += nuevo.length;
  }
  // svg: trazos y rellenos de la línea clara
  s = s.replace(/<text([^>]*)fill="#14213D"/g,'<text$1fill="#E8F6FF"').replace(/(fill)="#14213D"(?=[^>]*font)/g,'$1="#E8F6FF"');
  s = s.replace(/(fill|stroke)="#(E3EAF3|E2E8F0|D3E0F4|EEF3F9)"/g, '$1="#263349"');
  s = s.replace(/fill="#4A5873"/g,'fill="#A7B4C8"').replace(/(<text[^>]*)fill="#047857"/g,'$1fill="#5EE6A8"').replace(/(<text[^>]*)fill="#B42318"/g,'$1fill="#FF8A8A"');
  s = s.replace(/radial-gradient\(#(E3EAF3|D7E0EC) 1(\.2)?px/g, 'radial-gradient(#263349 1.2px');
  const SVGF = { '#D5F6F0':'#0F3A3A','#E3F4FF':'#14304A','#FFF1C2':'#3A2E0E','#FFFFFF':'#131C2E','#FFE4E4':'#3A1A1E' };
  s = s.replace(/<(rect|path|circle)([^>]*?)fill="(#[0-9A-Fa-f]{6})"/g, (m, t, a, c) => `<${t}${a}fill="${(up(c)==='#FFFFFF' && t!=='rect') ? c : (SVGF[up(c)] || c)}"`);
  s = s.replace(/<(rect|path)([^>]*?)stroke="#14213D"/g, '<$1$2stroke="#A7B4C8"');
  s = s.split('linear-gradient(#D5F6F0,#D5F6F0) padding-box').join('linear-gradient(#0F3A3A,#0F3A3A) padding-box');
  return s;
}

const [, , ...pares] = process.argv; // origen:destino:titulo
for (const p of pares) {
  const [org, dst, tit] = p.split('|');
  let s = oscurecer(fs.readFileSync(org, 'utf8'));
  s = s.replace(/<title>([^<]*)<\/title>/, `<title>${tit}</title>`);
  fs.writeFileSync(dst, s);
  console.log(dst);
}
