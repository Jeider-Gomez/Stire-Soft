<template>
  <!-- Lo que produce un proyecto. «Ampliar» lo pone a pantalla completa para probarlo con calma (y, en una página web,
       con el ancho de un celular, una tableta o un computador). -->
  <section ref="raizRef"
    class="bg-base-blanco border border-base-borde-sutil shadow-sm overflow-hidden flex flex-col"
    :class="ampliado ? 'fixed inset-0 z-[80] rounded-none' : 'rounded-xl min-h-[24rem]'"
    :role="ampliado ? 'dialog' : undefined" :aria-modal="ampliado ? 'true' : undefined" aria-label="Resultado">
    <!-- Barra: página, ancho y ampliar -->
    <div class="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-base-borde-sutil text-[11px]">
      <span class="font-semibold text-base-texto-secundario">{{ tipo === 'web' ? 'Vista previa' : 'Resultado' }}</span>
      <label v-if="tipo === 'web' && paginas.length > 1" class="inline-flex items-center gap-1">
        <span class="sr-only">Página</span>
        <select v-model="pagina" @change="cambiarPagina(pagina)" class="px-1.5 py-1 rounded border border-base-borde-fuerte bg-base-blanco text-[11px]">
          <option v-for="p in paginas" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      <div v-if="ampliado && tipo === 'web'" class="inline-flex rounded-md border border-base-borde-fuerte overflow-hidden" role="group" aria-label="Ancho de la pantalla">
        <button v-for="a in ANCHOS" :key="a.id" type="button" @click="ancho = a.id" :aria-pressed="ancho === a.id"
          class="px-2 py-1 inline-flex items-center gap-1 font-semibold"
          :class="ancho === a.id ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario'">
          <component :is="a.icono" :size="12" aria-hidden="true" /> {{ a.texto }}
        </button>
      </div>
      <span class="ml-auto flex items-center gap-1">
        <button v-if="tipo === 'web'" type="button" @click="recargar" class="px-2 py-1 rounded font-semibold text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario inline-flex items-center gap-1">
          <RotateCcw :size="12" aria-hidden="true" /> Recargar
        </button>
        <button type="button" @click="alternarAmpliado" :aria-pressed="ampliado"
          class="px-2.5 py-1 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1 hover:bg-base-bg-secundario">
          <component :is="ampliado ? Minimize2 : Maximize2" :size="12" aria-hidden="true" /> {{ ampliado ? 'Salir (Esc)' : 'Ampliar' }}
        </button>
      </span>
    </div>

    <template v-if="tipo === 'web'">
      <div class="flex-1 min-h-[16rem] flex justify-center" :class="ampliado && ancho !== 'completo' ? 'bg-base-bg-secundario p-4 overflow-auto' : ''">
        <!-- allow-scripts SIN allow-same-origin: el código corre en un origen aislado y no puede tocar STIRE.
             allow-forms deja enviar formularios (el arranque evita que la vista se recargue); allow-popups abre en
             otra pestaña los enlaces externos. -->
        <iframe :key="vuelta" :srcdoc="vistaPrevia" ref="vistaRef" :title="tituloVista"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox"
          class="bg-white h-full"
          :class="ampliado && ancho !== 'completo' ? 'rounded-lg border border-base-borde-fuerte shadow-sm' : 'w-full'"
          :style="ampliado && ancho !== 'completo' ? { width: ancho === 'celular' ? '375px' : '768px', minHeight: '100%' } : undefined" />
      </div>
      <div class="border-t border-base-borde-sutil bg-editor-bg text-editor-text font-mono text-[11px] p-2 overflow-y-auto"
        :class="ampliado ? 'h-36' : 'h-28'" aria-live="polite" aria-label="Consola de la página">
        <p v-if="consolaWeb.length === 0" class="opacity-60">La consola de la página aparece aquí (console.log).</p>
        <p v-for="(l, i) in consolaWeb" :key="i" :class="l.tipo === 'error' ? 'text-[#f87171]' : l.tipo === 'warn' ? 'text-[#fcd34d]' : ''">{{ l.texto }}</p>
      </div>
    </template>
    <template v-else>
      <div class="p-3 border-b border-base-borde-sutil space-y-2 text-xs">
        <label v-if="tipo === 'pseudocodigo' || tipo === 'diagrama'" for="proyecto-entrada" class="block font-semibold text-base-texto-primario">Entrada: un dato por línea (cada <code>Leer</code> toma la siguiente)</label>
        <label v-else for="proyecto-entrada" class="block font-semibold text-base-texto-primario">Entrada (la lee <code>leerEntrada()</code>)</label>
        <textarea id="proyecto-entrada" v-model="entrada" :rows="ampliado ? 6 : 3" class="w-full px-2 py-1.5 rounded border border-base-borde-fuerte font-mono text-[11px]"></textarea>
        <button type="button" @click="ejecutar" :disabled="ejecutando"
          class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
          <Loader2 v-if="ejecutando" :size="14" class="animate-spin" aria-hidden="true" /><Play v-else :size="14" aria-hidden="true" />
          {{ ejecutando ? 'Ejecutando…' : 'Ejecutar' }}
        </button>
      </div>
      <div class="flex-1 bg-editor-bg text-editor-text font-mono p-3 overflow-y-auto" :class="ampliado ? 'text-sm' : 'text-[11px]'" aria-live="polite" aria-label="Salida del programa">
        <p v-if="!resultado" class="opacity-60">Pulsa «Ejecutar». {{ tipo === 'javascript' ? 'El programa' : 'El algoritmo' }} corre en este navegador, con un límite de 3 segundos.</p>
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
// Lo que produce un proyecto: la vista previa de una página web o la ejecución de un programa de JavaScript o de un
// algoritmo en pseudocódigo, todo en el navegador. Lo usan el editor del estudiante y la revisión del docente.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Laptop, Loader2, Maximize2, Minimize2, Play, RotateCcw, Smartphone, Tablet } from 'lucide-vue-next'
import { archivoReferido, documentoWeb, ejecutarEnNavegador, paginasHtml, type ArchivoProyecto, type ResultadoEjecucion } from '~/utils/proyectoNavegador'
import { traducirPseudocodigo } from '~/utils/pseudocodigo'
import { leerDiagrama, traducirDiagrama } from '~/utils/diagramaFlujo'

const props = withDefaults(defineProps<{ tipo: 'web' | 'javascript' | 'pseudocodigo' | 'diagrama'; archivos: ArchivoProyecto[]; tituloVista?: string }>(), {
  tituloVista: 'Vista previa de la página',
})

const ANCHOS = [
  { id: 'celular', texto: 'Celular', icono: Smartphone },
  { id: 'tableta', texto: 'Tableta', icono: Tablet },
  { id: 'completo', texto: 'Computador', icono: Laptop },
] as const

const entrada = ref('')
const ejecutando = ref(false)
const resultado = ref<ResultadoEjecucion | null>(null)
const vistaPrevia = ref('')
const vistaRef = ref<HTMLIFrameElement | null>(null)
const raizRef = ref<HTMLElement | null>(null)
const consolaWeb = ref<Array<{ tipo: string; texto: string }>>([])
const ampliado = ref(false)
const ancho = ref<(typeof ANCHOS)[number]['id']>('completo')
const vuelta = ref(0)

// Varias páginas: la que se ve y lo que la página guardó en localStorage (se conserva al pasar de una a otra).
const paginas = computed(() => paginasHtml(props.archivos))
const pagina = ref(paginas.value[0] ?? 'index.html')
let ancla = ''
let almacen: Record<string, string> = {}

function actualizarVista() {
  if (props.tipo !== 'web') return
  consolaWeb.value = []
  if (!paginas.value.includes(pagina.value)) pagina.value = paginas.value[0] ?? 'index.html'
  vistaPrevia.value = documentoWeb(props.archivos, true, { pagina: pagina.value, almacen, ancla })
  ancla = ''
}

function cambiarPagina(nombre: string, enAncla = '') {
  pagina.value = nombre
  ancla = enAncla
  actualizarVista()
}

/** «Recargar» empieza de cero: sin lo guardado en localStorage. */
function recargar() {
  almacen = {}
  vuelta.value++
  actualizarVista()
}

// La vista se rehace 600 ms después del último cambio, para no recargar la página a cada tecla.
let relojVista: ReturnType<typeof setTimeout> | null = null
watch(() => JSON.stringify(props.archivos), () => {
  if (relojVista) clearTimeout(relojVista)
  relojVista = setTimeout(actualizarVista, 600)
})

/** Solo se aceptan mensajes del iframe de la vista previa (no de cualquier ventana). */
function recibirMensaje(e: MessageEvent) {
  if (e.source !== vistaRef.value?.contentWindow) return
  const datos = e.data as { stireProyecto?: boolean; tipo?: string; texto?: string; pagina?: string; ancla?: string; datos?: unknown }
  if (!datos?.stireProyecto) return
  if (datos.tipo === 'navegar') {
    const destino = paginas.value.find((p) => p.toLowerCase() === archivoReferido(String(datos.pagina ?? '')))
    if (destino) cambiarPagina(destino, String(datos.ancla ?? ''))
    else consolaWeb.value.push({ tipo: 'error', texto: `El enlace lleva a «${String(datos.pagina ?? '').slice(0, 80)}», que no es una página de este proyecto.` })
    return
  }
  if (datos.tipo === 'almacen') {
    const d = datos.datos
    if (d && typeof d === 'object' && JSON.stringify(d).length < 100_000) almacen = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, String(v)]))
    return
  }
  if (consolaWeb.value.length >= 200) return
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
  if (props.tipo === 'diagrama') {
    // El diagrama (diagrama.json) se recorre figura por figura; un error dice en qué figura está.
    const archivo = props.archivos.find((a) => a.nombre.endsWith('.json'))
    const lectura = leerDiagrama(archivo?.contenido ?? '')
    const t = lectura.ok ? traducirDiagrama(lectura.diagrama) : null
    resultado.value = t?.ok
      ? await ejecutarEnNavegador(t.js, entrada.value)
      : { lineas: [{ tipo: 'error', texto: !lectura.ok ? lectura.mensaje : t && !t.ok ? `Figura ${t.error.figura}: ${t.error.mensaje}` : '' }], tiempoAgotado: false, ms: 0 }
    ejecutando.value = false
    return
  }
  // Todos los .js del proyecto, en orden: los demás archivos pueden definir funciones que usa main.js.
  const codigo = props.archivos.filter((a) => a.nombre.endsWith('.js')).map((a) => a.contenido).join('\n;\n')
  resultado.value = await ejecutarEnNavegador(codigo, entrada.value)
  ejecutando.value = false
}

// ─── Ampliar: pantalla completa dentro de STIRE, Esc para salir ───
function alternarAmpliado() {
  ampliado.value = !ampliado.value
  document.body.style.overflow = ampliado.value ? 'hidden' : ''
  if (!ampliado.value) ancho.value = 'completo'
  nextTick(() => raizRef.value?.querySelector<HTMLElement>('button[aria-pressed]')?.focus())
}
function teclado(e: KeyboardEvent) {
  if (e.key === 'Escape' && ampliado.value) alternarAmpliado()
}

onMounted(() => {
  actualizarVista()
  window.addEventListener('message', recibirMensaje)
  window.addEventListener('keydown', teclado)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', recibirMensaje)
  window.removeEventListener('keydown', teclado)
  if (relojVista) clearTimeout(relojVista)
  document.body.style.overflow = ''
})
</script>
