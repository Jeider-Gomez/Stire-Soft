<template>
  <!-- La imagen de un mensaje (sugerencia n.º 13). Es privada: se pide con la sesión y se muestra desde la memoria del
       navegador; un clic la abre en grande en otra pestaña. -->
  <p v-if="error" class="text-[11px] text-base-texto-secundario">No se pudo cargar la imagen.</p>
  <a v-else-if="url" :href="url" target="_blank" rel="noopener" class="block max-w-xs rounded-lg border border-base-borde-sutil overflow-hidden" aria-label="Abrir la imagen del mensaje en grande">
    <img :src="url" alt="Imagen adjunta al mensaje" class="w-full max-h-48 object-contain bg-base-bg-secundario" loading="lazy" />
  </a>
  <p v-else class="text-[11px] text-base-texto-secundario">Cargando imagen…</p>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { CLAVE_MENSAJES } from '~/composables/useMensajes'

const props = defineProps<{ mensajeId: number }>()
const estado = inject(CLAVE_MENSAJES)
const url = ref<string | null>(null)
const error = ref(false)

onMounted(async () => {
  try {
    const blob = await estado?.imagen(props.mensajeId)
    if (!blob) throw new Error('sin imagen')
    url.value = URL.createObjectURL(blob)
  } catch {
    error.value = true
  }
})
onBeforeUnmount(() => { if (url.value) URL.revokeObjectURL(url.value) })
</script>
