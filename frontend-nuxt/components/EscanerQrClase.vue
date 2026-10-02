<template>
  <div>
    <button type="button" class="min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-md borde-afordancia text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap" @click="abrir">
      <ScanLine :size="14" aria-hidden="true" /> Escanear QR
    </button>

    <Teleport to="body">
      <div v-if="abierto" class="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="escaner-titulo" @keydown.esc="cerrar">
        <div class="bg-base-blanco rounded-2xl p-5 w-full max-w-sm space-y-3 text-xs">
          <div class="flex items-center justify-between">
            <h2 id="escaner-titulo" class="text-sm font-bold text-base-texto-primario">Escanear el QR de la clase</h2>
            <button ref="cerrarRef" type="button" class="p-2 rounded-md hover:bg-base-bg-secundario" aria-label="Cerrar" @click="cerrar"><X :size="16" aria-hidden="true" /></button>
          </div>

          <template v-if="modo === 'camara'">
            <div class="relative rounded-xl overflow-hidden bg-black aspect-square">
              <video ref="videoRef" class="w-full h-full object-cover" playsinline muted />
              <div class="absolute inset-8 border-4 border-stire-teal rounded-xl pointer-events-none" aria-hidden="true" />
            </div>
            <p role="status" class="text-base-texto-secundario">Apunta la cámara al QR que proyecta tu docente.</p>
          </template>

          <div v-else class="space-y-2 text-base-texto-primario">
            <p v-if="modo === 'sin-permiso'" role="alert" class="text-semantico-falla font-semibold">No se pudo usar la cámara: revisa que el navegador tenga permiso.</p>
            <p>Abre la <strong>cámara de tu celular</strong> y apunta al QR: se abre STIRE con el código de la clase ya escrito.</p>
            <p class="text-base-texto-secundario">También puedes escribir el código que aparece debajo del QR.</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Escanea el QR de la clase con el lector del propio navegador (BarcodeDetector: Chrome y Android), sin dependencias.
// Donde no existe (iPhone, algunos computadores) explica cómo usar la cámara del celular, que abre el enlace sola.
import { ScanLine, X } from 'lucide-vue-next'
import { codigoDesdeQr } from '~/utils/codigoClase'

const emit = defineEmits<{ (e: 'codigo', codigo: string): void }>()

interface Detector { detect(fuente: HTMLVideoElement): Promise<Array<{ rawValue: string }>> }
type ConstructorDetector = new (opciones: { formats: string[] }) => Detector

const abierto = ref(false)
const modo = ref<'camara' | 'sin-lector' | 'sin-permiso'>('sin-lector')
const videoRef = ref<HTMLVideoElement | null>(null)
const cerrarRef = ref<HTMLButtonElement | null>(null)
let flujo: MediaStream | null = null
let activo = false

async function abrir() {
  abierto.value = true
  const Lector = (globalThis as unknown as { BarcodeDetector?: ConstructorDetector }).BarcodeDetector
  if (!Lector || !navigator.mediaDevices?.getUserMedia) { modo.value = 'sin-lector'; await nextTick(); cerrarRef.value?.focus(); return }
  modo.value = 'camara'
  try {
    flujo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    await nextTick()
    if (!videoRef.value) return
    videoRef.value.srcObject = flujo
    await videoRef.value.play()
    const lector = new Lector({ formats: ['qr_code'] })
    activo = true
    while (activo && videoRef.value) {
      const hallados = await lector.detect(videoRef.value).catch(() => [])
      const codigo = hallados.map((h) => codigoDesdeQr(h.rawValue)).find(Boolean)
      if (codigo) { emit('codigo', codigo); cerrar(); return }
      await new Promise((r) => setTimeout(r, 250))
    }
  } catch {
    modo.value = 'sin-permiso'
  }
}

function cerrar() {
  activo = false
  flujo?.getTracks().forEach((t) => t.stop())
  flujo = null
  abierto.value = false
}

onBeforeUnmount(cerrar)
</script>
