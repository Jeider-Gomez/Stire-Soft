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
            <CamaraQr @leido="alLeer" @fallo="modo = 'sin-permiso'" />
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
// Escanea el QR de la clase dentro de la app (utils/lectorQr.ts: lector del navegador o jsQR). Si no hay cámara o no
// dan permiso, explica cómo usar la cámara del celular, que abre el enlace sola.
import { ScanLine, X } from 'lucide-vue-next'
import { codigoDesdeQr } from '~/utils/codigoClase'
import { hayCamara } from '~/utils/lectorQr'

const emit = defineEmits<{ (e: 'codigo', codigo: string): void }>()

const abierto = ref(false)
const modo = ref<'camara' | 'sin-lector' | 'sin-permiso'>('sin-lector')
const cerrarRef = ref<HTMLButtonElement | null>(null)

async function abrir() {
  abierto.value = true
  modo.value = hayCamara() ? 'camara' : 'sin-lector'
  await nextTick()
  cerrarRef.value?.focus()
}

function alLeer(texto: string) {
  const codigo = codigoDesdeQr(texto)
  if (codigo) { emit('codigo', codigo); cerrar() }
}

// Cerrar desmonta <CamaraQr>, que apaga la cámara.
function cerrar() {
  abierto.value = false
}
</script>
