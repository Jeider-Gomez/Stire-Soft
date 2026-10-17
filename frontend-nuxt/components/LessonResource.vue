<template>
  <!-- Imagen -->
  <figure v-if="type === 'image'" class="space-y-1">
    <img v-if="imagen && !imagenFallo" :src="imagen" :alt="texto(metadata?.alt)" loading="lazy" decoding="async"
      referrerpolicy="no-referrer" class="max-w-full h-auto rounded-lg border border-base-borde-sutil" @error="imagenFallo = true" />
    <!-- Si la imagen externa falla (UI-04, resiliencia de recursos): su descripción y el enlace, sin romper la lección -->
    <p v-else-if="imagenFallo" role="status" class="p-3 rounded-lg border border-dashed border-base-borde-fuerte text-[11px] text-slate-600">
      No se pudo cargar la imagen<template v-if="texto(metadata?.alt)">: «{{ texto(metadata?.alt) }}»</template>.
      <a :href="imagen!" target="_blank" rel="noopener noreferrer" class="font-semibold text-acento-ambar-fuerte hover:underline">Intentar abrirla</a>
    </p>
    <p v-else class="text-[11px] text-base-texto-secundario">—</p>
    <figcaption v-if="texto(metadata?.caption)" class="text-[11px] text-base-texto-secundario">{{ texto(metadata?.caption) }}</figcaption>
  </figure>

  <!-- Recurso insertado (video, documento, presentación, actividad) o enlace -->
  <div v-else :data-leer-aviso="`Recurso: ${title || 'sin título'}. Ábrelo en la pantalla.`" :data-forma="insertable ? 'recurso' : undefined" tabindex="-1" class="space-y-2">
    <!-- Si YouTube avisa que el video no se puede ver (utils/errorVideo.ts), en vez del recuadro gris: qué pasó y qué hacer. -->
    <div v-if="insertable && videoFallo" role="status" class="rounded-lg border border-dashed border-base-borde-fuerte p-4 space-y-2 text-xs">
      <p class="font-semibold text-base-texto-primario">Este video no se puede ver aquí.</p>
      <p class="text-base-texto-secundario">Puede que su autor no permita verlo fuera de YouTube, que sea privado o que ya no exista.</p>
      <div class="flex flex-wrap gap-2">
        <a v-if="enlace" :href="enlace" target="_blank" rel="noopener noreferrer" class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold text-acento-ambar-fuerte inline-flex items-center gap-1">
          Intentar verlo en YouTube <ExternalLink :size="12" aria-hidden="true" />
        </a>
        <button v-if="enLeccion" type="button" class="min-h-[44px] px-3 rounded-md bg-stire-purple text-white font-semibold inline-flex items-center gap-1" @click="pedirAlTutor">
          <Sparkles :size="12" aria-hidden="true" /> Que el Tutor me explique el tema
        </button>
      </div>
    </div>
    <div v-else-if="insertable" class="relative w-full overflow-hidden rounded-lg border border-base-borde-sutil bg-base-bg-secundario" :style="{ aspectRatio: proporcion }">
      <iframe
        v-if="srcMarco"
        ref="marco"
        :src="srcMarco"
        :title="title || nombreProveedor"
        loading="lazy"
        class="absolute inset-0 h-full w-full"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms"
        allow="fullscreen; encrypted-media; picture-in-picture; clipboard-write"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
        @load="pedirAvisos" />
    </div>
    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-base-texto-secundario">
      <span class="inline-flex items-center gap-1 font-semibold"><component :is="icono" :size="12" aria-hidden="true" /> {{ nombreProveedor }}</span>
      <a v-if="enlace && !videoFallo" :href="enlace" target="_blank" rel="noopener noreferrer"
        class="inline-flex items-center gap-1 font-semibold text-acento-ambar-fuerte hover:underline">
        {{ insertable ? '¿No carga? Ábrelo en otra pestaña' : 'Abrir el recurso' }} <ExternalLink :size="11" aria-hidden="true" />
      </a>
      <!-- Alternativa si el recurso externo no abre: el Tutor explica lo mismo (UI-04) -->
      <button v-if="insertable && enLeccion && !videoFallo" type="button" class="inline-flex items-center gap-1 font-semibold text-stire-purple hover:underline" @click="pedirAlTutor">
        <Sparkles :size="11" aria-hidden="true" /> Pedirle al Tutor que lo explique
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { MENSAJE_ESCUCHO, conAvisoDeErrores, errorDelReproductor } from '~/utils/errorVideo'
import { useTutorStore } from '~/stores/tutor'
import { ExternalLink, FileText, Link2, Presentation, PlayCircle, Sparkles } from 'lucide-vue-next'
import { NOMBRE_PROVEEDOR, urlEnlace, urlImagen, urlInsertable } from '~/utils/recursoSeguro'

// Muestra una lección de tipo video, pdf, image o embed (paso 6, multimedia). Las lecciones de texto siguen en Markdown.
const props = defineProps<{ type: string; title?: string; metadata?: Record<string, unknown> | null }>()
const imagenFallo = ref(false)
const route = useRoute()
const enLeccion = computed(() => route.path.startsWith('/estudiante/unidad/'))
async function pedirAlTutor() {
  await useTutorStore().preguntarPorRecurso(props.title || 'de la lección')
}

const config = useRuntimeConfig()
const texto = (v: unknown) => (typeof v === 'string' ? v : '')
const proveedor = computed(() => texto(props.metadata?.provider) || 'enlace')
const insertable = computed(() => urlInsertable(props.metadata?.embedUrl))
const enlace = computed(() => urlEnlace(props.metadata?.url))
const imagen = computed(() => urlImagen(props.metadata?.url, String(config.public.apiBase || 'http://localhost:3001')))
const nombreProveedor = computed(() => NOMBRE_PROVEEDOR[proveedor.value] ?? 'Recurso')
// El video con sus avisos de error activados; solo en el navegador (necesita el origen de la página).
const marco = ref<HTMLIFrameElement | null>(null)
const srcMarco = ref<string | null>(null)
const videoFallo = ref(false)
let reintentos: ReturnType<typeof setTimeout>[] = []
function pedirAvisos() {
  reintentos.forEach(clearTimeout)
  reintentos = [0, 1000, 3000].map((ms) => setTimeout(() => marco.value?.contentWindow?.postMessage(MENSAJE_ESCUCHO, '*'), ms))
}
function alMensaje(e: MessageEvent) {
  if (!marco.value || e.source !== marco.value.contentWindow) return
  if (errorDelReproductor(e.data, e.origin) !== null) videoFallo.value = true
}
onMounted(() => {
  if (insertable.value) srcMarco.value = conAvisoDeErrores(insertable.value, window.location.origin)
  window.addEventListener('message', alMensaje)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', alMensaje)
  reintentos.forEach(clearTimeout)
})

// Videos y presentaciones son apaisados; un documento o un formulario necesita más alto.
const proporcion = computed(() =>
  ['youtube', 'vimeo', 'google_slides', 'genially', 'canva', 'scratch', 'phet'].includes(proveedor.value) ? '16 / 9' : '4 / 5'
)
const icono = computed(() => {
  if (['youtube', 'vimeo'].includes(proveedor.value)) return PlayCircle
  if (['google_slides', 'canva', 'genially'].includes(proveedor.value)) return Presentation
  if (['scratch', 'phet'].includes(proveedor.value)) return Sparkles
  if (proveedor.value === 'enlace') return Link2
  return FileText
})
</script>
