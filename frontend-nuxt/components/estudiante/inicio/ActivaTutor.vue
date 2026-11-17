<template>
  <!-- Invitación a activar el Tutor al empezar (17/11, Pedro y Jeider): si se deja para cuando falla un ejercicio, sacar la
       clave corta el aprendizaje, sobre todo en el celular. Se recomienda, no se obliga: «Ahora no» la oculta para siempre
       y el Tutor la vuelve a pedir cuando se abra. Solo sale si el servidor dijo que no hay clave (no ante un error). -->
  <section v-if="visible" class="activa-tutor flex flex-wrap items-center gap-4 p-5 rounded-2xl border border-base-borde-sutil bg-base-blanco shadow-sm"
    aria-labelledby="activa-tutor-titulo">
    <span class="shrink-0 hidden sm:block" aria-hidden="true"><TutorMascota expresion="contento" :tamano="64" /></span>
    <!-- Se acomoda al espacio que le queda (con el Tutor abierto al lado es poco), no al ancho de la pantalla. -->
    <div class="flex-1 basis-64 min-w-0 space-y-1">
      <h2 id="activa-tutor-titulo" class="m-0 text-base font-bold text-base-texto-primario">Activa tu Tutor antes de empezar</h2>
      <p class="m-0 text-sm text-base-texto-secundario leading-relaxed">
        Te explica cuando algo no sale, sin darte la respuesta. Necesita una clave gratuita de Google que se pone una sola vez:
        hazlo ahora y no te interrumpe en mitad de un ejercicio.
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="boton-principal min-h-[44px] px-4 rounded-xl inline-flex items-center gap-1.5 text-sm font-bold" @click="activar">
        <Sparkles :size="16" aria-hidden="true" /> Activar el Tutor
      </button>
      <button type="button" class="min-h-[44px] px-3 rounded-xl text-sm font-semibold text-base-texto-primario hover:bg-base-bg-secundario" @click="despues">
        Ahora no
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useTutorStore } from '~/stores/tutor'

const tutorStore = useTutorStore()
const authStore = useAuthStore()
const clave = () => `stire-activa-tutor-oculta-${authStore.user?.id ?? 'anonimo'}`
const oculta = ref(true)

onMounted(async () => {
  try { oculta.value = localStorage.getItem(clave()) === '1' } catch { oculta.value = false }
  if (!oculta.value && tutorStore.hasKey === null) await tutorStore.fetchApiKeyStatus()
})

const visible = computed(() => !oculta.value && tutorStore.hasKey === false && tutorStore.claveConsultada)

function activar() {
  tutorStore.openDrawer()
}
function despues() {
  oculta.value = true
  try { localStorage.setItem(clave(), '1') } catch { /* solo se pierde el recuerdo */ }
}
</script>
