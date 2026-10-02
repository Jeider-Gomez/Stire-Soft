<template>
  <div class="relative rounded-xl overflow-hidden bg-black aspect-square">
    <video ref="videoRef" class="w-full h-full object-cover" playsinline muted />
    <div class="absolute inset-8 border-4 border-stire-teal rounded-xl pointer-events-none" aria-hidden="true" />
    <p v-if="iniciando" role="status" class="absolute inset-x-0 bottom-3 text-center text-[11px] text-white/90">Abriendo la cámara…</p>
  </div>
</template>

<script setup lang="ts">
// La cámara trasera leyendo QR sin parar. Emite cada texto leído (el padre decide qué hacer) y apaga la cámara al
// desmontarse: nunca queda encendida al cerrar la ventana.
import { crearLectorQr } from '~/utils/lectorQr'

const emit = defineEmits<{ (e: 'leido', texto: string): void; (e: 'fallo', motivo: 'sin-permiso'): void }>()

const videoRef = ref<HTMLVideoElement | null>(null)
const iniciando = ref(true)
let flujo: MediaStream | null = null
let activo = true

onMounted(async () => {
  try {
    const [stream, lector] = await Promise.all([
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }),
      crearLectorQr(),
    ])
    flujo = stream
    if (!activo || !videoRef.value) { apagar(); return }
    videoRef.value.srcObject = flujo
    await videoRef.value.play()
    iniciando.value = false
    while (activo && videoRef.value) {
      for (const texto of await lector.leer(videoRef.value)) emit('leido', texto)
      await new Promise((r) => setTimeout(r, 250))
    }
  } catch {
    if (activo) emit('fallo', 'sin-permiso')
  }
})

function apagar() {
  activo = false
  flujo?.getTracks().forEach((t) => t.stop())
  flujo = null
}

onBeforeUnmount(apagar)
</script>
