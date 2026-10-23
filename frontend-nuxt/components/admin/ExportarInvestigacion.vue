<template>
  <!-- Datos para la investigación (GET /usabilidad/investigacion/exportar): solo quienes aceptaron participar, con un
       código en lugar del nombre. Lo usa el equipo para el análisis del artículo. -->
  <div class="flex flex-wrap items-center gap-3">
    <button type="button" :disabled="descargando" class="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-lg text-xs font-bold border border-base-borde-fuerte hover:bg-base-bg-secundario disabled:cursor-wait" @click="descargar">
      <Download :size="14" aria-hidden="true" /> {{ descargando ? 'Preparando…' : 'Descargar datos para la investigación (CSV, sin nombres)' }}
    </button>
    <p v-if="aviso" class="text-[11px]" :class="error ? 'text-semantico-falla' : 'text-slate-600'" role="status">{{ aviso }}</p>
  </div>
</template>

<script setup lang="ts">
import { Download } from 'lucide-vue-next'

const investigacion = useInvestigacion()
const descargando = ref(false)
const aviso = ref('')
const error = ref(false)

async function descargar() {
  descargando.value = true
  aviso.value = ''
  try {
    const datos = await investigacion.exportarCsv()
    const url = URL.createObjectURL(datos)
    const a = document.createElement('a')
    a.href = url
    a.download = `stire-investigacion-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    error.value = false
    aviso.value = 'Solo incluye a quienes aceptaron participar.'
  } catch (e) {
    error.value = true
    aviso.value = useApiErrorMessage().messageOf(e, 'No se pudo descargar. Intenta de nuevo.')
  } finally {
    descargando.value = false
  }
}
</script>
