<template>
  <!-- Un algoritmo de la lección en varios formatos (UI-01): el código del docente, pseudocódigo, diagrama de flujo y
       paso a paso en palabras. El estudiante elige y STIRE recuerda su preferencia (utils/algoritmoMultiformato.ts).
       Si el algoritmo no se puede dibujar con fidelidad, se muestra solo el código: nunca un diagrama equivocado. -->
  <figure class="rounded-lg border border-base-borde-sutil bg-base-blanco overflow-hidden">
    <div v-if="arbol" role="tablist" aria-label="Formato del algoritmo" class="flex flex-wrap gap-1 p-1.5 bg-base-bg-secundario border-b border-base-borde-sutil">
      <button
        v-for="f in formatos"
        :id="`${uid}-tab-${f.valor}`"
        :key="f.valor"
        type="button"
        role="tab"
        :aria-selected="formato === f.valor"
        :aria-controls="`${uid}-panel`"
        :tabindex="formato === f.valor ? 0 : -1"
        class="min-h-[40px] px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5"
        :class="formato === f.valor ? 'bg-base-blanco text-acento-ambar-fuerte shadow-sm border border-base-borde-sutil' : 'text-slate-600 hover:text-base-texto-primario'"
        @click="elegir(f.valor)"
        @keydown.right.prevent="mover(1)"
        @keydown.left.prevent="mover(-1)">
        <component :is="f.icono" :size="14" aria-hidden="true" /> {{ f.texto }}
      </button>
    </div>

    <div :id="`${uid}-panel`" role="tabpanel" :aria-labelledby="arbol ? `${uid}-tab-${formato}` : undefined" class="p-3">
      <pre v-if="!arbol || formato === 'codigo'" class="text-xs font-codigo leading-relaxed whitespace-pre-wrap text-base-texto-primario overflow-x-auto">{{ codigo }}</pre>

      <pre v-else-if="formato === 'pseudo'" class="text-xs font-codigo leading-relaxed whitespace-pre-wrap text-base-texto-primario overflow-x-auto">{{ pseudocodigo }}</pre>

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
import { Braces, Code2, ListOrdered, Workflow } from 'lucide-vue-next'
import { aPseudocodigo, diagramaDeFlujo, leerAlgoritmo, leerJavaScript, pasoAPaso } from '~/utils/algoritmoMultiformato'

type Formato = 'codigo' | 'pseudo' | 'diagrama' | 'pasos'
const CLAVE = 'stire:formato-algoritmo'

const props = withDefaults(defineProps<{ codigo: string; lenguaje?: 'pseudocodigo' | 'javascript' }>(), { lenguaje: 'pseudocodigo' })
const uid = useId()
const esJs = computed(() => props.lenguaje === 'javascript')
const arbol = computed(() => (esJs.value ? leerJavaScript(props.codigo) : leerAlgoritmo(props.codigo)))
const pseudocodigo = computed(() => (arbol.value && esJs.value ? aPseudocodigo(arbol.value) : ''))
const diagrama = computed(() => (arbol.value ? diagramaDeFlujo(arbol.value) : null))
const pasos = computed(() => (arbol.value ? pasoAPaso(arbol.value) : []))
const resumen = computed(() => pasos.value.map((p) => p.texto).join(' '))

// En una lección de JavaScript hay cuatro formatos; en una de pseudocódigo, el «código» ya es el pseudocódigo.
const formatos = computed(() => [
  { valor: 'codigo' as const, texto: esJs.value ? 'Código' : 'Pseudocódigo', icono: esJs.value ? Braces : Code2 },
  ...(esJs.value ? [{ valor: 'pseudo' as const, texto: 'Pseudocódigo', icono: Code2 }] : []),
  { valor: 'diagrama' as const, texto: 'Diagrama de flujo', icono: Workflow },
  { valor: 'pasos' as const, texto: 'Paso a paso', icono: ListOrdered },
])

const formato = ref<Formato>('codigo')
onMounted(() => {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado && formatos.value.some((f) => f.valor === guardado)) formato.value = guardado as Formato
    else if (guardado === 'pseudo') formato.value = 'codigo' // en una lección de pseudocódigo, el código es el pseudocódigo
  } catch { /* sin almacenamiento: queda el código */ }
})

function elegir(f: Formato) {
  formato.value = f
  try { localStorage.setItem(CLAVE, f) } catch { /* no es crítico */ }
}
function mover(d: number) {
  const lista = formatos.value
  const i = lista.findIndex((f) => f.valor === formato.value)
  const sig = lista[(i + d + lista.length) % lista.length].valor
  elegir(sig)
  document.getElementById(`${uid}-tab-${sig}`)?.focus()
}
</script>
