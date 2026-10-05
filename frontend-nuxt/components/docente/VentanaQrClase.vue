<template>
  <!-- El código de la clase en grande, con su QR, para proyectarlo. Antes no era un diálogo para el lector de pantalla
       (sin role="dialog"), no atrapaba el foco ni se cerraba con Escape; ahora usa la base de ventanas común. -->
  <AdminDialogo id-titulo="qr-clase-titulo" titulo="Código de la clase" :subtitulo="nombre" @cerrar="emit('cerrar')">
    <template #icono><QrCode :size="18" aria-hidden="true" /></template>
    <div class="text-center space-y-4">
      <p class="text-xs text-slate-600">Que lo escaneen con la cámara del celular: se abre STIRE con el código ya escrito.</p>
      <div class="flex items-center justify-center">
        <!-- El QR siempre en blanco y azul, también en tema oscuro: así lo leen todas las cámaras. -->
        <canvas ref="lienzo" class="rounded-2xl shadow-lg bg-white" role="img" :aria-label="`Código QR para entrar a ${nombre}`" />
      </div>
      <div class="p-4 bg-base-bg-secundario rounded-2xl">
        <p class="text-xs text-slate-600 mb-1">Código de acceso</p>
        <p class="text-3xl font-mono font-bold text-acento-ambar-fuerte tracking-widest">{{ codigo }}</p>
      </div>
      <button type="button" data-foco-inicial class="btn-stire-secondary w-full justify-center min-h-[44px]" @click="emit('cerrar')">Cerrar</button>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { QrCode } from 'lucide-vue-next'
import { urlDeIngreso } from '~/utils/codigoClase'

const props = defineProps<{ codigo: string; nombre: string }>()
const emit = defineEmits<{ cerrar: [] }>()
const lienzo = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  if (!lienzo.value) return
  try {
    const QRCode = await import('qrcode')
    // El QR lleva la página para unirse con el código ya escrito: la cámara del celular la abre sola.
    await QRCode.toCanvas(lienzo.value, urlDeIngreso(window.location.origin, props.codigo), { width: 220, margin: 2, color: { dark: '#0B3D91', light: '#FFFFFF' } })
  } catch {
    /* sin la librería del QR queda el código en grande, que también sirve */
  }
})
</script>
