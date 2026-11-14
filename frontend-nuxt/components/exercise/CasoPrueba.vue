<!-- Un caso público de un ejercicio de programar: qué entra, qué debe salir, qué mostró el programa y qué revisar.
     10/10 (Jeider, «Área y perímetro»): la entrada no se veía (tras «Probar código» el título cambiaba a «Ejemplo 1»),
     «12» y «14» se leían «12 14» en una sola línea y un SyntaxError decía «la primera diferencia está en la línea 1».
     Ahora la entrada siempre está, los saltos de línea se respetan y el error dice su línea (utils/diagnosticoSalida.ts). -->
<template>
  <!-- v3 (13/11, cuadro «E-Ejercicio-Casos»): «Cumple» o «Todavía no» con el nombre del caso; lo que entra, lo que debía
       mostrar y lo que mostró solo se despliega en el que todavía no cumple, con «Lo que pasa» y qué repasar. -->
  <div class="caso-prueba rounded-xl border overflow-hidden" :class="tc.passed === true ? 'caso-cumple' : tc.passed === false ? 'caso-falta' : 'caso-sin'">
    <div class="flex items-center justify-between gap-2 px-3 min-h-[40px] text-[13px] font-bold">
      <span v-if="tc.passed === true" class="inline-flex items-center gap-1 texto-menta">
        <Check :size="15" aria-hidden="true" /> Cumple
      </span>
      <span v-else-if="tc.passed === false" class="inline-flex items-center gap-1 texto-sol">
        <X :size="14" aria-hidden="true" /> Todavía no coincide
      </span>
      <span v-else class="text-base-texto-secundario text-xs font-semibold">Sin probar</span>
      <span class="text-right">{{ tc.nombre || `Caso #${tc.id}` }}</span>
    </div>

    <div v-if="tc.passed !== true" class="px-3 pb-3 space-y-2">
      <div class="grid grid-cols-3 gap-2 text-xs font-codigo">
        <div>
          <span class="text-base-texto-secundario text-[11px] block font-sans">Entra:</span>
          <span class="block whitespace-pre-wrap break-words font-bold">{{ tc.input || '(nada)' }}</span>
        </div>
        <div>
          <span class="text-base-texto-secundario text-[11px] block font-sans">Debe salir:</span>
          <span class="block whitespace-pre-wrap break-words font-bold">{{ tc.expectedOutput }}</span>
        </div>
        <div>
          <span class="text-base-texto-secundario text-[11px] block font-sans">Tu código mostró:</span>
          <span class="block whitespace-pre-wrap break-words"
            :class="tc.passed === false ? 'font-bold texto-sol' : 'text-base-texto-secundario'">{{ tc.actualOutput || '—' }}</span>
        </div>
      </div>

      <!-- Qué revisar: el error de concepto más probable, sin dar la solución (MOD-02 y MOD-04) -->
      <div v-if="diagnostico" class="rounded-lg bg-base-blanco p-2.5 text-[13px] text-base-texto-primario leading-relaxed space-y-1.5">
        <p class="m-0">
          <strong>Lo que pasa:</strong> {{ diagnostico.mensaje }}
          <template v-if="!tc.actualOutput && limiteMs"> Si tarda más de {{ limiteMs }} ms (un bucle infinito), se corta.</template>
        </p>
        <!-- Qué repasar, con un ejemplo de otro problema (utils/conceptosEjercicio.ts). -->
        <details v-if="repasar" class="text-xs">
          <summary class="cursor-pointer min-h-[32px] inline-flex items-center gap-1 font-semibold underline underline-offset-2">
            <BookMarked :size="13" aria-hidden="true" /> Repasa: {{ repasar.titulo }}
          </summary>
          <p class="mt-1 mb-0">{{ repasar.idea }}</p>
          <pre class="mt-1.5 mb-0 font-mono bg-editor-bg text-editor-text rounded px-2 py-1.5 overflow-x-auto whitespace-pre">{{ repasar.ejemplo }}</pre>
        </details>
        <!-- Ítem 29: el Tutor ve el caso que falló (su último «Probar código»); va al final: primero, entenderlo. -->
        <button type="button" class="min-h-[32px] px-1.5 -ml-1.5 rounded-md text-xs font-semibold text-semantico-info underline underline-offset-2 hover:bg-semantico-info/10" @click="pedirAyuda">
          Pedir ayuda al Tutor
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookMarked, Check, X } from 'lucide-vue-next'
import type { TestCase } from '~/types'
import type { Diagnostico } from '~/utils/diagnosticoSalida'
import { CONCEPTOS } from '~/utils/conceptosEjercicio'
import { useTutorStore } from '~/stores/tutor'

const props = defineProps<{ tc: TestCase; diagnostico: Diagnostico | null; limiteMs?: number | null }>()
const repasar = computed(() => (props.diagnostico?.repasar ? CONCEPTOS[props.diagnostico.repasar] : null))
const pedirAyuda = () => useTutorStore().openDrawer({ conPregunta: true })
</script>

<style scoped>
.caso-cumple { border-color: rgb(var(--c-sec-menta-fondo)); background: rgb(var(--c-sec-menta-fondo) / 0.6); }
.caso-falta { border-color: #ffc94d; background: rgb(var(--c-sec-sol-fondo) / 0.7); }
.caso-sin { border-color: rgb(var(--c-base-borde-sutil)); background: rgb(var(--c-base-bg-secundario) / 0.4); }
</style>
