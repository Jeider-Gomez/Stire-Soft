<template>
  <!-- Encuesta SUS (UX-08; utils/sus.ts). 10 afirmaciones, de 1 a 5, en una sola página: son 2 minutos. Cada afirmación es
       un grupo de radios con su leyenda; los botones miden 44 px. Si falta alguna, el error va junto a ella y el foco
       también (PAT-03). -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-5 sm:p-6 shadow-sm space-y-5" aria-labelledby="encuesta-titulo">
    <header class="space-y-1">
      <h1 id="encuesta-titulo" class="text-xl font-bold text-base-texto-primario tracking-tight">Encuesta de usabilidad</h1>
      <p class="text-xs text-slate-600">
        10 afirmaciones sobre cómo te ha parecido usar STIRE. Marca qué tan de acuerdo estás con cada una. Son unos 2 minutos
        y nos dicen qué mejorar. No hay respuestas buenas ni malas.
      </p>
    </header>

    <p v-if="cargando" class="text-xs text-slate-600">Cargando…</p>

    <div v-else-if="hecho !== null" role="status" class="rounded-lg border border-semantico-pasa/30 bg-semantico-pasa/5 p-4 space-y-1">
      <p class="text-sm font-bold text-base-texto-primario inline-flex items-center gap-1.5"><CircleCheck :size="16" class="text-semantico-pasa" aria-hidden="true" /> Gracias por responder</p>
      <p class="text-xs text-slate-700">Tu respuesta da {{ formato(hecho) }} de 100 en la escala SUS. Con las de todos sabremos qué mejorar primero.</p>
    </div>

    <div v-else-if="estado && !estado.puedeResponder" class="rounded-lg border border-base-borde-sutil bg-base-bg-secundario p-4">
      <p class="text-xs text-slate-700">Ya respondiste el {{ fechaLarga(estado.ultima) }}. Gracias: podrás volver a responderla en unos meses, cuando haya cambios que medir.</p>
    </div>

    <form v-else class="space-y-4" novalidate @submit.prevent="enviar">
      <p class="text-[11px] text-slate-600" aria-live="polite">Respondidas: {{ 10 - faltan.length }} de 10</p>
      <fieldset v-for="(a, i) in AFIRMACIONES_SUS" :id="`sus-${i}`" :key="i" tabindex="-1"
        class="rounded-lg border p-3 space-y-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-acento-ambar-fuerte"
        :class="errores && respuestas[i] === null ? 'border-semantico-falla/60 bg-semantico-falla/5' : 'border-base-borde-sutil'"
        :aria-describedby="errores && respuestas[i] === null ? `sus-${i}-falta` : undefined">
        <legend class="sr-only">Afirmación {{ i + 1 }}: {{ a }}</legend>
        <p class="text-sm text-base-texto-primario" aria-hidden="true"><span class="font-semibold">{{ i + 1 }}.</span> {{ a }}</p>
        <div class="grid grid-cols-5 gap-1.5">
          <label v-for="op in ESCALA_SUS" :key="op.valor"
            class="min-h-[44px] flex items-center justify-center rounded-md border text-sm font-bold cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-acento-ambar-fuerte"
            :class="respuestas[i] === op.valor ? 'bg-acento-ambar-fuerte text-base-blanco border-acento-ambar-fuerte' : 'border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario'">
            <input v-model="respuestas[i]" type="radio" :name="`sus-${i}`" :value="op.valor" class="sr-only" />
            <span aria-hidden="true">{{ op.valor }}</span>
            <span class="sr-only">{{ op.valor }}: {{ op.texto }}</span>
          </label>
        </div>
        <div class="flex justify-between text-[10px] text-slate-600" aria-hidden="true"><span>Muy en desacuerdo</span><span>Muy de acuerdo</span></div>
        <p v-if="errores && respuestas[i] === null" :id="`sus-${i}-falta`" class="text-[11px] font-semibold text-semantico-falla">Falta esta respuesta.</p>
      </fieldset>

      <div class="space-y-1">
        <label for="sus-comentario" class="block text-xs font-semibold text-base-texto-primario">¿Qué cambiarías primero? <span class="font-normal text-slate-600">(opcional)</span></label>
        <textarea id="sus-comentario" v-model="comentario" rows="3" maxlength="500"
          class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none" />
      </div>

      <p v-if="error" role="alert" class="text-xs font-semibold text-semantico-falla">{{ error }}</p>
      <button type="submit" :disabled="enviando" class="min-h-[44px] px-5 rounded-md bg-acento-ambar-fuerte text-base-blanco text-sm font-bold disabled:opacity-50">
        {{ enviando ? 'Enviando…' : 'Enviar respuestas' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { CircleCheck } from 'lucide-vue-next'
import { AFIRMACIONES_SUS, ESCALA_SUS, faltantesSus, type EstadoSus } from '~/utils/sus'

const api = useApi()
const respuestas = ref<Array<number | null>>(Array(10).fill(null))
const comentario = ref('')
const estado = ref<EstadoSus | null>(null)
const cargando = ref(true)
const enviando = ref(false)
const errores = ref(false)
const error = ref('')
const hecho = ref<number | null>(null)
const faltan = computed(() => faltantesSus(respuestas.value))

const formato = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 })
const fechaLarga = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' }) : '')

onMounted(async () => {
  try {
    estado.value = await api.get<EstadoSus>('/usabilidad/sus/estado')
  } catch {
    estado.value = null
  } finally {
    cargando.value = false
  }
})

async function enviar() {
  error.value = ''
  if (faltan.value.length) {
    errores.value = true
    await nextTick()
    document.getElementById(`sus-${faltan.value[0]}`)?.focus()
    return
  }
  enviando.value = true
  try {
    const r = await api.post<{ puntaje: number }>('/usabilidad/sus', { respuestas: respuestas.value, ...(comentario.value.trim() ? { comentario: comentario.value.trim() } : {}) })
    hecho.value = r.puntaje
  } catch {
    error.value = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.'
  } finally {
    enviando.value = false
  }
}
</script>
