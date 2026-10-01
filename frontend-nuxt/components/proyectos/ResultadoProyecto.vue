<template>
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden flex flex-col min-h-[24rem]" aria-label="Resultado">
    <template v-if="tipo === 'web'">
      <div class="px-3 py-2 border-b border-base-borde-sutil text-[11px] font-semibold text-base-texto-secundario">Vista previa (se actualiza sola)</div>
      <!-- allow-scripts SIN allow-same-origin: el código corre en un origen aislado y no puede tocar STIRE. -->
      <iframe :srcdoc="vistaPrevia" sandbox="allow-scripts allow-modals" :title="tituloVista" class="flex-1 w-full min-h-[16rem] bg-white" ref="vistaRef" />
      <div class="border-t border-base-borde-sutil bg-editor-bg text-editor-text font-mono text-[11px] p-2 h-28 overflow-y-auto" aria-live="polite" aria-label="Consola de la página">
        <p v-if="consolaWeb.length === 0" class="opacity-60">La consola de la página aparece aquí (console.log).</p>
        <p v-for="(l, i) in consolaWeb" :key="i" :class="l.tipo === 'error' ? 'text-[#f87171]' : l.tipo === 'warn' ? 'text-[#fcd34d]' : ''">{{ l.texto }}</p>
      </div>
    </template>
    <template v-else>
      <div class="p-3 border-b border-base-borde-sutil space-y-2 text-xs">
        <label v-if="tipo === 'pseudocodigo'" for="proyecto-entrada" class="block font-semibold text-base-texto-primario">Entrada: un dato por línea (cada <code>Leer</code> toma la siguiente)</label>
        <label v-else for="proyecto-entrada" class="block font-semibold text-base-texto-primario">Entrada (la lee <code>leerEntrada()</code>)</label>
        <textarea id="proyecto-entrada" v-model="entrada" rows="3" class="w-full px-2 py-1.5 rounded border border-base-borde-fuerte font-mono text-[11px]"></textarea>
        <button type="button" @click="ejecutar" :disabled="ejecutando"
          class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
          <Loader2 v-if="ejecutando" :size="14" class="animate-spin" aria-hidden="true" /><Play v-else :size="14" aria-hidden="true" />
          {{ ejecutando ? 'Ejecutando…' : 'Ejecutar' }}
        </button>
      </div>
      <div class="flex-1 bg-editor-bg text-editor-text font-mono text-[11px] p-3 overflow-y-auto" aria-live="polite" aria-label="Salida del programa">
        <p v-if="!resultado" class="opacity-60">Pulsa «Ejecutar». {{ tipo === 'pseudocodigo' ? 'El algoritmo' : 'El programa' }} corre en este navegador, con un límite de 3 segundos.</p>
        <template v-else>
          <p v-for="(l, i) in resultado.lineas" :key="i" class="whitespace-pre-wrap" :class="l.tipo === 'error' ? 'text-[#f87171]' : l.tipo === 'warn' ? 'text-[#fcd34d]' : ''">{{ l.texto }}</p>
          <p v-if="resultado.tiempoAgotado" class="text-[#f87171] mt-1">Se detuvo a los 3 segundos: revisa si hay un bucle que no termina.</p>
          <p class="opacity-60 mt-1">— terminó en {{ resultado.ms }} ms</p>
        </template>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
// Lo que produce un proyecto: la vista previa de una página web o la ejecución de un programa de JavaScript, ambas en el
// navegador. Lo usan el editor del estudiante y la revisión del docente.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Loader2, Play } from 'lucide-vue-next'
import { documentoWeb, ejecutarEnNavegador, type ArchivoProyecto, type ResultadoEjecucion } from '~/utils/proyectoNavegador'
import { traducirPseudocodigo } from '~/utils/pseudocodigo'

const props = withDefaults(defineProps<{ tipo: 'web' | 'javascript' | 'pseudocodigo'; archivos: ArchivoProyecto[]; tituloVista?: string }>(), {
  tituloVista: 'Vista previa de la página',
})

const entrada = ref('')
const ejecutando = ref(false)
const resultado = ref<ResultadoEjecucion | null>(null)
const vistaPrevia = ref('')
const vistaRef = ref<HTMLIFrameElement | null>(null)
const consolaWeb = ref<Array<{ tipo: string; texto: string }>>([])

function actualizarVista() {
  if (props.tipo !== 'web') return
  consolaWeb.value = []
  vistaPrevia.value = documentoWeb(props.archivos, true)
}

// La vista se rehace 600 ms después del último cambio, para no recargar la página a cada tecla.
let relojVista: ReturnType<typeof setTimeout> | null = null
watch(() => JSON.stringify(props.archivos), () => {
  if (relojVista) clearTimeout(relojVista)
  relojVista = setTimeout(actualizarVista, 600)
})

/** Solo se aceptan mensajes del iframe de la vista previa (no de cualquier ventana). */
function recibirConsola(e: MessageEvent) {
  if (e.source !== vistaRef.value?.contentWindow) return
  const datos = e.data as { stireProyecto?: boolean; tipo?: string; texto?: string }
  if (!datos?.stireProyecto || consolaWeb.value.length >= 200) return
  consolaWeb.value.push({ tipo: String(datos.tipo), texto: String(datos.texto ?? '').slice(0, 2000) })
}

async function ejecutar() {
  ejecutando.value = true
  if (props.tipo === 'pseudocodigo') {
    // El algoritmo (el primer .psc) se traduce a JavaScript; si algo no se entiende, se dice la línea sin ejecutar.
    const algoritmo = props.archivos.find((a) => a.nombre.endsWith('.psc')) ?? props.archivos[0]
    const t = traducirPseudocodigo(algoritmo?.contenido ?? '')
    resultado.value = t.ok
      ? await ejecutarEnNavegador(t.js, entrada.value)
      : { lineas: [{ tipo: 'error', texto: `Línea ${t.error.linea}: ${t.error.mensaje}` }], tiempoAgotado: false, ms: 0 }
    ejecutando.value = false
    return
  }
  // Todos los .js del proyecto, en orden: los demás archivos pueden definir funciones que usa main.js.
  const codigo = props.archivos.filter((a) => a.nombre.endsWith('.js')).map((a) => a.contenido).join('\n;\n')
  resultado.value = await ejecutarEnNavegador(codigo, entrada.value)
  ejecutando.value = false
}

onMounted(() => {
  actualizarVista()
  window.addEventListener('message', recibirConsola)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', recibirConsola)
  if (relojVista) clearTimeout(relojVista)
})
</script>
