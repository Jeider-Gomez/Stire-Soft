<template>
  <!-- «¿Te sirvió esta explicación?» (UI-04, Caro 2015: curaduría con la valoración del estudiante). Con «No», el Tutor la
       explica de otra forma y el docente ve qué lecciones no se entienden: el curso se mejora con el uso. -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3" aria-labelledby="valorar-titulo">
    <div class="flex flex-wrap items-center gap-3">
      <h2 id="valorar-titulo" class="text-sm font-bold text-base-texto-primario flex-1 min-w-[12rem]">¿Te sirvió esta explicación?</h2>
      <div class="flex gap-2" role="group" aria-labelledby="valorar-titulo">
        <button
          type="button"
          class="min-h-[44px] px-4 rounded-md border text-xs font-bold inline-flex items-center gap-1.5"
          :class="voto === true ? 'bg-semantico-pasa/10 border-semantico-pasa text-semantico-pasa' : 'border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario'"
          :aria-pressed="voto === true"
          :disabled="guardando"
          @click="valorar(true)">
          <ThumbsUp :size="15" aria-hidden="true" /> Sí, me sirvió
        </button>
        <button
          type="button"
          class="min-h-[44px] px-4 rounded-md border text-xs font-bold inline-flex items-center gap-1.5"
          :class="voto === false ? 'bg-red-50 border-red-300 text-red-700' : 'border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario'"
          :aria-pressed="voto === false"
          :disabled="guardando"
          @click="valorar(false)">
          <ThumbsDown :size="15" aria-hidden="true" /> No me quedó claro
        </button>
      </div>
    </div>

    <p v-if="voto === true" role="status" class="text-xs text-slate-600">¡Gracias! Tu respuesta ayuda a tu docente a mejorar el curso.</p>

    <div v-if="voto === false" class="space-y-2">
      <label for="valorar-comentario" class="block text-xs font-semibold text-base-texto-primario">¿Qué no quedó claro? <span class="font-normal text-slate-600">(opcional; tu docente lo ve sin tu nombre)</span></label>
      <textarea id="valorar-comentario" v-model="comentario" v-crece rows="2" maxlength="300" class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-fuerte bg-base-blanco" placeholder="Por ejemplo: no entendí para qué sirve el contador" />
      <div class="flex flex-wrap gap-2">
        <button type="button" class="min-h-[44px] px-4 rounded-md bg-stire-purple text-white text-xs font-bold inline-flex items-center gap-1.5" @click="otraExplicacion">
          <Sparkles :size="14" aria-hidden="true" /> Que el Tutor me lo explique de otra forma
        </button>
        <button type="button" class="min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold" :disabled="guardando" @click="valorar(false)">
          Enviar a mi docente
        </button>
      </div>
      <!-- UI-01 y UI-04: otra vía de la misma lección (escucharla, el diagrama o el paso a paso), sin esperar al docente -->
      <p class="text-[11px] text-slate-600">
        También puedes <a href="#escuchar-leccion" class="font-semibold text-acento-ambar-fuerte hover:underline">escucharla</a> con el botón «Escuchar» junto al título, o ver el algoritmo como diagrama o paso a paso.
      </p>
      <p v-if="enviado" role="status" class="text-xs text-slate-600">Enviado. Gracias: así tu docente sabe qué explicar mejor.</p>
    </div>
    <p v-if="error" role="alert" class="text-xs font-semibold text-red-700">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Sparkles, ThumbsDown, ThumbsUp } from 'lucide-vue-next'
import { useTutorStore } from '~/stores/tutor'

const props = defineProps<{ unitId: number }>()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const tutorStore = useTutorStore()

const voto = ref<boolean | null>(null)
const comentario = ref('')
const guardando = ref(false)
const enviado = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const mia = await api.get<{ util: boolean; comentario: string | null } | null>(`/valoraciones/leccion/${props.unitId}/mia`)
    if (mia) { voto.value = mia.util; comentario.value = mia.comentario ?? '' }
  } catch { /* sin voto previo o sin conexión: se puede votar igual */ }
})

async function valorar(util: boolean) {
  guardando.value = true
  error.value = null
  enviado.value = false
  try {
    await api.put(`/valoraciones/leccion/${props.unitId}`, util ? { util } : { util, comentario: comentario.value.trim() || undefined })
    const yaEraNo = voto.value === false
    voto.value = util
    if (!util && yaEraNo) enviado.value = true
  } catch (e) {
    error.value = messageOf(e, 'No se pudo guardar tu respuesta. Intenta de nuevo.')
  } finally {
    guardando.value = false
  }
}

async function otraExplicacion() {
  if (voto.value !== false || comentario.value.trim()) await valorar(false)
  await tutorStore.pedirOtraExplicacion(comentario.value)
}
</script>
