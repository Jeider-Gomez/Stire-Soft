<template>
  <!-- Un algoritmo de la lección en tres formatos (UI-01): pseudocódigo, diagrama de flujo y paso a paso en palabras.
       El estudiante elige y STIRE recuerda su preferencia (utils/algoritmoMultiformato.ts). Si el pseudocódigo no se
       puede leer (bloques sin cerrar), se muestra solo el texto: nunca un diagrama equivocado. -->
  <figure class="rounded-lg border border-base-borde-sutil bg-base-blanco overflow-hidden">
    <div v-if="arbol" role="tablist" aria-label="Formato del algoritmo" class="flex flex-wrap gap-1 p-1.5 bg-base-bg-secundario border-b border-base-borde-sutil">
      <button
        v-for="f in FORMATOS"
        :id="`${uid}-tab-${f.valor}`"
        :key="f.valor"
        type="button"
        role="tab"
        :aria-selected="formato === f.valor"
        :aria-controls="`${uid}-panel`"
        :tabindex="formato === f.valor ? 0 : -1"
        class="min-h-[36px] px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5"
        :class="formato === f.valor ? 'bg-base-blanco text-acento-ambar-fuerte shadow-sm border border-base-borde-sutil' : 'text-slate-600 hover:text-base-texto-primario'"
        @click="elegir(f.valor)"
        @keydown.right.prevent="mover(1)"
        @keydown.left.prevent="mover(-1)">
        <component :is="f.icono" :size="14" aria-hidden="true" /> {{ f.texto }}
      </button>
    </div>

    <div :id="`${uid}-panel`" role="tabpanel" :aria-labelledby="arbol ? `${uid}-tab-${formato}` : undefined" class="p-3">
      <pre v-if="!arbol || formato === 'texto'" class="text-xs font-codigo leading-relaxed whitespace-pre-wrap text-base-texto-primario">{{ codigo }}</pre>

      <div v-else-if="formato === 'diagrama'" class="overflow-x-auto">
        <!-- SVG armado con los textos escapados (diagramaDeFlujo): seguro con v-html -->
        <div class="mx-auto w-fit" role="img" :aria-label="`Diagrama de flujo: ${resumen}`" v-html="diagrama!.svg" />
      </div>

      <ol v-else class="text-xs text-base-texto-primario space-y-1.5">
        <PasoAlgoritmo v-for="p in pasos" :key="p.numero" :paso="p" />
      </ol>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'
import { Code2, ListOrdered, Workflow } from 'lucide-vue-next'
import { diagramaDeFlujo, leerAlgoritmo, pasoAPaso } from '~/utils/algoritmoMultiformato'

type Formato = 'texto' | 'diagrama' | 'pasos'
const FORMATOS = [
  { valor: 'texto' as const, texto: 'Pseudocódigo', icono: Code2 },
  { valor: 'diagrama' as const, texto: 'Diagrama de flujo', icono: Workflow },
  { valor: 'pasos' as const, texto: 'Paso a paso', icono: ListOrdered },
]
const CLAVE = 'stire:formato-algoritmo'

const props = defineProps<{ codigo: string }>()
const uid = useId()
const arbol = computed(() => leerAlgoritmo(props.codigo))
const diagrama = computed(() => (arbol.value ? diagramaDeFlujo(arbol.value) : null))
const pasos = computed(() => (arbol.value ? pasoAPaso(arbol.value) : []))
const resumen = computed(() => pasos.value.map((p) => p.texto).join(' '))

const formato = ref<Formato>('texto')
onMounted(() => {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'texto' || guardado === 'diagrama' || guardado === 'pasos') formato.value = guardado
  } catch { /* sin almacenamiento: queda el pseudocódigo */ }
})

function elegir(f: Formato) {
  formato.value = f
  try { localStorage.setItem(CLAVE, f) } catch { /* no es crítico */ }
}
function mover(d: number) {
  const i = FORMATOS.findIndex((f) => f.valor === formato.value)
  const sig = FORMATOS[(i + d + FORMATOS.length) % FORMATOS.length].valor
  elegir(sig)
  document.getElementById(`${uid}-tab-${sig}`)?.focus()
}
</script>
