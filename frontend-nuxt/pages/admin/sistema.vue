<template>
  <div class="max-w-6xl mx-auto space-y-6">
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
          Parámetros del sandbox y eventos recientes del servidor
        </p>
      </div>

      <button
        @click="confirmAndRunCleanup"
        :disabled="isCleaning"
        class="px-4 py-2 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:bg-semantico-falla/90 transition-colors shadow-sm self-start sm:self-auto flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-semantico-falla">
        <span v-if="isCleaning" class="animate-spin" aria-hidden="true">⚙️</span>
        <span v-else aria-hidden="true">🧹</span>
        <span>{{ isCleaning ? 'Ejecutando limpieza...' : 'Ejecutar Limpieza de Mantenimiento' }}</span>
      </button>
    </header>

    <!-- Feedback de Limpieza: Éxito -->
    <div
      v-if="cleanupFeedback"
      role="status"
      aria-live="polite"
      class="p-3 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-xl text-xs flex items-center justify-between">
      <span>✔ {{ cleanupFeedback }}</span>
      <button
        @click="cleanupFeedback = null"
        aria-label="Cerrar notificación de limpieza"
        class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-pasa rounded">
        Cerrar
      </button>
    </div>

    <!-- Feedback de Limpieza: Error Real -->
    <div
      v-if="cleanupError"
      role="alert"
      class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-xl text-xs flex items-center justify-between">
      <span>✖ {{ cleanupError }}</span>
      <button
        @click="cleanupError = null"
        aria-label="Cerrar alerta de error"
        class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-falla rounded">
        Cerrar
      </button>
    </div>

    <!-- Parámetros del Sandbox y Motor (Solo Lectura) -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
          Parámetros Globales del Sandbox de Ejecución (Solo Lectura)
        </h2>
        <span class="text-[11px] text-base-texto-secundario">
          Fijados por el servidor backend
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <!-- Timeout -->
        <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil space-y-1">
          <span class="text-base-texto-secundario text-[11px] block">Límite de Tiempo (Timeout)</span>
          <span class="font-mono font-bold text-base-texto-primario text-sm">
            {{ systemStatus?.sandbox.timeoutMs != null ? `${systemStatus.sandbox.timeoutMs} ms` : '—' }}
          </span>
          <p class="text-[10px] text-base-texto-secundario">Tiempo máximo por ejecución en el sandbox.</p>
        </div>

        <!-- Memoria Max Heap -->
        <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil space-y-1">
          <span class="text-base-texto-secundario text-[11px] block">Memoria Máxima (Heap)</span>
          <span class="font-mono font-bold text-base-texto-primario text-sm">
            {{ systemStatus?.sandbox.maxHeapMb != null ? `${systemStatus.sandbox.maxHeapMb} MB` : '—' }}
          </span>
          <p class="text-[10px] text-base-texto-secundario">Buffer máximo asignado por proceso.</p>
        </div>

        <!-- Salida Máxima -->
        <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil space-y-1">
          <span class="text-base-texto-secundario text-[11px] block">Salida Máxima (Stdout)</span>
          <span class="font-mono font-bold text-base-texto-primario text-sm">
            {{ systemStatus?.sandbox.maxOutputKb != null ? `${systemStatus.sandbox.maxOutputKb} KB` : '—' }}
          </span>
          <p class="text-[10px] text-base-texto-secundario">Longitud máxima de salida capturada.</p>
        </div>

        <!-- Modelo LLM Tutor -->
        <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil space-y-1">
          <span class="text-base-texto-secundario text-[11px] block">Modelo del Tutor IA</span>
          <span class="font-mono font-bold text-acento-ambar-fuerte text-sm truncate block" :title="systemStatus?.tutor.model">
            {{ systemStatus?.tutor.model || '—' }}
          </span>
          <p class="text-[10px] text-base-texto-secundario">Proveedor: {{ systemStatus?.tutor.provider || 'Google Gemini' }}</p>
        </div>
      </div>
    </section>

    <!-- Visor de Logs del Sistema -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-base-borde-sutil">
        <div>
          <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
            Visor de Eventos y Registro Técnico
          </h2>
          <p v-if="logsNote" class="text-[10px] text-base-texto-secundario mt-0.5">
            {{ logsNote }}
          </p>
        </div>

        <!-- Controles: Filtro de Nivel y Actualizar -->
        <div class="flex items-center gap-2">
          <label for="log-level-filter" class="text-[11px] font-semibold text-base-texto-secundario">Nivel:</label>
          <select
            id="log-level-filter"
            v-model="selectedLevel"
            @change="fetchLogs"
            class="text-xs bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-2.5 py-1 outline-none focus:border-acento-ambar-fuerte">
            <option value="todos">Todos</option>
            <option value="error">Errores</option>
            <option value="warn">Advertencias</option>
            <option value="info">Info</option>
          </select>

          <button
            @click="fetchAll"
            :disabled="loadingLogs"
            class="borde-afordancia px-3 py-1 rounded-md text-xs font-semibold hover:bg-base-bg-secundario text-base-texto-secundario flex items-center gap-1 transition-colors disabled:opacity-50"
            aria-label="Actualizar registros del sistema">
            <span :class="{ 'animate-spin': loadingLogs }" aria-hidden="true">🔄</span>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Contenedor del Visor accesible -->
      <div
        role="log"
        aria-live="off"
        class="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-xs space-y-1.5 max-h-[350px] overflow-y-auto border border-base-borde-fuerte">
        <div v-if="loadingLogs && logEntries.length === 0" class="text-center py-6 text-[#858585]">
          Cargando eventos del servidor...
        </div>

        <div v-else-if="logError" class="text-center py-6 text-semantico-falla">
          {{ logError }}
        </div>

        <div v-else-if="logEntries.length === 0" class="text-center py-6 text-[#858585]">
          Sin eventos con este filtro
        </div>

        <div v-else v-for="(entry, idx) in logEntries" :key="idx" class="leading-relaxed flex items-start gap-2">
          <span class="text-[#858585] shrink-0">[{{ formatLogTime(entry.timestamp) }}]</span>
          <span
            class="font-bold shrink-0 text-[10px] uppercase px-1 rounded"
            :class="getLevelBadgeClass(entry.level)">
            [{{ entry.level }}]
          </span>
          <span v-if="entry.context" class="text-[#4ec9b0] shrink-0 font-semibold">
            [{{ entry.context }}]
          </span>
          <span class="text-white break-words">{{ entry.message }}</span>
        </div>
      </div>
    </section>

    <!-- Modal de Confirmación de Limpieza de Mantenimiento -->
    <Teleport to="body">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-cleanup-title"
        @click.self="showConfirmModal = false">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-sm p-6 space-y-4">
          <h2 id="confirm-cleanup-title" class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
            <span class="text-semantico-falla" aria-hidden="true">⚠</span>
            <span>Confirmar Limpieza de Mantenimiento</span>
          </h2>
          <p class="text-xs text-base-texto-secundario leading-relaxed">
            Esta operación <strong>modifica resultados de estudiantes</strong>: marca como incorrectas (nota 0) las respuestas que quedaron sin calificar y cierra con nota 0 las entregas que llevan más de 10 minutos esperando calificación, para que puedan reintentar. No se puede deshacer desde aquí. ¿Deseas continuar?
          </p>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              @click="showConfirmModal = false"
              :disabled="isCleaning"
              class="px-3 py-1.5 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario">
              Cancelar
            </button>
            <button
              @click="executeCleanup"
              :disabled="isCleaning"
              class="px-4 py-1.5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:bg-semantico-falla/90 transition-colors flex items-center gap-1">
              <span v-if="isCleaning" class="animate-spin">⚙️</span>
              <span>{{ isCleaning ? 'Limpiando...' : 'Sí, ejecutar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'
import type { SystemStatus, SystemLogs } from '~/types'

definePageMeta({
  layout: 'admin'
})

const api = useApi()
const { extract } = useApiErrorMessage()

const systemStatus = ref<SystemStatus | null>(null)
const logEntries = ref<SystemLogs['entries']>([])
const logsNote = ref<string>('')
const selectedLevel = ref<'todos' | 'error' | 'warn' | 'info'>('todos')
const loadingLogs = ref(false)
const logError = ref<string | null>(null)

const isCleaning = ref(false)
const cleanupFeedback = ref<string | null>(null)
const cleanupError = ref<string | null>(null)
const showConfirmModal = ref(false)

let refreshInterval: ReturnType<typeof setInterval> | null = null

function formatLogTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

function getLevelBadgeClass(level: string): string {
  const l = (level || '').toLowerCase()
  if (l === 'error' || l === 'fatal') return 'bg-semantico-falla/20 text-[#f14c4c]'
  if (l === 'warn') return 'bg-acento-ambar/20 text-acento-ambar'
  return 'bg-semantico-pasa/20 text-[#4ec9b0]'
}

async function fetchStatus() {
  try {
    const res = await api.get<SystemStatus>('/admin/system/status')
    systemStatus.value = res
  } catch (err) {
    console.warn('[STIRE Admin] Error al cargar parámetros del sistema:', err)
  }
}

async function fetchLogs() {
  loadingLogs.value = true
  logError.value = null
  try {
    const res = await api.get<SystemLogs>(`/admin/system/logs?level=${selectedLevel.value}&limit=100`)
    if (res) {
      logEntries.value = res.entries || []
      logsNote.value = res.note || ''
    }
  } catch (err: any) {
    const { detail } = extract(err)
    logError.value = detail || 'Error al conectar con el visor de logs del servidor.'
  } finally {
    loadingLogs.value = false
  }
}

async function fetchAll() {
  await Promise.all([fetchStatus(), fetchLogs()])
}

function confirmAndRunCleanup() {
  cleanupFeedback.value = null
  cleanupError.value = null
  showConfirmModal.value = true
}

async function executeCleanup() {
  isCleaning.value = true
  cleanupFeedback.value = null
  cleanupError.value = null

  try {
    const res = await api.post<{ message?: string; success?: boolean }>('/maintenance/cleanup')
    cleanupFeedback.value = res?.message || 'Limpieza de mantenimiento ejecutada exitosamente en el servidor.'
    showConfirmModal.value = false
    await fetchLogs()
  } catch (err: any) {
    const { detail } = extract(err)
    cleanupError.value = detail || 'Error al ejecutar la limpieza de mantenimiento en el servidor.'
    showConfirmModal.value = false
  } finally {
    isCleaning.value = false
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    fetchAll()
  }
}

onMounted(() => {
  fetchAll()
  refreshInterval = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      fetchAll()
    }
  }, 30000)

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})
</script>
