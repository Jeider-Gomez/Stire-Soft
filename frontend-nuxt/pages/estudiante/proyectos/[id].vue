<template>
  <div class="max-w-7xl mx-auto space-y-4">
    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Abriendo el proyecto…
    </p>
    <p v-else-if="error && !proyecto" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

    <template v-else-if="proyecto">
      <!-- Cabecera -->
      <header class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink to="/estudiante/proyectos" class="p-1.5 rounded borde-afordancia shrink-0" aria-label="Volver a mis proyectos" title="Volver">
            <ArrowLeft :size="16" aria-hidden="true" />
          </NuxtLink>
          <label for="proyecto-nombre" class="sr-only">Nombre del proyecto</label>
          <input id="proyecto-nombre" v-model="proyecto.titulo" maxlength="100" @change="guardarTitulo"
            class="min-w-0 flex-1 text-sm font-bold text-base-texto-primario bg-transparent border-b border-transparent hover:border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none px-1 py-0.5" />
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span role="status" class="text-[11px] inline-flex items-center gap-1"
            :class="estadoGuardado === 'error' ? 'text-semantico-falla font-semibold' : 'text-base-texto-secundario'">
            <Loader2 v-if="estadoGuardado === 'guardando'" :size="12" class="animate-spin" aria-hidden="true" />
            <Check v-else-if="estadoGuardado === 'guardado'" :size="12" aria-hidden="true" />
            {{ textoGuardado }}
          </span>
          <span class="text-[11px] text-base-texto-secundario">{{ kb(bytes) }} de 200 KB</span>
          <button type="button" @click="descargarZip" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1">
            <Download :size="13" aria-hidden="true" /> .zip
          </button>
          <button v-if="proyecto.tipo === 'web'" type="button" @click="descargarHtml" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1">
            <Download :size="13" aria-hidden="true" /> .html
          </button>
        </div>
      </header>
      <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Archivos y editor -->
        <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden flex flex-col min-h-[24rem]" aria-label="Código">
          <div class="flex items-center gap-1 border-b border-base-borde-sutil px-2 py-1.5 overflow-x-auto text-[11px]" role="tablist" aria-label="Archivos">
            <button v-for="(a, i) in proyecto.archivos" :key="a.nombre" type="button" role="tab" :aria-selected="i === actual"
              @click="actual = i"
              class="px-2.5 py-1 rounded font-mono whitespace-nowrap"
              :class="i === actual ? 'bg-acento-ambar/15 text-acento-ambar-fuerte font-bold' : 'text-base-texto-secundario hover:bg-base-bg-secundario'">
              {{ a.nombre }}
            </button>
            <button v-if="proyecto.archivos.length < 10" type="button" @click="agregando = true"
              class="p-1 rounded text-base-texto-secundario hover:bg-base-bg-secundario" aria-label="Agregar archivo" title="Agregar archivo">
              <Plus :size="14" aria-hidden="true" />
            </button>
          </div>
          <form v-if="agregando" novalidate @submit.prevent="agregarArchivo" class="flex items-center gap-2 px-3 py-2 border-b border-base-borde-sutil text-[11px]">
            <label for="nuevo-archivo" class="font-semibold">Nombre</label>
            <input id="nuevo-archivo" ref="nuevoArchivoRef" v-model="nombreNuevo" :placeholder="proyecto.tipo === 'web' ? 'otra.css' : 'util.js'"
              class="flex-1 px-2 py-1 rounded border border-base-borde-fuerte font-mono" />
            <button type="submit" class="px-2 py-1 rounded bg-acento-ambar-fuerte text-base-blanco font-bold">Agregar</button>
            <button type="button" @click="agregando = false" class="px-2 py-1 rounded borde-afordancia">Cancelar</button>
          </form>
          <div class="flex-1 min-h-0">
            <CodeEditor :key="archivoActual.nombre" v-model="archivoActual.contenido" :language="lenguaje(archivoActual.nombre)"
              :aria-label="`Código de ${archivoActual.nombre}`" min-height="22rem" class="w-full h-full" />
          </div>
          <div class="flex items-center justify-between px-3 py-1.5 border-t border-base-borde-sutil text-[11px] text-base-texto-secundario">
            <span>Esc y luego Tab para salir del editor.</span>
            <button v-if="proyecto.archivos.length > 1" type="button" @click="quitarArchivo" class="hover:text-semantico-falla inline-flex items-center gap-1">
              <Trash2 :size="12" aria-hidden="true" /> Quitar {{ archivoActual.nombre }}
            </button>
          </div>
        </section>

        <!-- Resultado -->
        <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden flex flex-col min-h-[24rem]" aria-label="Resultado">
          <template v-if="proyecto.tipo === 'web'">
            <div class="px-3 py-2 border-b border-base-borde-sutil text-[11px] font-semibold text-base-texto-secundario">Vista previa (se actualiza sola)</div>
            <!-- allow-scripts SIN allow-same-origin: el código corre en un origen aislado y no puede tocar STIRE. -->
            <iframe :srcdoc="vistaPrevia" sandbox="allow-scripts allow-modals" title="Vista previa de tu página" class="flex-1 w-full min-h-[16rem] bg-white" ref="vistaRef" />
            <div class="border-t border-base-borde-sutil bg-editor-bg text-editor-text font-mono text-[11px] p-2 h-28 overflow-y-auto" aria-live="polite" aria-label="Consola de la página">
              <p v-if="consolaWeb.length === 0" class="opacity-60">La consola de tu página aparece aquí (console.log).</p>
              <p v-for="(l, i) in consolaWeb" :key="i" :class="l.tipo === 'error' ? 'text-[#f87171]' : l.tipo === 'warn' ? 'text-[#fcd34d]' : ''">{{ l.texto }}</p>
            </div>
          </template>
          <template v-else>
            <div class="p-3 border-b border-base-borde-sutil space-y-2 text-xs">
              <label for="proyecto-entrada" class="block font-semibold text-base-texto-primario">Entrada (la lee <code>leerEntrada()</code>)</label>
              <textarea id="proyecto-entrada" v-model="entrada" rows="3" class="w-full px-2 py-1.5 rounded border border-base-borde-fuerte font-mono text-[11px]"></textarea>
              <button type="button" @click="ejecutar" :disabled="ejecutando"
                class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
                <Loader2 v-if="ejecutando" :size="14" class="animate-spin" aria-hidden="true" /><Play v-else :size="14" aria-hidden="true" />
                {{ ejecutando ? 'Ejecutando…' : 'Ejecutar' }}
              </button>
            </div>
            <div class="flex-1 bg-editor-bg text-editor-text font-mono text-[11px] p-3 overflow-y-auto" aria-live="polite" aria-label="Salida del programa">
              <p v-if="!resultado" class="opacity-60">Pulsa «Ejecutar». Tu programa corre en tu navegador, con un límite de 3 segundos.</p>
              <template v-else>
                <p v-for="(l, i) in resultado.lineas" :key="i" class="whitespace-pre-wrap" :class="l.tipo === 'error' ? 'text-[#f87171]' : l.tipo === 'warn' ? 'text-[#fcd34d]' : ''">{{ l.texto }}</p>
                <p v-if="resultado.tiempoAgotado" class="text-[#f87171] mt-1">Se detuvo a los 3 segundos: revisa si hay un bucle que no termina.</p>
                <p class="opacity-60 mt-1">— terminó en {{ resultado.ms }} ms</p>
              </template>
            </div>
          </template>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowLeft, Check, Download, Loader2, Play, Plus, Trash2 } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { crearZip } from '~/utils/zip'
import { documentoWeb, ejecutarEnNavegador, type ArchivoProyecto, type ResultadoEjecucion } from '~/utils/proyectoNavegador'

definePageMeta({ layout: 'student' })

interface Proyecto { id: number; titulo: string; tipo: 'web' | 'javascript'; archivos: ArchivoProyecto[] }

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()

const proyecto = ref<Proyecto | null>(null)
const cargando = ref(true)
const error = ref<string | null>(null)
const actual = ref(0)
const estadoGuardado = ref<'guardado' | 'pendiente' | 'guardando' | 'error'>('guardado')
const agregando = ref(false)
const nombreNuevo = ref('')
const nuevoArchivoRef = ref<HTMLInputElement | null>(null)
const entrada = ref('')
const ejecutando = ref(false)
const resultado = ref<ResultadoEjecucion | null>(null)
const vistaPrevia = ref('')
const vistaRef = ref<HTMLIFrameElement | null>(null)
const consolaWeb = ref<Array<{ tipo: string; texto: string }>>([])

const archivoActual = computed(() => proyecto.value!.archivos[Math.min(actual.value, proyecto.value!.archivos.length - 1)]!)
const bytes = computed(() => new TextEncoder().encode(JSON.stringify(proyecto.value?.archivos ?? [])).length)
const kb = (n: number) => `${Math.round(n / 1024)} KB`
const textoGuardado = computed(() => ({ guardado: 'Guardado', pendiente: 'Cambios sin guardar', guardando: 'Guardando…', error: 'No se pudo guardar' })[estadoGuardado.value])

function lenguaje(nombre: string) {
  const ext = nombre.split('.').pop()
  return ext === 'html' ? 'html' : ext === 'css' ? 'css' : ext === 'js' ? 'javascript' : 'text'
}

onMounted(async () => {
  try {
    proyecto.value = await api.get<Proyecto>(`/proyectos/${Number(route.params.id)}`)
    actualizarVista()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo abrir el proyecto.')
  } finally {
    cargando.value = false
  }
  window.addEventListener('message', recibirConsola)
  window.addEventListener('beforeunload', avisarSinGuardar)
})

// Guardado automático: 2 s después de dejar de escribir. Las ediciones durante un guardado se guardan en el siguiente.
let reloj: ReturnType<typeof setTimeout> | null = null
let relojVista: ReturnType<typeof setTimeout> | null = null
watch(() => proyecto.value && JSON.stringify(proyecto.value.archivos), (nuevo, viejo) => {
  if (!viejo || nuevo === viejo) return
  estadoGuardado.value = 'pendiente'
  if (reloj) clearTimeout(reloj)
  reloj = setTimeout(guardarArchivos, 2000)
  if (relojVista) clearTimeout(relojVista)
  relojVista = setTimeout(actualizarVista, 600)
})

async function guardarArchivos() {
  if (!proyecto.value) return
  estadoGuardado.value = 'guardando'
  const enviados = JSON.stringify(proyecto.value.archivos)
  try {
    await api.patch(`/proyectos/${proyecto.value.id}`, { archivos: proyecto.value.archivos })
    error.value = null
    estadoGuardado.value = JSON.stringify(proyecto.value.archivos) === enviados ? 'guardado' : 'pendiente'
  } catch (err) {
    estadoGuardado.value = 'error'
    error.value = messageOf(err, 'No se pudo guardar. Tus cambios siguen en pantalla: descárgalos si el problema sigue.')
  }
}

async function guardarTitulo() {
  if (!proyecto.value) return
  try {
    await api.patch(`/proyectos/${proyecto.value.id}`, { titulo: proyecto.value.titulo })
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cambiar el nombre.')
  }
}

function avisarSinGuardar(e: BeforeUnloadEvent) {
  if (estadoGuardado.value === 'pendiente' || estadoGuardado.value === 'guardando') e.preventDefault()
}

onBeforeUnmount(() => {
  window.removeEventListener('message', recibirConsola)
  window.removeEventListener('beforeunload', avisarSinGuardar)
  if (reloj) { clearTimeout(reloj); if (estadoGuardado.value === 'pendiente') guardarArchivos() }
  if (relojVista) clearTimeout(relojVista)
})

function actualizarVista() {
  if (proyecto.value?.tipo !== 'web') return
  consolaWeb.value = []
  vistaPrevia.value = documentoWeb(proyecto.value.archivos, true)
}

/** Solo se aceptan mensajes del iframe de la vista previa (no de cualquier ventana). */
function recibirConsola(e: MessageEvent) {
  if (e.source !== vistaRef.value?.contentWindow) return
  const datos = e.data as { stireProyecto?: boolean; tipo?: string; texto?: string }
  if (!datos?.stireProyecto || consolaWeb.value.length >= 200) return
  consolaWeb.value.push({ tipo: String(datos.tipo), texto: String(datos.texto ?? '').slice(0, 2000) })
}

async function ejecutar() {
  if (!proyecto.value) return
  ejecutando.value = true
  // Todos los .js del proyecto, en orden: los demás archivos pueden definir funciones que usa main.js.
  const codigo = proyecto.value.archivos.filter((a) => a.nombre.endsWith('.js')).map((a) => a.contenido).join('\n;\n')
  resultado.value = await ejecutarEnNavegador(codigo, entrada.value)
  ejecutando.value = false
}

function agregarArchivo() {
  if (!proyecto.value) return
  const nombre = nombreNuevo.value.trim()
  const permitidas = proyecto.value.tipo === 'web' ? ['html', 'css', 'js', 'txt'] : ['js', 'txt']
  const m = /^[A-Za-z0-9_-]{1,40}\.([a-z]{1,4})$/.exec(nombre)
  if (!m || !permitidas.includes(m[1]!)) { error.value = `Usa un nombre como «otro.${permitidas[0]}» (letras, números, - o _, y extensión ${permitidas.map((e) => '.' + e).join(', ')}).`; return }
  if (proyecto.value.archivos.some((a) => a.nombre.toLowerCase() === nombre.toLowerCase())) { error.value = `Ya hay un archivo «${nombre}».`; return }
  error.value = null
  proyecto.value.archivos.push({ nombre, contenido: '' })
  actual.value = proyecto.value.archivos.length - 1
  agregando.value = false
  nombreNuevo.value = ''
}
watch(agregando, (abierto) => { if (abierto) nextTick(() => nuevoArchivoRef.value?.focus()) })

function quitarArchivo() {
  if (!proyecto.value || proyecto.value.archivos.length <= 1) return
  proyecto.value.archivos.splice(actual.value, 1)
  actual.value = Math.max(0, actual.value - 1)
}

function descargar(nombre: string, datos: BlobPart, tipo: string) {
  const url = URL.createObjectURL(new Blob([datos], { type: tipo }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const nombreArchivo = () => (proyecto.value?.titulo || 'proyecto').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'proyecto'
function descargarZip() {
  if (proyecto.value) descargar(`${nombreArchivo()}.zip`, crearZip(proyecto.value.archivos), 'application/zip')
}
function descargarHtml() {
  if (proyecto.value) descargar(`${nombreArchivo()}.html`, documentoWeb(proyecto.value.archivos, false), 'text/html')
}
</script>
