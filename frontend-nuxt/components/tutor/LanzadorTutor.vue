<template>
  <!-- Lanzador del Tutor: abajo a la derecha, con su nombre, en el mismo sitio en todas las pantallas y siempre a la
       vista (P-UI-04 en docs/investigacion/referentes/PATRONES_DE_INTERFAZ.md). Recomendación de José: «cambiar la
       ventana o el acceso al Tutor hacia una zona más natural y cómoda para la interacción constante». La ventana ya
       es un panel al lado (P-UI-06); el acceso es este botón. Antes estaba en el encabezado: en el celular era un ícono
       sin nombre y en el ejercicio se iba con el scroll. Al bajar por la página se reduce al ícono (como «Redactar» de
       Gmail) para no tapar los botones de la derecha; al subir, o cerca del inicio, vuelve a decir «Tutor». -->
  <!-- Rediseño 26/10 (con apple-design y emil-design-eng): antes una píldora morada donde la mascota morada se perdía.
       Ahora una superficie clara y translúcida que flota sobre la página, con la mascota a tamaño completo y el nombre;
       responde al presionar (escala 0,97) y se levanta solo con ratón. -->
  <button
    v-if="!tutorStore.isOpen"
    id="lanzador-tutor"
    :class="[{ 'sobre-barra': sobreBarra, 'hidden md:inline-flex': soloComputador }, compacto ? 'p-1.5' : 'pl-1.5 pr-4 py-1.5']"
    type="button"
    class="lanzador-tutor fixed right-4 sm:right-6 z-40 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-base-texto-primario focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stire-purple/40"
    aria-label="Abrir el Tutor IA"
    @click="tutorStore.openDrawer()"
    @mouseenter="encima = true"
    @mouseleave="encima = false">
    <TutorMascota :expresion="expresion" :tamano="34" mirar-cursor aria-hidden="true" />
    <span v-if="!compacto">Tutor</span>
  </button>
  <!-- Burbuja: el Tutor habla solo en dos momentos que lo merecen: tras tres fallos seguidos ofrece ayuda, y al acertar
       felicita. Se va sola; tocarla abre el chat. -->
  <Transition name="burbuja">
    <button v-if="burbuja && !tutorStore.isOpen" type="button" class="burbuja-tutor fixed right-4 sm:right-6 z-40 max-w-[16rem]"
      :class="{ 'sobre-barra': sobreBarra, 'hidden md:block': soloComputador }" role="status" @click="tutorStore.openDrawer()">
      <TutorGlobo cola="abajo-derecha" superficie="flotante">{{ burbuja }}</TutorGlobo>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTutorStore } from '~/stores/tutor'

// En el ejercicio, en el celular, Probar y Entregar van en una barra fija abajo: el lanzador sube para no taparla.
// En el ejercicio, en el celular, el Tutor va en la cabecera (layouts/workspace.vue) y el flotante solo en computador.
defineProps<{ sobreBarra?: boolean; soloComputador?: boolean }>()
const tutorStore = useTutorStore()
// Al pasar el puntero por encima se alegra de verte (ojos de arco y un pequeño rebote).
const encima = ref(false)
const expresion = useExpresionTutor(undefined, encima)
const burbuja = ref<string | null>(null)
let finBurbuja: ReturnType<typeof setTimeout> | undefined
watch(expresion, (e) => {
  const texto = e === 'animo' ? '¿Te ayudo con este ejercicio? Puedo darte una pista.' : e === 'acierto' ? '¡Bien hecho! Pasaron las pruebas.' : null
  if (!texto) return
  burbuja.value = texto
  clearTimeout(finBurbuja)
  finBurbuja = setTimeout(() => { burbuja.value = null }, e === 'animo' ? 7000 : 2800)
})
onBeforeUnmount(() => clearTimeout(finBurbuja))

/**
 * Compacto mientras se baja; la página puede desplazarse en la ventana o en el contenedor principal. En pantallas de
 * menos de 380 px (José, S09-JO01: en celulares pequeños quedaba cerca de «Continuar») va siempre como ícono, como el
 * botón de chat de Intercom o el FAB normal de Material: con texto ocupa casi un tercio del ancho.
 */
const compacto = ref(false)
let estrecho = false
let anterior = 0
function alDesplazar(e: Event) {
  const t = e.target
  const y = t instanceof HTMLElement ? t.scrollTop : window.scrollY
  compacto.value = estrecho || (y > 120 && y > anterior)
  anterior = y
}
function alCambiarAncho() {
  estrecho = window.innerWidth < 380
  compacto.value = estrecho
}
onMounted(() => {
  alCambiarAncho()
  window.addEventListener('resize', alCambiarAncho, { passive: true })
  document.addEventListener('scroll', alDesplazar, { capture: true, passive: true })
})
onBeforeUnmount(() => window.removeEventListener('resize', alCambiarAncho))
onBeforeUnmount(() => document.removeEventListener('scroll', alDesplazar, { capture: true }))
</script>

<style scoped>
/* Material claro y translúcido que flota sobre la página (en oscuro y alto contraste lo dan los tokens del tema). */
.lanzador-tutor {
  background: rgb(var(--c-base-blanco) / 0.88);
  backdrop-filter: blur(16px) saturate(170%);
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  border: 1px solid rgb(var(--c-base-borde-sutil));
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 10px 28px -8px rgb(11 61 145 / 0.28);
}
.lanzador-tutor { transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms ease; }
.lanzador-tutor:active { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) {
  .lanzador-tutor:hover { transform: translateY(-2px); box-shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 16px 34px -10px rgb(11 61 145 / 0.36); }
}
.burbuja-tutor { bottom: calc(4.75rem + env(safe-area-inset-bottom)); transform-origin: 100% 100%; }
@media (min-width: 640px) { .burbuja-tutor { bottom: 5.25rem; } }
@media (max-width: 767px) { .burbuja-tutor.sobre-barra { bottom: calc(9.25rem + env(safe-area-inset-bottom)); } }
.burbuja-enter-active { transition: opacity 220ms ease-out, transform 220ms cubic-bezier(0.23, 1, 0.32, 1); }
.burbuja-leave-active { transition: opacity 160ms ease-in, transform 160ms ease-in; }
.burbuja-enter-from, .burbuja-leave-to { opacity: 0; transform: translateY(6px) scale(0.96); }
@media (prefers-reduced-motion: reduce) {
  .lanzador-tutor, .lanzador-tutor:active, .lanzador-tutor:hover { transition: none; transform: none; }
  .burbuja-enter-from, .burbuja-leave-to { transform: none; }
}
@media (prefers-reduced-transparency: reduce) {
  .lanzador-tutor { background: rgb(var(--c-base-blanco)); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
.lanzador-tutor {
  bottom: calc(1rem + env(safe-area-inset-bottom));
}
@media (min-width: 640px) {
  .lanzador-tutor { bottom: 1.5rem; }
}
@media (max-width: 767px) {
  .lanzador-tutor.sobre-barra { bottom: calc(5.5rem + env(safe-area-inset-bottom)); }
}
</style>
