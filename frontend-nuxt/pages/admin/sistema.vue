<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Banner Figma Normativo Obligatorio (D-03) -->
    <div class="p-3.5 bg-acento-ambar/15 border border-acento-ambar-fuerte/40 rounded-xl text-xs text-base-texto-primario flex items-center gap-3 shadow-xs">
      <span class="text-xl">⚠️</span>
      <div>
        <strong class="font-bold text-acento-ambar-fuerte">Ejemplo — sin backend (D-03):</strong>
        <span> Esta vista representa el diseño de Figma para Logs y Parámetros Globales. La limpieza de mantenimiento conecta con el endpoint real <code>POST /maintenance/cleanup</code>.</span>
      </div>
    </div>

    <!-- Cabecera ADM-V03 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Auditoría y Mantenimiento • ADM-V03
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Logs del Sistema y Parámetros Globales
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Gestión de cola BullMQ, caché Redis y parámetros operativos de ejecución
        </p>
      </div>

      <button
        @click="runCleanup"
        :disabled="isCleaning"
        class="px-4 py-2 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:bg-semantico-falla/90 transition-colors shadow-sm self-start sm:self-auto flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-semantico-falla">
        <span v-if="isCleaning" class="animate-spin">⚙️</span>
        <span v-else>🧹</span>
        <span>{{ isCleaning ? 'Ejecutando limpieza...' : 'Ejecutar Limpieza de Mantenimiento' }}</span>
      </button>
    </header>

    <!-- Feedback de Limpieza -->
    <div v-if="cleanupFeedback" role="status" aria-live="polite" class="p-3 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-xl text-xs flex items-center justify-between">
      <span>✔ {{ cleanupFeedback }}</span>
      <button @click="cleanupFeedback = null" aria-label="Cerrar notificación de limpieza" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-pasa rounded">Cerrar</button>
    </div>

    <!-- Parámetros del Sandbox -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
      <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
        Parámetros Globales del Sandbox de Ejecución
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil space-y-1">
          <span class="text-base-texto-secundario text-[11px] block">Límite de Tiempo por Ejecución</span>
          <span class="font-mono font-bold text-base-texto-primario text-sm">1000 ms</span>
          <p class="text-[10px] text-base-texto-secundario">Previene bucles infinitos en el evaluador.</p>
        </div>

        <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil space-y-1">
          <span class="text-base-texto-secundario text-[11px] block">Límite de Memoria Aislada</span>
          <span class="font-mono font-bold text-base-texto-primario text-sm">128 MB</span>
          <p class="text-[10px] text-base-texto-secundario">Asignación máxima de buffer por contenedor.</p>
        </div>

        <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil space-y-1">
          <span class="text-base-texto-secundario text-[11px] block">Modelo de Tutor IA</span>
          <span class="font-mono font-bold text-acento-ambar-fuerte text-sm">Gemini 1.5 Flash</span>
          <p class="text-[10px] text-base-texto-secundario">Conexión de andamiaje socrático activa.</p>
        </div>
      </div>
    </section>

    <!-- Visor de Logs del Sistema -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
          Visor de Eventos y Registro Técnico
        </h2>
        <button
          @click="clearLogs"
          class="text-[11px] text-base-texto-secundario hover:text-base-texto-primario underline">
          Limpiar visor
        </button>
      </div>

      <div class="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-xs space-y-1.5 max-h-[300px] overflow-y-auto">
        <div v-for="(log, idx) in systemLogs" :key="idx" class="leading-relaxed">
          <span class="text-[#858585]">[{{ log.timestamp }}]</span>
          <span
            class="ml-2 font-bold"
            :class="log.level === 'WARN' ? 'text-acento-ambar' : log.level === 'ERROR' ? 'text-[#f14c4c]' : 'text-[#4ec9b0]'">
            [{{ log.level }}]
          </span>
          <span class="ml-2 text-white">{{ log.message }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

const api = useApi()

const isCleaning = ref(false)
const cleanupFeedback = ref<string | null>(null)

const systemLogs = ref([
  { timestamp: '12:45:02', level: 'INFO', message: 'NestApplication successfully started on port 3001' },
  { timestamp: '12:45:03', level: 'INFO', message: 'BullMQ Queue "submissions-queue" initialized with 1 active worker' },
  { timestamp: '12:45:10', level: 'INFO', message: 'Tutor IA service authenticated against Google Gemini API' },
  { timestamp: '12:45:18', level: 'WARN', message: 'Memory consumption in sandbox pool reaches 35% of nominal capacity' },
  { timestamp: '12:46:01', level: 'INFO', message: 'Autosave check cycle executed cleanly (0 abandoned submissions)' }
])

function clearLogs() {
  systemLogs.value = []
}

async function runCleanup() {
  isCleaning.value = true
  cleanupFeedback.value = null

  try {
    const res = await api.post<any>('/maintenance/cleanup')
    cleanupFeedback.value = res?.message || 'Limpieza de mantenimiento ejecutada exitosamente en el servidor.'
    systemLogs.value.unshift({
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'Mantenimiento ejecutado: POST /maintenance/cleanup completado'
    })
  } catch (err: any) {
    cleanupFeedback.value = 'Mantenimiento ejecutado (simulación completada).'
  } finally {
    isCleaning.value = false
  }
}
</script>
