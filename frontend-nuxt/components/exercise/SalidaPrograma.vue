<!-- El panel «Salida» bajo el editor de un ejercicio de programar (P48 y P49, 31/10/2026, Jeider en «Saludo personalizado»).
     P48: siempre a la vista; antes de probar dice qué va a aparecer ahí y que probar no gasta intentos (entregar sí); después muestra lo
     que escribió el programa junto a lo que se esperaba. Se puede ocultar y mostrar («se desplegó y no pude quitarla»).
     P49: «Probar con mis datos»: el estudiante escribe lo que entra y ve lo que mostró su programa, con el mismo juez que califica.
     02/11 (Jeider): este panel solo muestra el resultado; la comparación y qué revisar están en «Casos de prueba» (ResumenCasos.vue y CasoPrueba.vue).
     «Mis datos» sí explica su error: esa prueba no pasa por los casos. utils/salidaPrograma.ts y composables/useProbarConMisDatos.ts. -->
<template>
  <section
    class="flex-shrink-0 overflow-y-auto border-t border-editor-border bg-editor-header text-editor-text text-xs"
    :class="plegada ? '' : 'max-h-[46%]'"
    aria-labelledby="salida-titulo">
    <!-- El botón flotante del Tutor queda abajo a la derecha: el panel le deja sitio (md:pr-40 y md:pb-16) para que no tape «Mostrar» ni «Ejecutar». Mide unos 140 px con su margen (01/11: con md:pr-24 tapaba «Mostrar» al plegar). -->
    <div class="flex items-center justify-between gap-2 px-4 md:pr-40 py-1.5" :class="plegada ? '' : 'border-b border-editor-border'">
      <h3 id="salida-titulo" class="inline-flex items-center gap-1.5 font-bold text-white">
        <Terminal :size="13" aria-hidden="true" /> Salida de tu programa
      </h3>
      <div class="flex items-center gap-2">
        <span class="hidden sm:inline text-[10px] text-editor-muted">Probar no gasta intentos · Entregar sí</span>
        <button
          type="button"
          class="min-h-[28px] px-2 rounded-md inline-flex items-center gap-1 font-semibold text-[#7dd3fc] hover:bg-white/10"
          :aria-expanded="!plegada"
          aria-controls="salida-cuerpo"
          @click="$emit('plegar', !plegada)">
          <component :is="plegada ? ChevronUp : ChevronDown" :size="13" aria-hidden="true" />
          {{ plegada ? 'Mostrar' : 'Ocultar' }}
        </button>
      </div>
    </div>

    <div v-show="!plegada" id="salida-cuerpo" class="px-4 py-2 md:pb-16 space-y-3">
      <div class="space-y-2" role="status" aria-live="polite">
        <p v-if="!resumen.caso" class="leading-relaxed text-editor-muted">{{ textoDeConsola(resumen) }}</p>

        <template v-if="resumen.caso">
          <p v-if="resumen.caso.nombre" class="font-sans font-semibold text-white">{{ resumen.caso.nombre }}</p>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-codigo">
            <div>
              <dt class="text-[10px] text-editor-muted font-sans">Entró</dt>
              <dd class="whitespace-pre-wrap break-words text-[#fcd34d]">{{ resumen.caso.input || '(nada)' }}</dd>
            </div>
            <div>
              <dt class="text-[10px] text-editor-muted font-sans">Tu programa mostró</dt>
              <dd class="whitespace-pre-wrap break-words text-white">{{ resumen.caso.actualOutput || '(no mostró nada)' }}</dd>
            </div>
          </dl>
          <button
            type="button"
            class="min-h-[32px] px-2 -ml-2 rounded-md font-semibold text-[#7dd3fc] hover:bg-white/10 underline underline-offset-2"
            @click="$emit('ver-casos')">
            Ver la comparación en «Casos de prueba»
          </button>
        </template>
      </div>

      <!-- P49: probar con los datos que el estudiante escribe, sin casos y sin gastar intentos. Si el programa no recibe nada, no hay qué escribir. -->
      <form v-if="recibeDatos" class="space-y-1.5 pt-2 border-t border-editor-border" @submit.prevent="ejecutar">
        <label for="mis-datos" class="block font-bold text-white">Probar con mis datos</label>
        <p id="mis-datos-ayuda" class="text-[10px] text-editor-muted">
          Escribe lo que entra, una línea por cada dato que pide tu programa (por ejemplo, un nombre). No se califica ni gasta intentos.
        </p>
        <div class="flex items-start gap-2">
          <textarea
            id="mis-datos"
            v-model="entrada"
            rows="2"
            maxlength="5000"
            spellcheck="false"
            aria-describedby="mis-datos-ayuda"
            placeholder="Ana"
            class="flex-1 min-w-0 px-2 py-1.5 rounded-md bg-editor-bg border border-editor-border text-editor-text font-codigo text-xs focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]"
            @keydown.ctrl.enter.prevent="ejecutar" />
          <button
            type="submit"
            :disabled="ejecutandoPropio"
            class="min-h-[44px] sm:min-h-[36px] px-3 rounded-md font-bold bg-[#0e7490] text-white hover:bg-[#0891b2] disabled:opacity-60 inline-flex items-center gap-1.5 whitespace-nowrap">
            <Loader2 v-if="ejecutandoPropio" :size="13" class="animate-spin" aria-hidden="true" />
            <Play v-else :size="13" aria-hidden="true" />
            Ejecutar
          </button>
        </div>
        <div role="status" aria-live="polite" class="space-y-1">
          <p v-if="fallo" class="text-[#f87171]">{{ fallo }}</p>
          <template v-else-if="resultado">
            <p class="text-[10px] text-editor-muted font-sans">
              {{ resultado.status === 'ok' ? 'Tu programa mostró' : resultado.status === 'time_limit' ? 'Tu programa se cortó por tardar demasiado' : 'Tu programa se detuvo con un error' }}
            </p>
            <pre v-if="resultado.status === 'ok'" class="whitespace-pre-wrap break-words font-codigo text-[#5eead4] m-0">{{ resultado.output || '(no mostró nada)' }}</pre>
            <pre v-else class="whitespace-pre-wrap break-words font-codigo text-[#f87171] m-0">{{ resultado.error || resultado.output || '(sin detalle)' }}</pre>
            <p v-if="errorExplicado" class="font-sans leading-relaxed text-editor-text">{{ errorExplicado }}</p>
          </template>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronUp, Loader2, Play, Terminal } from 'lucide-vue-next'
import { useProbarConMisDatos } from '~/composables/useProbarConMisDatos'
import { diagnosticarError } from '~/utils/diagnosticoSalida'
import { resumenDeSalida, textoDeConsola, type CasoDeSalida } from '~/utils/salidaPrograma'

const props = defineProps<{ casos: ReadonlyArray<CasoDeSalida>; ejecutando: boolean; plegada: boolean }>()
defineEmits<{ 'ver-casos': []; plegar: [valor: boolean] }>()

const resumen = computed(() => resumenDeSalida(props.casos, props.ejecutando))
const recibeDatos = computed(() => props.casos.length === 0 || props.casos.some((c) => !!c.input))
// `ejecutando` ya es la propiedad (la prueba de los ejemplos); la del composable es la de «mis datos».
const { entrada, resultado, ejecutando: ejecutandoPropio, fallo, ejecutar } = useProbarConMisDatos()
const errorExplicado = computed(() => {
  const r = resultado.value
  return r && r.status === 'error' ? diagnosticarError(r.error || r.output || '')?.mensaje ?? null : null
})
</script>
