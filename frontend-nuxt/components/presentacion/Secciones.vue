<template>
  <!-- Las cinco secciones del medio del cuadro «Pagina-inicio»: cómo funciona, cómo enseña el Tutor, los repasos, los
       docentes y la accesibilidad. Las capturas son de los cuadros v3 (scripts/diseno-v3/lienzo/img). -->
  <div>
    <section id="como-funciona" class="seccion bg-base-blanco" aria-labelledby="titulo-funciona">
      <EncabezadoSeccion id="titulo-funciona" etiqueta="CÓMO FUNCIONA" titulo="Así funciona" texto="Tres cosas, en este orden. Sin manuales." />
      <ol class="m-0 p-0 list-none grid md:grid-cols-3 gap-5">
        <li v-for="(p, i) in PASOS" :key="p.titulo" class="flex flex-col gap-3.5 p-[18px] rounded-[22px] bg-base-blanco border border-base-borde-sutil">
          <img :src="p.img" :alt="p.alt" width="1280" height="720" loading="lazy" class="w-full aspect-video object-cover rounded-[14px] bg-base-bg-primario">
          <div class="flex items-center gap-2.5">
            <span class="numero" aria-hidden="true">{{ i + 1 }}</span>
            <h3 class="m-0 text-xl font-bold">{{ p.titulo }}</h3>
          </div>
          <p class="m-0 text-base leading-relaxed text-base-texto-secundario">{{ p.texto }}</p>
        </li>
      </ol>
    </section>

    <section id="como-ensena" class="seccion" aria-labelledby="titulo-ensena">
      <EncabezadoSeccion id="titulo-ensena" etiqueta="CÓMO ENSEÑA" titulo="Un Tutor que no te da la respuesta"
        texto="Te ayuda por pasos, para que la próxima vez lo resuelvas solo. Funciona aunque no tengas clave de IA: las pistas las escribe tu docente." />
      <div class="grid lg:grid-cols-2 gap-10 items-center">
        <ol class="m-0 p-0 list-none flex flex-col gap-3">
          <li v-for="(a, i) in AYUDAS" :key="a.paso" class="flex items-center gap-3.5 px-[18px] py-4 rounded-2xl bg-base-blanco border border-base-borde-sutil"
            :style="{ marginLeft: `min(${i * 36}px, ${i * 6}vw)` }">
            <span class="numero numero-sol" aria-hidden="true">{{ i + 1 }}</span>
            <span><strong class="block text-[17px]">{{ a.paso }}</strong><span class="text-[15px] text-base-texto-secundario">{{ a.ejemplo }}</span></span>
          </li>
          <li class="px-[18px] py-3.5 rounded-2xl font-bold text-[17px] solucion flex items-center gap-2" style="margin-left: min(108px, 18vw)"><Check :size="18" aria-hidden="true" />La solución la escribes tú</li>
        </ol>
        <div class="flex flex-col items-center gap-4">
          <TutorMascota :tamano="140" forma="completa" aria-hidden="true" />
          <p class="m-0 max-w-[420px] px-[18px] py-3.5 rounded-[18px_18px_18px_4px] bg-base-blanco border border-base-borde-sutil text-base leading-relaxed">
            <span class="block text-[11px] font-bold tracking-[.08em] etiqueta-tutor">TUTOR</span>
            Tu área ya pasa las pruebas. El perímetro falla con base 3 y altura 2: ¿cuántas veces pasas por la altura?
          </p>
        </div>
      </div>
    </section>

    <section id="repasos" class="seccion bg-base-blanco" aria-labelledby="titulo-repasos">
      <EncabezadoSeccion id="titulo-repasos" etiqueta="REPASOS" titulo="Lo que aprendes vuelve"
        texto="La repetición espaciada: repasas justo cuando lo empiezas a olvidar, y cada repaso llega un poco más lejos." />
      <div class="grid md:grid-cols-[auto_1fr] gap-12 items-center">
        <span class="relative inline-block pt-[60px] pr-[60px] justify-self-center" aria-hidden="true">
          <span v-for="(e, i) in ECOS" :key="i" class="eco" :style="{ '--d': `${e.d}px`, opacity: e.o, animationDelay: `${e.t}s`, borderWidth: `${e.b}px` }" />
          <span class="relative"><TutorMascota :tamano="120" forma="completa" /></span>
        </span>
        <div class="flex flex-col gap-3.5">
          <p v-for="r in REPASOS" :key="r.texto" class="m-0 flex items-center gap-3.5 text-lg font-semibold">
            <span class="barra-repaso" :style="{ width: `min(${r.ancho}px, 40vw)`, opacity: r.o }" aria-hidden="true" />{{ r.texto }}
          </p>
          <p class="mt-1.5 mb-0 text-base leading-relaxed text-base-texto-secundario">Sin rachas diarias ni presión: los repasos se ordenan solos y te avisan cuando toca.</p>
        </div>
      </div>
    </section>

    <section id="docentes" class="seccion" aria-labelledby="titulo-docentes">
      <EncabezadoSeccion id="titulo-docentes" etiqueta="DOCENTES" titulo="Para docentes" texto="Una herramienta flexible: STIRE propone, tú decides." />
      <div class="grid lg:grid-cols-2 gap-10 items-center">
        <img src="/inicio/v3-docente.webp" alt="El docente ve qué le cuesta a la clase y quién necesita ayuda" width="1280" height="720" loading="lazy"
          class="w-full rounded-[20px] border border-base-borde-sutil">
        <div class="flex flex-col gap-3.5">
          <p v-for="d in DOCENTE" :key="d" class="m-0 flex gap-3 text-[17px] leading-normal"><Check :size="20" class="shrink-0 mt-0.5 marca-ok" aria-hidden="true" /><span>{{ d }}</span></p>
          <div class="flex items-center gap-3">
            <NuxtLink :to="{ path: '/auth/register', query: { rol: 'docente' } }" class="boton-principal">Soy docente</NuxtLink>
            <DocenteAsistenteLibreta :tamano="44" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>

    <section id="accesibilidad" class="seccion bg-base-blanco" aria-labelledby="titulo-accesible">
      <EncabezadoSeccion id="titulo-accesible" etiqueta="ACCESIBILIDAD" titulo="Para todas las personas"
        texto="Accesible (WCAG 2.1 AA) y cómodo en cualquier pantalla. Se instala en el celular desde el navegador." />
      <ul class="m-0 p-0 list-none flex flex-wrap gap-3">
        <li v-for="a in ACCESIBLE" :key="a" class="px-[18px] py-3 rounded-[14px] bg-base-blanco border border-base-borde-sutil font-semibold">{{ a }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const EncabezadoSeccion = defineComponent({
  props: { id: String, etiqueta: String, titulo: String, texto: String },
  setup: (p) => () => h('div', { class: 'max-w-[820px]' }, [
    h('p', { class: 'm-0 text-[13px] font-bold tracking-[.08em] etiqueta-seccion' }, p.etiqueta),
    h('h2', { id: p.id, class: 'mt-1.5 mb-0 font-poppins font-bold text-[32px] sm:text-[40px] leading-[1.15]' }, p.titulo),
    h('p', { class: 'mt-2.5 mb-0 text-lg leading-relaxed text-base-texto-secundario' }, p.texto),
  ]),
})

const PASOS = [
  { titulo: 'Entra a tu clase', texto: 'Con el código que te da tu docente. Ves tu siguiente paso apenas entras.', img: '/inicio/v3-inicio.webp', alt: 'Inicio del estudiante: su siguiente paso y su camino' },
  { titulo: 'Practica con ayuda por pasos', texto: 'Si te equivocas, el Tutor te da una pista, luego una pregunta y al final te dice dónde mirar.', img: '/inicio/v3-tutor.webp', alt: 'Un ejercicio con el Tutor dando una pista' },
  { titulo: 'Repasa justo a tiempo', texto: 'Lo que aprendes vuelve cuando lo empiezas a olvidar; cada repaso, un poco más lejos.', img: '/inicio/v3-repasos.webp', alt: 'Repasos: lo que vuelve justo a tiempo' },
]
const AYUDAS = [
  { paso: 'Pista', ejemplo: '«Revisa la línea 4.»' },
  { paso: 'Pregunta', ejemplo: '«¿Cuántas veces sumas la altura?»' },
  { paso: 'Dónde mirar', ejemplo: '«Solo se duplica la base.»' },
]
const ECOS = [{ d: 15, o: 0.9, t: 0, b: 3 }, { d: 32, o: 0.5, t: 0.45, b: 3 }, { d: 54, o: 0.25, t: 1.2, b: 2 }]
const REPASOS = [
  { texto: 'Al día siguiente', ancho: 40, o: 1 },
  { texto: 'A los 3 días', ancho: 110, o: 0.75 },
  { texto: 'A la semana', ancho: 240, o: 0.5 },
  { texto: 'A las 3 semanas', ancho: 420, o: 0.3 },
]
const DOCENTE = [
  'Ves qué le cuesta a la clase y quién necesita ayuda, antes de la próxima sesión.',
  'Creas tu clase por partes con el Asistente: él propone, tú decides.',
  'Calificas y pasas asistencia desde el celular, con QR o a mano.',
  'Todo es opcional: el Tutor, los logros y las alertas se ajustan por clase.',
]
const ACCESIBLE = ['Tema oscuro', '4 temas de alto contraste', 'Texto más grande', 'Reducir el movimiento', 'Escuchar la lección', 'Subtítulos', 'Teclado completo']
</script>

<style scoped>
.seccion { display: flex; flex-direction: column; gap: 28px; padding: 56px 16px; scroll-margin-top: 76px; }
@media (min-width: 640px) { .seccion { padding: 72px 80px; } }
.numero {
  flex: none; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  font-weight: 700; background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco));
}
.numero-sol { width: 40px; height: 40px; border-radius: 11px; font-size: 18px; background: #b45309; color: #fff; }
.solucion { background: rgb(var(--c-semantico-pasa) / 0.12); color: rgb(var(--c-semantico-pasa)); }
.etiqueta-tutor { color: rgb(var(--c-sec-lila)); }
/* En oscuro, el tono fuerte no llega a 4,5:1 sobre el fondo: va la versión clara (la de los íconos del menú). */
:root[data-tema='oscuro'] .etiqueta-tutor { color: rgb(var(--c-sec-lila-icono)); }
.marca-ok { color: rgb(var(--c-semantico-pasa)); }
.barra-repaso { flex: none; height: 14px; border-radius: 9px; background: #00c2a8; }
.eco {
  position: absolute; left: 3px; top: 63px; width: 171px; height: 117px; border-radius: 21px; border-style: solid;
  border-color: #00c2a8; transform: translate(var(--d), calc(var(--d) * -1)); animation: eco-ola 2.6s ease-out 3 both;
}
@keyframes eco-ola { 0% { opacity: 0; transform: translate(0, 0); } 25% { opacity: 0.85; } 100% { opacity: 0; transform: translate(var(--d), calc(var(--d) * -1)); } }
@media (prefers-reduced-motion: reduce) { .eco { animation: none; } }
.boton-principal {
  display: inline-flex; align-items: center; min-height: 52px; padding: 0 22px; border-radius: 14px; font-weight: 700;
  background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco));
}
</style>

<style>
/* La etiqueta de cada sección la dibuja EncabezadoSeccion (render propio): va sin scoped. En oscuro, la versión clara. */
.etiqueta-seccion { color: rgb(var(--c-sec-menta)); }
:root[data-tema='oscuro'] .etiqueta-seccion { color: rgb(var(--c-sec-menta-icono)); }
</style>
