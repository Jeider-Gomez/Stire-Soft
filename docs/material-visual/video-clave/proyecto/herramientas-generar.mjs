// Genera el proyecto HyperFrames del video «Activa tu Tutor» (una escena por paso).
import fs from 'fs'
import path from 'path'

const D = process.argv[2]
// Duraciones con las que se diseñaron los tiempos (voz local) y las de la voz de Will (ElevenLabs, a 1,1×).
const base = { '01': 6.848, '02': 6.059, '03': 6.165, '04': 7.531, '05': 7.296, '06': 7.061 }
const voz = { '01': 8.557, '02': 7.325, '03': 6.796, '04': 9.549, '05': 10.08, '06': 9.043 }
const PAD = 0.5, COLA = 1.0

const MASCOTA = (id) => `
      <svg viewBox="24 38 152 104" aria-hidden="true">
        <g id="${id}-cuerpo">
          <rect x="26" y="40" width="148" height="100" rx="18" fill="#7b2fbf" />
          <rect x="38" y="52" width="124" height="76" rx="10" fill="#082b6b" />
          <g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M46 70 L30 62 M158 70 L174 62" stroke="#008f7c" stroke-width="6.5" /><path d="M46 70 L30 62 M158 70 L174 62" stroke="#00c2a8" stroke-width="3.8" /><path d="M95 73 Q100 66 105 73" stroke="#00c2a8" stroke-width="6" /></g>
          <rect x="43" y="58" width="52" height="44" rx="16" fill="#fff" stroke="#00c2a8" stroke-width="7.5" />
          <rect x="105" y="58" width="52" height="44" rx="16" fill="#fff" stroke="#00c2a8" stroke-width="7.5" />
          <g id="${id}-ojos"><path d="M59 84 L69 76 L79 84" fill="none" stroke="#7b2fbf" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M121 84 L131 76 L141 84" fill="none" stroke="#7b2fbf" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" /></g>
          <path id="${id}-boca" d="M80 112 Q100 130 120 112" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" />
        </g>
      </svg>`

// Navegador dibujado (no es la página real de Google: solo lo necesario para ubicarse).
const NAV = (id, url, cuerpo) => `
    <div class="nav" id="${id}-nav">
      <div class="nav-barra"><i></i><i></i><i></i><span>${url}</span></div>
      <div class="nav-cuerpo">${cuerpo}</div>
    </div>`
const STIRE = (id, cuerpo) => `
    <div class="nav" id="${id}-nav">
      <div class="nav-barra"><i></i><i></i><i></i><span>stire-soft.vercel.app</span></div>
      <div class="nav-cuerpo stire">${cuerpo}</div>
    </div>`

const ESCENAS = [
  {
    id: 'hola', n: '01', paso: '', globo: 'Necesito una llave: una clave gratuita de Google',
    pantalla: `<div id="hola-llave" class="centro">
        <svg viewBox="0 0 120 120" width="260" height="260" aria-hidden="true"><circle cx="40" cy="60" r="26" fill="none" stroke="#ffc94d" stroke-width="12"/><path d="M64 60 H108 M92 60 V78 M104 60 V72" stroke="#ffc94d" stroke-width="12" stroke-linecap="round" fill="none"/></svg>
        <h2>Clave de Google AI Studio</h2>
        <div class="chips"><span id="hola-c1">Gratis</span><span id="hola-c2">Sin tarjeta</span><span id="hola-c3">Unos 2 minutos</span></div>
      </div>`,
    anim: (T) => `
    tl.fromTo("#hola-llave svg", { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)" }, ${T(1.2)});
    tl.fromTo("#hola-llave h2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, ${T(2.0)});
    ["#hola-c1", "#hola-c2", "#hola-c3"].forEach((s, i) => tl.fromTo(s, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.6)" }, ${T(4.2)} + i * 0.35));`,
  },
  {
    id: 'abrir', n: '02', paso: 'Paso 1 de 5', globo: 'Toca «Abrir Google AI Studio»',
    pantalla: STIRE('abrir', `<h3>Activa tu Tutor</h3><p>Sigue los pasos. Google se abre en otra pestaña.</p>
        <div class="btn sol" id="abrir-btn">↗ Abrir Google AI Studio</div>
        <div class="pestana" id="abrir-pestana">Nueva pestaña: aistudio.google.com</div>`),
    tap: '#abrir-btn', tapEn: 1.6,
    anim: (T) => `
    tl.fromTo("#abrir-pestana", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.45, ease: "expo.out" }, ${T(3.0)});`,
  },
  {
    id: 'entrar', n: '03', paso: 'Paso 2 de 5', globo: 'Entra con tu cuenta de Google',
    pantalla: NAV('entrar', 'aistudio.google.com', `<h3>Google AI Studio</h3>
        <div class="btn blanco" id="entrar-btn">G  Iniciar sesión con Google</div>
        <label class="casilla" id="entrar-casilla"><b id="entrar-check"></b> Acepto las condiciones</label>
        <div class="nota" id="entrar-nota">Gratis · no pide tarjeta · mayores de 18</div>`),
    tap: '#entrar-btn', tapEn: 0.8,
    anim: (T) => `
    tl.fromTo("#entrar-casilla", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${T(2.2)});
    tl.fromTo("#entrar-check", { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, ${T(3.2)});
    tl.fromTo("#entrar-nota", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, ${T(4.6)});`,
  },
  {
    id: 'crear', n: '04', paso: 'Paso 3 de 5', globo: 'Toca «Create API key» (crear clave)',
    pantalla: NAV('crear', 'aistudio.google.com/apikey', `<h3>API keys</h3>
        <div class="btn azul" id="crear-btn">+ Create API key</div>
        <div class="dialogo" id="crear-dialogo"><p>¿En qué proyecto?</p><div class="opcion" id="crear-op">Create API key in new project</div></div>`),
    tap: '#crear-btn', tapEn: 1.0,
    anim: (T) => `
    tl.fromTo("#crear-dialogo", { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "expo.out" }, ${T(3.4)});
    tl.to("#crear-op", { backgroundColor: "#d5f6f0", borderColor: "#00c2a8", duration: 0.2 }, ${T(5.6)});
    tl.to("#crear-op", { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 }, ${T(5.6)});`,
  },
  {
    id: 'copiar', n: '05', paso: 'Paso 4 de 5', globo: 'Cópiala: empieza por «AIza» o «AQ.»',
    pantalla: NAV('copiar', 'aistudio.google.com/apikey', `<h3>Tu clave de API</h3>
        <div class="clave"><code>AIzaSy•••••••••••••••••••••••••</code><div class="btn azul mini" id="copiar-btn">Copiar</div></div>
        <div class="toast" id="copiar-toast">✓ Copiada</div>
        <div class="nota candado" id="copiar-nota">Es tuya: no se la pases a nadie</div>`),
    tap: '#copiar-btn', tapEn: 1.6,
    anim: (T) => `
    tl.fromTo("#copiar-toast", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, ${T(2.0)});
    tl.fromTo("#copiar-nota", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, ${T(4.8)});`,
  },
  {
    id: 'pegar', n: '06', paso: 'Paso 5 de 5', globo: '«Pegar» y «Guardar»: ¡listo!',
    pantalla: STIRE('pegar', `<h3>Activa tu Tutor</h3>
        <div class="campo" id="pegar-campo"><span id="pegar-texto">AIzaSy•••••••••••••••••</span></div>
        <div class="fila"><div class="btn blanco mini" id="pegar-btn">Pegar</div><div class="btn tinta" id="pegar-guardar">Guardar y activar el Tutor</div></div>
        <div class="exito" id="pegar-exito">✓ ¡Tu Tutor está activo!</div>`),
    tap: '#pegar-btn', tapEn: 1.3,
    anim: (T) => `
    tl.fromTo("#pegar-texto", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${T(1.5)});
    tl.to("#pegar-mano", { x: 330, duration: 0.5, ease: "power2.inOut" }, ${T(2.2)});
    tl.to("#pegar-guardar", { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 }, ${T(2.9)});
    tl.fromTo("#pegar-exito", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" }, ${T(4.2)});
    tl.to("#pegar-masc", { y: -90, duration: 0.25, ease: "power2.out" }, ${T(4.3)});
    tl.to("#pegar-masc", { y: 0, duration: 0.5, ease: "bounce.out" }, ${T(4.55)});`,
  },
]

const CSS = `
    #root { position: absolute; inset: 0; overflow: hidden; background: #f7f9fc; font-family: Inter, sans-serif; color: #14213d; }
    .cielo { position: absolute; inset: 0; background: radial-gradient(circle at 15% 85%, rgba(255,201,77,.18), transparent 35%), radial-gradient(circle at 85% 10%, rgba(92,203,255,.22), transparent 40%); }
    .masc { position: absolute; left: 120px; top: 300px; width: 560px; height: 384px; }
    .masc svg { width: 560px; height: 384px; overflow: visible; }
    .globo { position: absolute; left: 90px; top: 730px; width: 620px; padding: 26px 32px; border-radius: 30px 30px 30px 8px; background: #14213d; color: #fff; font: 700 40px/1.25 Inter, sans-serif; text-align: center; }
    .paso { position: absolute; left: 120px; top: 150px; padding: 12px 24px; border-radius: 999px; background: #d5f6f0; color: #0b6b5e; font: 800 30px Poppins, sans-serif; letter-spacing: .04em; }
    .nav { position: absolute; left: 820px; top: 150px; width: 980px; height: 720px; border-radius: 28px; background: #fff; box-shadow: 0 40px 90px rgba(20,33,61,.18); overflow: hidden; }
    .nav-barra { height: 70px; background: #eef2f7; display: flex; align-items: center; gap: 12px; padding: 0 26px; }
    .nav-barra i { width: 16px; height: 16px; border-radius: 50%; background: #cbd5e1; }
    .nav-barra span { margin-left: 18px; flex: 1; height: 42px; border-radius: 21px; background: #fff; display: flex; align-items: center; padding: 0 22px; font: 500 28px Inter, sans-serif; color: #4a5873; }
    .nav-cuerpo { padding: 50px 60px; display: flex; flex-direction: column; gap: 30px; font: 500 30px/1.4 Inter, sans-serif; }
    .nav-cuerpo h3 { font: 800 50px Poppins, sans-serif; }
    .nav-cuerpo p { color: #4a5873; }
    .btn { align-self: flex-start; padding: 24px 38px; border-radius: 18px; font: 800 34px Inter, sans-serif; }
    .btn.sol { background: #a35f00; color: #fff; } .btn.azul { background: #1a56c4; color: #fff; } .btn.tinta { background: #14213d; color: #fff; }
    .btn.blanco { background: #fff; color: #14213d; border: 3px solid #cbd5e1; } .btn.mini { padding: 18px 28px; font-size: 30px; }
    .pestana { align-self: flex-start; padding: 16px 26px; border-radius: 14px; background: #e6f4ff; color: #1a56c4; font: 700 28px Inter, sans-serif; }
    .casilla { display: flex; align-items: center; gap: 18px; font-weight: 700; }
    .casilla b { width: 44px; height: 44px; border-radius: 10px; background: #00c2a8; display: block; }
    .nota { color: #4a5873; font: 700 28px Inter, sans-serif; }
    .dialogo { padding: 30px; border-radius: 22px; border: 3px solid #e3eaf3; background: #f7f9fc; }
    .opcion { margin-top: 18px; padding: 22px 26px; border-radius: 16px; border: 3px solid #cbd5e1; background: #fff; font-weight: 800; }
    .clave { display: flex; align-items: center; gap: 22px; padding: 22px 26px; border-radius: 18px; background: #f1f5fb; }
    .clave code { flex: 1; font: 600 32px "JetBrains Mono", monospace; }
    .toast { align-self: flex-start; padding: 14px 24px; border-radius: 999px; background: #e7f6ef; color: #047857; font: 800 30px Inter, sans-serif; }
    .campo { height: 96px; border-radius: 18px; border: 3px solid #00c2a8; display: flex; align-items: center; padding: 0 28px; font: 600 32px "JetBrains Mono", monospace; }
    .fila { display: flex; gap: 20px; }
    .exito { align-self: flex-start; padding: 18px 30px; border-radius: 999px; background: #e7f6ef; color: #047857; font: 800 38px Poppins, sans-serif; }
    .centro { position: absolute; left: 820px; top: 180px; width: 980px; display: flex; flex-direction: column; align-items: center; gap: 30px; }
    .centro h2 { font: 800 60px Poppins, sans-serif; }
    .chips { display: flex; gap: 20px; } .chips span { padding: 16px 28px; border-radius: 999px; background: #fff; box-shadow: 0 10px 30px rgba(20,33,61,.1); font: 800 32px Inter, sans-serif; }
    .btn, .opcion { position: relative; } .mano { position: absolute; left: 50%; top: 50%; margin: -45px 0 0 -45px; width: 90px; height: 90px; border-radius: 50%; background: rgba(0,194,168,.35); border: 6px solid #00c2a8; pointer-events: none; z-index: 10; }`

function escena(e, inicio) {
  if (e.tap) { const id = e.tap.slice(1); e.pantalla = e.pantalla.replace(new RegExp('(id="' + id + '"[^>]*>)([^<]*)'), '$1$2<i class="mano" id="' + e.id + '-mano"></i>') }
  const dur = PAD + voz[e.n] + COLA
  const k = voz[e.n] / base[e.n]
  const T = (t) => (t * k).toFixed(2)
  const html = `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="${e.id}" data-width="1920" data-height="1080">
    <div class="cielo"></div>
    ${e.paso ? `<div class="paso" id="${e.id}-paso">${e.paso}</div>` : ''}
    <div class="masc" id="${e.id}-masc">${MASCOTA(e.id)}
    </div>
    <div class="globo" id="${e.id}-globo">${e.globo}</div>
    ${e.pantalla}
    
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${e.id === "hola" ? "" : `tl.fromTo("#${e.id}-masc", { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, 0);`}
    tl.to("#${e.id}-masc", { y: -12, duration: 1.2, yoyo: true, repeat: ${e.id === "pegar" ? 2 : Math.max(1, Math.floor(dur / 1.2) - 1)}, ease: "sine.inOut" }, 0.6);
    tl.fromTo("#${e.id}-ojos", { scaleY: 1 }, { scaleY: 0.1, transformOrigin: "50% 50%", duration: 0.08, yoyo: true, repeat: 1 }, ${T(dur * 0.55)});
    tl.fromTo("#${e.id}-globo", { opacity: 0, y: 24, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, ${e.id === "hola" ? 0 : 0.35});
    ${e.paso ? `tl.fromTo("#${e.id}-paso", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.35, ease: "expo.out" }, 0.2);` : ''}
    ${e.id === 'hola' ? '' : `tl.fromTo("#${e.id}-nav", { opacity: 0, x: 140, filter: "blur(12px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, 0.3);`}
    ${e.tap ? `
    // El dedo que toca: llega desde abajo a la derecha hasta el centro del botón y lo presiona
    tl.fromTo("#${e.id}-mano", { x: 420, y: 320, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.7, ease: "power2.inOut" }, ${(Number(T(e.tapEn)) - 0.75).toFixed(2)});
    tl.to("${e.tap}", { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 }, ${T(e.tapEn)});
    tl.to("#${e.id}-mano", { scale: 0.75, duration: 0.1, yoyo: true, repeat: 1 }, ${T(e.tapEn)});` : ''}
    ${e.anim(T)}
    tl.to(${JSON.stringify(["#"+e.id+"-globo", e.id==="hola" ? "#hola-llave" : "#"+e.id+"-nav"].concat(e.tap?["#"+e.id+"-mano"]:[]).join(", "))}, { opacity: 0, duration: 0.3, ease: "power2.in" }, ${T(dur - 0.35)});
    window.__timelines["${e.id}"] = tl;
  </script>
</template>
`
  fs.writeFileSync(path.join(D, 'compositions', `${e.id}.html`), html)
  return { e, inicio, dur }
}

let t = 0
const partes = ESCENAS.map((e) => { const p = escena(e, t); t += p.dur; return p })
const total = t
const hosts = partes.map((p) => `      <div id="${p.e.id}" data-composition-id="${p.e.id}" data-composition-src="compositions/${p.e.id}.html" data-start="${p.inicio.toFixed(3)}" data-duration="${p.dur.toFixed(3)}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>`).join('\n')
const musica = `      <audio id="musica" class="clip" src="assets/musica.mp3" data-start="0" data-duration="${total.toFixed(3)}" data-track-index="3" data-volume="0.25"></audio>
`
const audios = musica + partes.map((p, i) => `      <audio id="voz-${p.e.n}" class="clip" src="assets/voz/willr_${p.e.n}.mp3" data-start="${(p.inicio + PAD).toFixed(3)}" data-duration="${voz[p.e.n].toFixed(3)}" data-track-index="2" data-volume="1"></audio>`).join('\n')
fs.writeFileSync(path.join(D, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #f7f9fc; }
      #root { position: relative; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <!-- «Activa tu Tutor»: la mascota explica cómo sacar la clave de Google AI Studio. Guion en GUION.md. -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total.toFixed(3)}" data-width="1920" data-height="1080">
${hosts}
${audios}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`)
// Subtítulos (WebVTT) con el guion
const guion = fs.readFileSync(path.join(D, 'GUION.md'), 'utf8').split('\n').filter((l) => /^\| 0[1-6] /.test(l)).map((l) => l.split('|')[3].trim())
const hms = (s) => { const m = Math.floor(s / 60); return `00:${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(3).padStart(6, '0')}` }
fs.writeFileSync(path.join(D, 'activa-tu-tutor.es.vtt'), 'WEBVTT\n\n' + partes.map((p, i) => `${i + 1}\n${hms(p.inicio + PAD)} --> ${hms(p.inicio + PAD + voz[p.e.n])}\n${guion[i]}\n`).join('\n'))
fs.writeFileSync(path.join(D, 'package.json'), JSON.stringify({ name: 'video-clave-tutor', private: true, type: 'module', scripts: { check: 'npx --yes hyperframes@0.9.38 check', render: 'npx --yes hyperframes@0.9.38 render' } }, null, 2))
fs.copyFileSync(path.join(D, '..', '..', 'video-presentacion', 'proyecto', 'hyperframes.json'), path.join(D, 'hyperframes.json'))
console.log('total', total.toFixed(2))
