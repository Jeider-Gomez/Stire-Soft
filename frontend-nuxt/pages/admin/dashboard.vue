<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Banner Figma Normativo Obligatorio (D-03) -->
    <div class="p-3.5 bg-acento-ambar/15 border border-acento-ambar-fuerte/40 rounded-xl text-xs text-base-texto-primario flex items-center gap-3 shadow-xs">
      <span class="text-xl">⚠️</span>
      <div>
        <strong class="font-bold text-acento-ambar-fuerte">Ejemplo — sin backend (D-03):</strong>
        <span> Esta vista representa el diseño de Figma para el Panel de Control y Salud del Sistema STIRE. Las métricas mostradas son demostrativas.</span>
      </div>
    </div>

    <!-- Cabecera ADM-V01 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa uppercase tracking-wider">
            Administración del Sistema • ADM-V01
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa">
            ● Servicios Operacionales
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Panel de Control y Salud del Sistema
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Monitoreo de infraestructura, latencia de sandboxes y telemetría de carga
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="toggleSimulatedError"
          class="borde-afordancia px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-base-bg-secundario text-base-texto-secundario">
          {{ isSimulatedError ? 'Restaurar Normal' : 'Simular Estado Error' }}
        </button>
      </div>
    </header>

    <!-- ESTADO: Error Simulado -->
    <div v-if="isSimulatedError" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <span class="text-3xl">⚠</span>
      <h3 class="font-bold text-semantico-falla text-sm">Fallo de Telemetría Administrativa</h3>
      <p class="text-base-texto-secundario max-w-md mx-auto">
        No se pudo recopilar las métricas del clúster de ejecución aislada.
      </p>
      <button
        @click="isSimulatedError = false"
        class="px-4 py-1.5 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil">
        Reconectar servicio
      </button>
    </div>

    <!-- ESTADO: Defecto con Métricas -->
    <div v-else class="space-y-6">
      <!-- Tarjetas KPI de Salud -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- API NestJS -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-base-texto-secundario">API Gateway (NestJS)</span>
            <span class="w-2.5 h-2.5 rounded-full bg-semantico-pasa"></span>
          </div>
          <p class="text-2xl font-bold font-mono text-semantico-pasa">99.98%</p>
          <span class="text-[10px] text-base-texto-secundario">Latencia p95: 42 ms</span>
        </div>

        <!-- Sandbox BullMQ -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-base-texto-secundario">Sandbox Aislado</span>
            <span class="w-2.5 h-2.5 rounded-full bg-semantico-pasa"></span>
          </div>
          <p class="text-2xl font-bold font-mono text-base-texto-primario">1200 ms</p>
          <span class="text-[10px] text-base-texto-secundario">Tiempo ejecución promedio</span>
        </div>

        <!-- Base de Datos MariaDB -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-base-texto-secundario">Base de Datos</span>
            <span class="w-2.5 h-2.5 rounded-full bg-semantico-pasa"></span>
          </div>
          <p class="text-2xl font-bold font-mono text-base-texto-primario">14 conex.</p>
          <span class="text-[10px] text-base-texto-secundario">Pool activo: basestire</span>
        </div>

        <!-- Tutor IA LLM -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-base-texto-secundario">Tutor Gemini LLM</span>
            <span class="w-2.5 h-2.5 rounded-full bg-semantico-pasa"></span>
          </div>
          <p class="text-2xl font-bold font-mono text-acento-ambar-fuerte">0.8s</p>
          <span class="text-[10px] text-base-texto-secundario">Andamiaje socrático activo</span>
        </div>
      </section>

      <!-- Tabla de Servicios y Alertas -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
          Estado Detallado de Subsistemas STIRE
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil font-semibold">
              <tr>
                <th class="p-3">Subsistema</th>
                <th class="p-3">Puerto / Ruta</th>
                <th class="p-3 text-center">Estado</th>
                <th class="p-3 text-center">Uso Memoria</th>
                <th class="p-3 text-right">Último Latido</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-base-borde-sutil font-mono text-[11px]">
              <tr class="hover:bg-base-bg-secundario/40">
                <td class="p-3 font-bold font-sans text-base-texto-primario">STIRE Core Backend</td>
                <td class="p-3 text-base-texto-secundario">:3001 (NestJS)</td>
                <td class="p-3 text-center text-semantico-pasa font-bold">Activo ✔</td>
                <td class="p-3 text-center">142 MB</td>
                <td class="p-3 text-right font-sans text-base-texto-secundario">Hace 2 seg</td>
              </tr>
              <tr class="hover:bg-base-bg-secundario/40">
                <td class="p-3 font-bold font-sans text-base-texto-primario">Judge-Engine Runner</td>
                <td class="p-3 text-base-texto-secundario">Worker BullMQ #1</td>
                <td class="p-3 text-center text-semantico-pasa font-bold">Listo ✔</td>
                <td class="p-3 text-center">88 MB</td>
                <td class="p-3 text-right font-sans text-base-texto-secundario">Hace 5 seg</td>
              </tr>
              <tr class="hover:bg-base-bg-secundario/40">
                <td class="p-3 font-bold font-sans text-base-texto-primario">Tutor Context Analyzer</td>
                <td class="p-3 text-base-texto-secundario">/tutor/chat</td>
                <td class="p-3 text-center text-semantico-pasa font-bold">Activo ✔</td>
                <td class="p-3 text-center">95 MB</td>
                <td class="p-3 text-right font-sans text-base-texto-secundario">Hace 12 seg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const isSimulatedError = ref(false)

function toggleSimulatedError() {
  isSimulatedError.value = !isSimulatedError.value
}
</script>
