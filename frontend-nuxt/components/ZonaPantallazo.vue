<template>
  <div class="space-y-1.5">
    <p id="zona-pantallazo-titulo" class="font-semibold text-base-texto-primario">Pantallazo <span class="font-normal text-base-texto-secundario">(opcional)</span></p>

    <!-- Vista previa del pantallazo elegido -->
    <div v-if="vista" class="relative rounded-lg border border-base-borde-fuerte overflow-hidden bg-base-bg-secundario">
      <img :src="vista" alt="Pantallazo que se enviará con la sugerencia" class="w-full max-h-48 object-contain" />
      <button type="button" class="absolute top-1.5 right-1.5 px-2 py-1 rounded-md bg-base-blanco/95 border border-base-borde-fuerte font-semibold inline-flex items-center gap-1 hover:text-semantico-falla" @click="quitar">
        <X :size="12" aria-hidden="true" /> Quitar
      </button>
    </div>

    <!-- Zona para pegar: se enfoca con un clic o con Tab y recibe Ctrl+V; también acepta arrastrar y elegir archivo. -->
    <div
      v-else
      ref="zonaRef"
      tabindex="0"
      role="button"
      aria-labelledby="zona-pantallazo-titulo"
      aria-describedby="zona-pantallazo-ayuda"
      class="rounded-lg border-2 border-dashed px-3 py-4 text-center cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-stire-teal/50"
      :class="encima ? 'border-acento-ambar-fuerte bg-acento-ambar/10' : 'border-base-borde-fuerte hover:border-acento-ambar-fuerte focus:border-acento-ambar-fuerte'"
      @paste.prevent="alPegar"
      @dragover.prevent="encima = true"
      @dragleave="encima = false"
      @drop.prevent="alSoltar"
      @keydown.enter.prevent="elegir"
      @keydown.space.prevent="elegir"
      @click="zonaRef?.focus()"
    >
      <ImagePlus :size="20" class="mx-auto text-base-texto-secundario" aria-hidden="true" />
      <p class="mt-1 font-semibold text-base-texto-primario">Haz clic aquí y pega tu pantallazo con <kbd class="px-1 rounded border border-base-borde-fuerte font-mono text-[10px]">Ctrl + V</kbd></p>
      <p id="zona-pantallazo-ayuda" class="text-[11px] text-base-texto-secundario">
        Tómalo con <strong>{{ atajo }}</strong>. También puedes arrastrarlo aquí o
        <button type="button" class="text-acento-ambar-fuerte font-semibold underline" @click.stop="elegir">elegir un archivo</button>.
      </p>
    </div>
    <input ref="archivoRef" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="sr-only" tabindex="-1" aria-hidden="true" @change="alElegir" />
    <p v-if="aviso" role="alert" class="text-semantico-falla">{{ aviso }}</p>
  </div>
</template>

<script setup lang="ts">
// Un pantallazo para que se entienda mejor la sugerencia (pedido del dueño, 02/10). Se reduce en el navegador antes de
// subirlo (utils/captura.ts); el padre recibe el archivo listo con v-model.
import { ImagePlus, X } from 'lucide-vue-next'
import { atajoDeCaptura, esImagenAceptada, imagenDe, MAX_BYTES_CAPTURA, reducirCaptura } from '~/utils/captura'

const modelo = defineModel<Blob | null>({ default: null })

const zonaRef = ref<HTMLElement | null>(null)
const archivoRef = ref<HTMLInputElement | null>(null)
const encima = ref(false)
const aviso = ref<string | null>(null)
const vista = ref<string | null>(null)
const atajo = computed(() => (import.meta.client ? atajoDeCaptura(navigator.userAgent) : 'Win + Shift + S'))

async function usar(archivo: File | null | undefined) {
  aviso.value = null
  if (!archivo) { aviso.value = 'No encontré una imagen. Copia el pantallazo y vuelve a pegarlo aquí.'; return }
  if (!esImagenAceptada(archivo)) { aviso.value = 'Solo se aceptan imágenes PNG, JPG, GIF o WebP.'; return }
  let listo: Blob = archivo
  try {
    listo = await reducirCaptura(archivo)
  } catch {
    // Sin poder reducirla (navegador viejo) se sube tal cual si cabe.
  }
  if (listo.size > MAX_BYTES_CAPTURA) { aviso.value = 'La imagen pesa más de 3 MB. Recórtala o toma solo la parte que importa.'; return }
  modelo.value = listo
}

function alPegar(e: ClipboardEvent) { usar(imagenDe(e.clipboardData)) }
function alSoltar(e: DragEvent) { encima.value = false; usar(imagenDe(e.dataTransfer)) }
function alElegir(e: Event) { const input = e.target as HTMLInputElement; usar(input.files?.[0]); input.value = '' }
function elegir() { archivoRef.value?.click() }
function quitar() { modelo.value = null; nextTick(() => zonaRef.value?.focus()) }

/** El padre también puede pasar lo que se pegó fuera de la zona (por ejemplo, en el cuadro de texto). */
defineExpose({ usar })

watch(modelo, (blob) => {
  if (vista.value) URL.revokeObjectURL(vista.value)
  vista.value = blob ? URL.createObjectURL(blob) : null
})
onBeforeUnmount(() => { if (vista.value) URL.revokeObjectURL(vista.value) })
</script>
