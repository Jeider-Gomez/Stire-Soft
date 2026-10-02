<template>
  <span
    class="inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xl gradient-stire text-white font-bold select-none"
    :class="tamano"
    :aria-label="decorativo ? undefined : `Foto de ${nombre || 'usuario'}`"
    :aria-hidden="decorativo ? 'true' : undefined"
    :role="decorativo ? undefined : 'img'"
  >
    <img v-if="url && !fallo" :src="url" alt="" class="w-full h-full object-cover" loading="lazy" @error="fallo = true" />
    <span v-else>{{ iniciales(nombre) }}</span>
  </span>
</template>

<script setup lang="ts">
// Foto de perfil si la hay; si no (o si no carga), las iniciales sobre el degradado de la marca.
import { iniciales, urlDeFoto } from '~/utils/fotoPerfil'

const props = withDefaults(defineProps<{ nombre?: string | null; fotoId?: string | null; tamano?: string; decorativo?: boolean }>(), {
  nombre: '',
  fotoId: null,
  tamano: 'w-8 h-8 text-xs',
  decorativo: false,
})
const config = useRuntimeConfig()
const fallo = ref(false)
const url = computed(() => urlDeFoto(String(config.public.apiBase || 'http://localhost:3001'), props.fotoId))
watch(() => props.fotoId, () => { fallo.value = false })
</script>
