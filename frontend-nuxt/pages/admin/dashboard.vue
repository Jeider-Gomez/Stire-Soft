<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Cabecera ADM-V01 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/10 text-semantico-pasa uppercase tracking-wider">
            Administración del sistema
          </span>
          <span
            v-if="statusData"
            class="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5"
            :class="isSystemHealthy ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-semantico-falla/15 text-semantico-falla'">
            <component :is="isSystemHealthy ? CircleCheck : TriangleAlert" :size="12" aria-hidden="true" />
            <span>{{ isSystemHealthy ? 'Servicios operacionales' : 'Degradación detectada' }}</span>
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Panel de control y salud del sistema
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Monitoreo de infraestructura, latencia de sandboxes y telemetría de carga
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchStatus"
          :disabled="isLoading"
          class="borde-afordancia px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-base-bg-secundario text-slate-600 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          aria-label="Actualizar métricas del sistema">
          <Loader2 :size="14" :class="{ 'animate-spin': isLoading }" aria-hidden="true" />
          <span>Actualizar</span>
        </button>
      </div>
    </header>

    <!-- ESTADO: Cargando inicial -->
    <div v-if="isLoading && !statusData" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <Loader2 :size="14" class="inline-block animate-spin mr-2" aria-hidden="true" />
      <span>Cargando telemetría del sistema...</span>
    </div>

    <!-- ESTADO: Error de red o 403 -->
    <div v-else-if="errorMessage" role="alert" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <TriangleAlert :size="28" class="text-3xl" aria-hidden="true" />
      <h3 class="font-bold text-semantico-falla text-sm">No se pudo obtener la telemetría</h3>
      <p class="text-base-texto-secundario max-w-md mx-auto">
        {{ errorMessage }}
      </p>
      <button
        @click="fetchStatus"
        class="px-4 py-1.5 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil transition-colors">
        Reintentar
      </button>
    </div>

    <!-- ESTADO: Datos Reales -->
    <div v-else-if="statusData" class="space-y-6">
      <!-- Tarjetas KPI de Salud -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Indicadores principales de salud">
        <!-- 1. API NestJS -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-base-texto-secundario">API Gateway (p95)</span>
            <span
              class="px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
              :class="(statusData.api.requests.serverErrorRatePct ?? 0) > 5 ? 'bg-semantico-falla/15 text-semantico-falla' : 'bg-semantico-pasa/10 text-semantico-pasa'">
              <component :is="(statusData.api.requests.serverErrorRatePct ?? 0) > 5 ? TriangleAlert : CircleCheck" :size="12" aria-hidden="true" />
              <span>{{ (statusData.api.requests.serverErrorRatePct ?? 0) > 5 ? 'Degradado' : 'Normal' }}</span>
            </span>
          </div>
          <p class="text-2xl font-bold font-mono text-base-texto-primario">
            {{ statusData.api.requests.p95Ms != null ? `${statusData.api.requests.p95Ms} ms` : '—' }}
          </p>
          <p class="text-[10px] text-base-texto-secundario leading-relaxed">
            <template v-if="statusData.api.requests.sampled === 0">
              Sin peticiones aún
            </template>
            <template v-else>
              p50: {{ statusData.api.requests.p50Ms != null ? `${statusData.api.requests.p50Ms} ms` : '—' }} · 5xx: {{ statusData.api.requests.serverErrorRatePct != null ? `${statusData.api.requests.serverErrorRatePct}%` : '—' }} ({{ statusData.api.requests.sampled }} peticiones)
            </template>
          </p>
        </div>

        <!-- 2. Sandbox Aislado -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-base-texto-secundario">Sandbox (promedio)</span>
            <span
              class="px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
              :class="statusData.database.ok ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-base-bg-secundario text-slate-600 border border-base-borde-sutil'">
              <CircleCheck v-if="statusData.database.ok" :size="12" aria-hidden="true" /><span v-else aria-hidden="true">—</span>
              <span>{{ statusData.database.ok ? (statusData.sandbox.adapter || 'Activo') : 'Sin datos' }}</span>
            </span>
          </div>
          <p class="text-2xl font-bold font-mono text-base-texto-primario">
            {{ statusData.sandbox.avgExecutionMs != null ? `${statusData.sandbox.avgExecutionMs} ms` : '—' }}
          </p>
          <p class="text-[10px] text-base-texto-secundario leading-relaxed">
            {{ statusData.sandbox.executionsLast24h != null ? `${plural(statusData.sandbox.executionsLast24h, 'ejecución', 'ejecuciones')} en 24 h` : 'Sin ejecuciones en 24 h' }}
          </p>
        </div>

        <!-- 3. Base de datos MariaDB -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-base-texto-secundario">Base de datos</span>
            <span
              class="px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
              :class="statusData.database.ok ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-semantico-falla/15 text-semantico-falla'">
              <component :is="statusData.database.ok ? CircleCheck : CircleX" :size="12" aria-hidden="true" />
              <span>{{ statusData.database.ok ? 'Conectada' : 'Sin conexión' }}</span>
            </span>
          </div>
          <p
            class="text-2xl font-bold font-mono"
            :class="statusData.database.ok ? 'text-base-texto-primario' : 'text-semantico-falla'">
            {{ statusData.database.ok ? (statusData.database.latencyMs != null ? `${statusData.database.latencyMs} ms` : '—') : 'Error' }}
          </p>
          <p class="text-[10px] text-base-texto-secundario leading-relaxed">
            {{ statusData.database.ok ? 'Conexión operacional con MariaDB' : 'Sin conexión a la base de datos' }}
          </p>
        </div>

        <!-- 4. Tutor Gemini LLM -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-base-texto-secundario">Tutor IA (LLM)</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-acento-ambar/15 text-acento-ambar-fuerte flex items-center gap-1">
              <Bot :size="16" aria-hidden="true" />
              <span>{{ statusData.tutor.provider || 'Gemini' }}</span>
            </span>
          </div>
          <p class="text-lg font-bold font-mono text-acento-ambar-fuerte truncate" :title="statusData.tutor.model">
            {{ statusData.tutor.model || '—' }}
          </p>
          <p class="text-[10px] text-base-texto-secundario leading-relaxed">
            {{ statusData.tutor.studentsWithKey != null ? statusData.tutor.studentsWithKey : '—' }} con clave · {{ statusData.tutor.studentMessagesLast24h != null ? statusData.tutor.studentMessagesLast24h : '—' }} msgs en 24 h
          </p>
        </div>
      </section>

      <!-- Resumen de Población y Actividad Global -->
      <section class="p-3 bg-base-blanco rounded-xl border border-base-borde-sutil shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
        <div class="flex items-center gap-2 text-base-texto-primario">
          <Users :size="16" aria-hidden="true" />
          <span class="font-semibold">Usuarios registrados:</span>
          <span class="text-base-texto-secundario">
            {{ formattedUserRoles }}
          </span>
        </div>
        <div class="flex items-center gap-2 text-base-texto-secundario">
          <Zap :size="16" aria-hidden="true" />
          <span>Envíos iniciados (24 h):</span>
          <strong class="font-mono text-base-texto-primario">{{ statusData.submissionsLast24h != null ? statusData.submissionsLast24h : '—' }}</strong>
        </div>
      </section>

      <!-- Tabla de Servicios Detallada -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
            Estado detallado de los subsistemas de STIRE
          </h2>
          <span class="text-[11px] text-base-texto-secundario font-mono">
            Actualizado a las {{ formattedGeneratedAt }}
          </span>
        </div>

        <!-- Se puede desplazar con el teclado (WCAG 2.1.1): en el celular la tabla no cabe. -->
        <div class="overflow-x-auto" tabindex="0" role="region" aria-label="Tabla de subsistemas (desplázala de lado si no cabe)">
          <table class="w-full text-xs text-left">
            <thead class="bg-base-bg-secundario text-slate-600 border-b border-base-borde-sutil font-semibold">
              <tr>
                <th scope="col" class="p-3">Subsistema</th>
                <th scope="col" class="p-3">Detalle / Configuración</th>
                <th scope="col" class="p-3 text-center">Estado</th>
                <th scope="col" class="p-3 text-center">Recursos / Rendimiento</th>
                <th scope="col" class="p-3 text-right">Tiempo activo / métrica</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-base-borde-sutil font-mono text-[11px]">
              <!-- 1. API NestJS Core -->
              <tr class="hover:bg-base-bg-secundario/40 transition-colors">
                <td class="p-3 font-bold font-sans text-base-texto-primario">API NestJS Core</td>
                <td class="p-3 text-base-texto-secundario">v{{ statusData.api.version || '—' }} (Node {{ statusData.api.nodeVersion || '—' }}, {{ statusData.api.environment || '—' }})</td>
                <td class="p-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/10 text-semantico-pasa">
                    Activo
                  </span>
                </td>
                <td class="p-3 text-center text-base-texto-primario">
                  RSS: {{ statusData.api.memory.rssMb }} MB / Heap: {{ statusData.api.memory.heapUsedMb }} MB
                </td>
                <td class="p-3 text-right font-sans text-base-texto-secundario">
                  {{ formatUptime(statusData.api.uptimeSeconds) }}
                </td>
              </tr>

              <!-- 2. Base de datos MariaDB -->
              <tr class="hover:bg-base-bg-secundario/40 transition-colors">
                <td class="p-3 font-bold font-sans text-base-texto-primario">Base de datos</td>
                <td class="p-3 text-base-texto-secundario">MariaDB / TypeORM Pool</td>
                <td class="p-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="statusData.database.ok ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-semantico-falla/15 text-semantico-falla'">
                    {{ statusData.database.ok ? 'Conectada' : 'Sin conexión' }}
                  </span>
                </td>
                <td class="p-3 text-center text-base-texto-primario">
                  Latencia: {{ statusData.database.latencyMs != null ? `${statusData.database.latencyMs} ms` : '—' }}
                </td>
                <td class="p-3 text-right font-sans text-base-texto-secundario">
                  {{ statusData.database.ok ? 'Operacional' : 'Error crítico' }}
                </td>
              </tr>

              <!-- 3. Sandbox de código -->
              <tr class="hover:bg-base-bg-secundario/40 transition-colors">
                <td class="p-3 font-bold font-sans text-base-texto-primario">Sandbox de código</td>
                <td class="p-3 text-base-texto-secundario">
                  Adapter: {{ statusData.sandbox.adapter || '—' }} · Timeout: {{ statusData.sandbox.timeoutMs }} ms
                </td>
                <td class="p-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="statusData.database.ok ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-base-bg-secundario text-slate-600 border border-base-borde-sutil'">
                    {{ statusData.database.ok ? 'Aislado' : '— Sin datos' }}
                  </span>
                </td>
                <td class="p-3 text-center text-base-texto-primario">
                  Límite: {{ statusData.sandbox.maxHeapMb }} MB Heap / {{ statusData.sandbox.maxOutputKb }} KB Out
                </td>
                <td class="p-3 text-right font-sans text-base-texto-secundario">
                  {{ statusData.sandbox.executionsLast24h != null ? `${statusData.sandbox.executionsLast24h} ejec. en 24h` : '—' }}
                </td>
              </tr>

              <!-- 4. Cola de calificación (Judge Queue) -->
              <tr class="hover:bg-base-bg-secundario/40 transition-colors">
                <td class="p-3 font-bold font-sans text-base-texto-primario">Cola de calificación</td>
                <td class="p-3 text-base-texto-secundario">
                  Driver: {{ statusData.judgeQueue.driver || 'inline' }}
                </td>
                <td class="p-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="statusData.database.ok ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-base-bg-secundario text-slate-600 border border-base-borde-sutil'">
                    {{ statusData.database.ok ? 'Listo' : '— Sin datos' }}
                  </span>
                </td>
                <td class="p-3 text-center text-base-texto-primario">
                  En progreso: {{ statusData.judgeQueue.submissionsInProgress != null ? statusData.judgeQueue.submissionsInProgress : '—' }}
                </td>
                <td class="p-3 text-right font-sans text-base-texto-secundario">
                  {{ statusData.database.ok ? 'Calificación activa' : '—' }}
                </td>
              </tr>

              <!-- 5. Tutor socrático IA -->
              <tr class="hover:bg-base-bg-secundario/40 transition-colors">
                <td class="p-3 font-bold font-sans text-base-texto-primario">Tutor socrático IA</td>
                <td class="p-3 text-base-texto-secundario">
                  {{ statusData.tutor.provider || 'Gemini' }} · {{ statusData.tutor.model || '—' }}
                </td>
                <td class="p-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="statusData.database.ok ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-base-bg-secundario text-slate-600 border border-base-borde-sutil'">
                    {{ statusData.database.ok ? 'Adaptativo' : '— Sin datos' }}
                  </span>
                </td>
                <td class="p-3 text-center text-base-texto-primario">
                  {{ statusData.tutor.studentsWithKey != null ? statusData.tutor.studentsWithKey : '—' }} claves activas
                </td>
                <td class="p-3 text-right font-sans text-base-texto-secundario">
                  {{ statusData.tutor.studentMessagesLast24h != null ? `${statusData.tutor.studentMessagesLast24h} msgs en 24h` : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot, CircleCheck, CircleX, Loader2, TriangleAlert, Users, Zap } from 'lucide-vue-next'
import { useAdminSistema } from '~/composables/useAdminSistema'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'
import type { SystemStatus } from '~/types'

definePageMeta({
  layout: 'admin'
})

const sistema = useAdminSistema()
const { extract } = useApiErrorMessage()

const statusData = ref<SystemStatus | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const isSystemHealthy = computed(() => {
  if (!statusData.value) return false
  const dbOk = statusData.value.database.ok
  const errorRate = statusData.value.api.requests.serverErrorRatePct ?? 0
  return dbOk && errorRate <= 5
})

const formattedGeneratedAt = computed(() => {
  if (!statusData.value?.generatedAt) return '—'
  try {
    const d = new Date(statusData.value.generatedAt)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return statusData.value.generatedAt
  }
})

const formattedUserRoles = computed(() => {
  if (!statusData.value?.users?.byRole) return '—'
  const roles = statusData.value.users.byRole
  const est = roles.estudiante ?? 0
  const doc = roles.docente ?? 0
  const adm = roles.admin ?? 0
  return `${plural(est, 'estudiante', 'estudiantes')} · ${plural(doc, 'docente', 'docentes')} · ${plural(adm, 'administrador', 'administradores')}`
})

function formatUptime(seconds: number): string {
  if (!seconds || seconds < 0) return '0 seg'
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s} seg`
}

async function fetchStatus() {
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await sistema.estado()
    statusData.value = res
  } catch (err) {
    const { status, detail } = extract(err)
    if (status === 403) {
      errorMessage.value = 'No tienes permisos de administrador para consultar el estado del sistema.'
    } else {
      errorMessage.value = detail || 'Error al conectar con el servicio de telemetría del backend.'
    }
  } finally {
    isLoading.value = false
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    fetchStatus()
  }
}

onMounted(() => {
  fetchStatus()
  // Actualización periódica cada 30 segundos si la pestaña está visible (§21.2)
  refreshInterval = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      fetchStatus()
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
