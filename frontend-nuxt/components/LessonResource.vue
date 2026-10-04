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
  <div v-else class="space-y-2">
    <div v-if="insertable" class="relative w-full overflow-hidden rounded-lg border border-base-borde-sutil bg-base-bg-secundario" :style="{ aspectRatio: proporcion }">
      <iframe
        :src="insertable"
        :title="title || nombreProveedor"
        loading="lazy"
        class="absolute inset-0 h-full w-full"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms"
        allow="fullscreen; encrypted-media; picture-in-picture; clipboard-write"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin" />
    </div>
    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-base-texto-secundario">
      <span class="inline-flex items-center gap-1 font-semibold"><component :is="icono" :size="12" aria-hidden="true" /> {{ nombreProveedor }}</span>
      <a v-if="enlace" :href="enlace" target="_blank" rel="noopener noreferrer"
        class="inline-flex items-center gap-1 font-semibold text-acento-ambar-fuerte hover:underline">
        {{ insertable ? '¿No carga? Ábrelo en otra pestaña' : 'Abrir el recurso' }} <ExternalLink :size="11" aria-hidden="true" />
      </a>
      <!-- Alternativa si el recurso externo no abre: el Tutor explica lo mismo (UI-04) -->
      <button v-if="insertable && enLeccion" type="button" class="inline-flex items-center gap-1 font-semibold text-stire-purple hover:underline" @click="pedirAlTutor">
        <Sparkles :size="11" aria-hidden="true" /> Pedirle al Tutor que lo explique
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTutorStore } from '~/stores/tutor'
import { ExternalLink, FileText, Link2, Presentation, PlayCircle, Sparkles } from 'lucide-vue-next'
import { NOMBRE_PROVEEDOR, urlEnlace, urlImagen, urlInsertable } from '~/utils/recursoSeguro'

// Muestra una lección de tipo video, pdf, image o embed (paso 6, multimedia). Las lecciones de texto siguen en Markdown.
const props = defineProps<{ type: string; title?: string; metadata?: Record<string, unknown> | null }>()
const imagenFallo = ref(false)
const route = useRoute()
const enLeccion = computed(() => route.path.startsWith('/estudiante/unidad/'))
async function pedirAlTutor() {
  const tutor = useTutorStore()
  await tutor.openDrawer()
  await tutor.sendMessage(`No me carga el recurso «${props.title || 'de la lección'}». ¿Me explicas lo que muestra?`)
}

const config = useRuntimeConfig()
const texto = (v: unknown) => (typeof v === 'string' ? v : '')
const proveedor = computed(() => texto(props.metadata?.provider) || 'enlace')
const insertable = computed(() => urlInsertable(props.metadata?.embedUrl))
const enlace = computed(() => urlEnlace(props.metadata?.url))
const imagen = computed(() => urlImagen(props.metadata?.url, String(config.public.apiBase || 'http://localhost:3001')))
const nombreProveedor = computed(() => NOMBRE_PROVEEDOR[proveedor.value] ?? 'Recurso')
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
