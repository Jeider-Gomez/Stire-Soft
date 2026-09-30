<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="resource-form-title"
      @click.self="emit('cancel')">
      <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
      <form novalidate @submit.prevent="guardar"
        class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
        <h2 id="resource-form-title" class="text-sm font-bold text-base-texto-primario">
          {{ editando ? 'Editar recurso' : 'Nuevo recurso multimedia' }}
        </h2>

        <div>
          <label for="resource-title" class="block font-semibold text-base-texto-primario mb-1">Título</label>
          <input id="resource-title" ref="tituloRef" v-model="titulo" type="text" maxlength="200"
            class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
        </div>

        <fieldset v-if="!editando" class="space-y-1.5">
          <legend class="font-semibold text-base-texto-primario mb-1">¿Qué quieres agregar?</legend>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="tipo" type="radio" value="embed" name="resource-type" class="accent-acento-ambar-fuerte" />
            Video, documento, presentación o actividad (por enlace)
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="tipo" type="radio" value="image" name="resource-type" class="accent-acento-ambar-fuerte" />
            Imagen
          </label>
        </fieldset>

        <!-- Enlace o código para insertar -->
        <div v-if="tipo !== 'image'" class="space-y-1">
          <label for="resource-url" class="block font-semibold text-base-texto-primario">Enlace o código para insertar</label>
          <textarea id="resource-url" v-model="enlace" rows="3" aria-describedby="resource-url-ayuda"
            placeholder="https://view.genial.ly/…  o  <iframe src=&quot;…&quot;></iframe>"
            class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte font-codigo text-[11px] focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
          <p id="resource-url-ayuda" class="text-[11px] text-base-texto-secundario">
            Se muestran dentro de la lección: YouTube, Vimeo, Google Drive (PDF, Word, PowerPoint, videos), Google Docs,
            Slides, Sheets y Forms, Genially, Canva, Scratch, simulaciones PhET y Word o PowerPoint públicos. Otro sitio queda
            como enlace. En Drive, comparte el archivo con «Cualquier persona con el enlace».
          </p>
        </div>

        <!-- Imagen -->
        <div v-else class="space-y-3">
          <fieldset v-if="!editando" class="flex flex-wrap gap-4">
            <legend class="sr-only">Origen de la imagen</legend>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="origenImagen" type="radio" value="subir" name="image-source" class="accent-acento-ambar-fuerte" /> Subir desde mi equipo
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="origenImagen" type="radio" value="enlace" name="image-source" class="accent-acento-ambar-fuerte" /> Enlace de la web
            </label>
          </fieldset>
          <div v-if="origenImagen === 'subir' && !editando">
            <label for="resource-file" class="block font-semibold text-base-texto-primario mb-1">Archivo (PNG, JPG, GIF o WebP; máximo 1 MB)</label>
            <input id="resource-file" type="file" accept="image/png,image/jpeg,image/gif,image/webp" @change="elegirArchivo"
              class="block w-full text-[11px]" />
            <p v-if="cuota" class="text-[11px] text-base-texto-secundario mt-1">
              Usas {{ mb(cuota.usadoBytes) }} de {{ mb(cuota.limiteBytes) }} para imágenes.
            </p>
          </div>
          <div v-else>
            <label for="resource-image-url" class="block font-semibold text-base-texto-primario mb-1">Dirección de la imagen (https://…)</label>
            <input id="resource-image-url" v-model="enlace" type="url"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>
          <div>
            <label for="resource-alt" class="block font-semibold text-base-texto-primario mb-1">Describe la imagen</label>
            <input id="resource-alt" v-model="alt" type="text" maxlength="300" aria-describedby="resource-alt-ayuda"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
            <p id="resource-alt-ayuda" class="text-[11px] text-base-texto-secundario mt-1">Obligatorio: es lo que lee un lector de pantalla a quien no puede verla.</p>
          </div>
          <div>
            <label for="resource-caption" class="block font-semibold text-base-texto-primario mb-1">Pie de imagen (opcional)</label>
            <input id="resource-caption" v-model="pie" type="text" maxlength="300"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>
        </div>

        <p v-if="error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>
        <div class="flex justify-end gap-2">
          <button type="button" @click="emit('cancel')" class="px-4 py-2 rounded-md borde-afordancia font-semibold">Cancelar</button>
          <button type="submit" :disabled="guardando" class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold disabled:opacity-50 inline-flex items-center gap-1.5">
            <Loader2 v-if="guardando" :size="13" class="animate-spin" aria-hidden="true" />
            {{ guardando ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

// Formulario de un recurso multimedia de la unidad (paso 6). El servidor reconoce el sitio y arma la dirección de
// inserción; aquí solo se recoge lo que escribe el docente.
interface Recurso { id: number; title: string; type: string; metadata?: Record<string, unknown> | null; order: number }

const props = defineProps<{ unitId: number; order: number; recurso?: Recurso | null }>()
const emit = defineEmits<{ (e: 'cancel'): void; (e: 'saved', recurso: Recurso, creado: boolean): void }>()

const api = useApi()
const { messageOf } = useApiErrorMessage()
const MAX_BYTES = 1024 * 1024

const editando = !!props.recurso
const texto = (v: unknown) => (typeof v === 'string' ? v : '')
const tituloRef = ref<HTMLInputElement | null>(null)
const titulo = ref(props.recurso?.title ?? '')
const tipo = ref<'embed' | 'image'>(props.recurso?.type === 'image' ? 'image' : 'embed')
const enlace = ref(texto(props.recurso?.metadata?.url))
const origenImagen = ref<'subir' | 'enlace'>(editando ? 'enlace' : 'subir')
const archivo = ref<File | null>(null)
const alt = ref(texto(props.recurso?.metadata?.alt))
const pie = ref(texto(props.recurso?.metadata?.caption))
const cuota = ref<{ usadoBytes: number; limiteBytes: number } | null>(null)
const error = ref<string | null>(null)
const guardando = ref(false)

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toLocaleString('es-CO', { maximumFractionDigits: 1 })} MB`

onMounted(async () => {
  nextTick(() => tituloRef.value?.focus())
  if (!editando) cuota.value = await api.get<{ usadoBytes: number; limiteBytes: number }>('/media/images/quota').catch(() => null)
})
// Escape lo maneja el panel de lecciones que abre este formulario (una sola capa se cierra por pulsación).

function elegirArchivo(evento: Event) {
  const f = (evento.target as HTMLInputElement).files?.[0] ?? null
  error.value = null
  if (f && f.size > MAX_BYTES) {
    error.value = 'La imagen pesa más de 1 MB. Redúcela o usa un enlace de la web o de Google Drive.'
    archivo.value = null
    return
  }
  archivo.value = f
}

async function guardar() {
  error.value = null
  if (!titulo.value.trim()) { error.value = 'Ponle un título al recurso.'; return }
  let metadata: Record<string, unknown>
  guardando.value = true
  try {
    if (tipo.value === 'image') {
      if (!alt.value.trim()) { error.value = 'Describe la imagen.'; return }
      let url = enlace.value.trim()
      if (!editando && origenImagen.value === 'subir') {
        if (!archivo.value) { error.value = 'Elige una imagen de tu equipo.'; return }
        const datos = new FormData()
        datos.append('archivo', archivo.value)
        url = (await api.post<{ path: string }>('/media/images', datos)).path
      }
      if (!url) { error.value = 'Escribe la dirección de la imagen.'; return }
      metadata = { url, alt: alt.value.trim(), ...(pie.value.trim() ? { caption: pie.value.trim() } : {}) }
    } else {
      if (!enlace.value.trim()) { error.value = 'Pega el enlace o el código para insertar.'; return }
      metadata = { url: enlace.value.trim() }
    }
    const guardado = editando
      ? await api.patch<Recurso>(`/content/${props.recurso!.id}`, { title: titulo.value.trim(), metadata })
      : await api.post<Recurso>('/content', {
        learningUnitId: props.unitId,
        title: titulo.value.trim(),
        type: tipo.value,
        metadata,
        order: props.order,
        isVisible: true
      })
    emit('saved', guardado, !editando)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo guardar el recurso.')
  } finally {
    guardando.value = false
  }
}
</script>
