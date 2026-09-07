<template>
  <div class="h-full flex flex-col md:flex-row overflow-hidden bg-base-bg-primario">
    <!-- COLUMNA IZQUIERDA: Enunciado, Casos de Prueba y Consola -->
    <div class="w-full md:w-[45%] lg:w-[40%] flex flex-col border-r border-base-borde-sutil bg-base-blanco h-full overflow-hidden">
      <!-- Pestañas de Navegación del Panel Izquierdo -->
      <div class="flex items-center border-b border-base-borde-sutil bg-base-bg-secundario text-xs font-semibold px-2 pt-2 gap-1 flex-shrink-0">
        <button
          @click="leftTab = 'enunciado'"
          class="px-3 py-2 rounded-t-md transition-colors"
          :class="leftTab === 'enunciado' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-base-texto-secundario hover:text-base-texto-primario'">
          📖 Enunciado
        </button>

        <button
          @click="leftTab = 'casos'"
          class="px-3 py-2 rounded-t-md transition-colors flex items-center gap-1.5"
          :class="leftTab === 'casos' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-base-texto-secundario hover:text-base-texto-primario'">
          <span>🧪 Casos de Prueba</span>
          <span
            v-if="passedCount > 0"
            class="px-1.5 py-0.2 rounded-full text-[10px]"
            :class="passedCount === workspaceStore.publicTestCases.length ? 'bg-semantico-pasa/15 text-semantico-pasa font-bold' : 'bg-acento-ambar/15 text-acento-ambar-fuerte font-bold'">
            {{ passedCount }}/{{ workspaceStore.publicTestCases.length }}
          </span>
        </button>

        <button
          @click="leftTab = 'consola'"
          class="px-3 py-2 rounded-t-md transition-colors"
          :class="leftTab === 'consola' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-base-texto-secundario hover:text-base-texto-primario'">
          💻 Consola
        </button>
      </div>

      <!-- Contenido de las Pestañas -->
      <div class="flex-1 overflow-y-auto p-5 text-xs text-base-texto-primario leading-relaxed">
        <!-- 1. Pestaña Enunciado -->
        <div v-if="leftTab === 'enunciado'" class="space-y-4">
          <div class="prose prose-xs" v-html="formatMarkdown(workspaceStore.currentExercise.description)"></div>

          <div class="p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil space-y-1">
            <span class="font-bold text-base-texto-primario block">Criterio de Evaluación:</span>
            <ul class="list-disc pl-4 space-y-1 text-base-texto-secundario text-[11px]">
              <li>3 Casos de prueba públicos visibles.</li>
              <li>2 Casos de prueba privados de validación ciega.</li>
              <li>Límite de tiempo por ejecución: 1000 ms.</li>
            </ul>
          </div>
        </div>

        <!-- 2. Pestaña Casos de Prueba (P02 — Pedagogía del Error y Diff Visual) -->
        <div v-else-if="leftTab === 'casos'" class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil">
            <h3 class="font-bold text-xs text-base-texto-primario">Casos Públicos de Verificación</h3>
            <span class="text-[11px] text-base-texto-secundario">
              Evaluados con [▶ Probar código]
            </span>
          </div>

          <div class="space-y-3">
            <div
              v-for="tc in workspaceStore.publicTestCases"
              :key="tc.id"
              class="border rounded-lg p-3 space-y-2 transition-colors"
              :class="{
                'border-semantico-pasa/40 bg-semantico-pasa/5': tc.passed === true,
                'border-semantico-falla/40 bg-semantico-falla/5': tc.passed === false,
                'border-base-borde-sutil bg-base-bg-secundario/40': tc.passed === undefined
              }">
              <div class="flex items-center justify-between font-bold text-xs">
                <span>Caso #{{ tc.id }}: <code class="font-codigo text-acento-ambar-fuerte">{{ tc.input }}</code></span>
                <span v-if="tc.passed === true" class="text-semantico-pasa flex items-center gap-1">
                  <span>✔</span>
                  <span>Superado</span>
                </span>
                <span v-else-if="tc.passed === false" class="text-semantico-falla flex items-center gap-1">
                  <span>✖</span>
                  <span>Falla en salida</span>
                </span>
                <span v-else class="text-base-texto-secundario text-[11px]">
                  Sin evaluar
                </span>
              </div>

              <!-- Diff Visual: Esperado vs Obtenido -->
              <div class="grid grid-cols-2 gap-2 text-[11px] font-codigo pt-1">
                <div class="p-2 bg-base-blanco rounded border border-base-borde-sutil">
                  <span class="text-base-texto-secundario text-[10px] block font-sans">Salida Esperada:</span>
                  <span class="font-bold text-semantico-pasa">{{ tc.expectedOutput }}</span>
                </div>
                <div class="p-2 bg-base-blanco rounded border border-base-borde-sutil">
                  <span class="text-base-texto-secundario text-[10px] block font-sans">Salida de tu Código:</span>
                  <span :class="tc.passed ? 'text-semantico-pasa font-bold' : tc.passed === false ? 'text-semantico-falla font-bold' : 'text-base-texto-secundario'">
                    {{ tc.actualOutput || '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-3 bg-base-bg-secundario rounded border border-base-borde-sutil text-[11px] text-base-texto-secundario flex items-center gap-2">
            <span>🔒</span>
            <span>2 Casos privados permanecen ocultos para evaluar generalización de la solución.</span>
          </div>
        </div>

        <!-- 3. Pestaña Consola de Ejecución -->
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between pb-1 border-b border-base-borde-sutil">
            <span class="font-bold text-xs">Historial de Salida</span>
            <button
              @click="workspaceStore.consoleLog = ['Consola limpiada.']"
              class="text-[11px] text-base-texto-secundario hover:text-base-texto-primario underline">
              Limpiar
            </button>
          </div>

          <div class="bg-[#1e1e1e] text-[#d4d4d4] p-3 rounded-lg font-codigo text-xs space-y-1 min-h-[220px] max-h-[350px] overflow-y-auto">
            <div v-for="(log, idx) in workspaceStore.consoleLog" :key="idx" class="leading-relaxed">
              <span v-if="log.startsWith('✔')" class="text-[#4ec9b0]">{{ log }}</span>
              <span v-else-if="log.startsWith('✖') || log.startsWith('⚠')" class="text-[#f14c4c]">{{ log }}</span>
              <span v-else-if="log.startsWith('🎯')" class="text-[#dcdcaa] font-bold">{{ log }}</span>
              <span v-else class="text-[#9cdcfe]">{{ log }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- COLUMNA DERECHA: Editor de Código Reactivo -->
    <div class="flex-1 flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden">
      <!-- Barra Superior del Editor -->
      <div class="h-9 bg-[#252526] border-b border-[#333333] px-4 flex items-center justify-between text-xs text-[#858585] flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-acento-ambar font-bold">JS</span>
          <span class="text-white font-medium">solucion.js</span>
          <span class="text-[10px] text-[#858585]">• JavaScript (ES2024)</span>
        </div>

        <div class="flex items-center gap-3 text-[11px]">
          <span>Tabulaciones: 2 espacios</span>
          <span>UTF-8</span>
        </div>
      </div>

      <!-- Área de Edición de Código -->
      <div class="flex-1 relative flex">
        <!-- Números de Línea -->
        <div class="w-10 bg-[#1e1e1e] py-3 text-right pr-2 text-[#5a5a5a] font-codigo text-xs select-none border-r border-[#2d2d2d] flex flex-col">
          <span v-for="n in lineCount" :key="n">{{ n }}</span>
        </div>

        <!-- Textarea con estilo de editor -->
        <textarea
          v-model="workspaceStore.code"
          @input="workspaceStore.triggerAutosave"
          spellcheck="false"
          class="flex-1 h-full bg-transparent text-[#d4d4d4] font-codigo text-xs p-3 leading-relaxed outline-none resize-none selection:bg-[#264f78]"
          placeholder="// Escribe tu solución aquí..."></textarea>
      </div>

      <!-- Barra de Estado Inferior del Editor -->
      <div class="h-7 bg-[#007acc] text-white px-4 flex items-center justify-between text-[11px] flex-shrink-0 font-medium">
        <div class="flex items-center gap-3">
          <span>STIRE Sandbox Endurecido</span>
          <span>•</span>
          <span>{{ workspaceStore.lastAutosave }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span>Líneas: {{ lineCount }}</span>
          <span>•</span>
          <span>Caracteres: {{ workspaceStore.code.length }}</span>
        </div>
      </div>
    </div>

    <!-- Modal de Resultado de Entrega Exitosa -->
    <div
      v-if="workspaceStore.submissionResult"
      class="fixed inset-0 bg-base-texto-primario/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
        <div class="w-14 h-14 bg-semantico-pasa/15 text-semantico-pasa rounded-full flex items-center justify-center text-2xl mx-auto font-bold">
          🎉
        </div>

        <h3 class="text-lg font-bold text-base-texto-primario">
          ¡Ejercicio Completado con Éxito!
        </h3>

        <div class="p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil">
          <p class="text-2xl font-bold text-semantico-pasa">100 / 100 pts</p>
          <p class="text-xs text-base-texto-secundario mt-1">
            Superaste 3 casos públicos y 2 casos privados de prueba.
          </p>
        </div>

        <p class="text-xs text-base-texto-secundario">
          Tu dominio sobre <strong>Ciclos e Iteraciones</strong> se ha incrementado a <strong>85%</strong>.
        </p>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="workspaceStore.submissionResult = null"
            class="flex-1 py-2 rounded-md borde-afordancia text-xs font-semibold bg-base-blanco text-base-texto-primario">
            Seguir practicando
          </button>

          <NuxtLink
            to="/estudiante"
            class="flex-1 py-2 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco text-xs font-bold transition-colors">
            Volver al Inicio
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

definePageMeta({
  layout: 'workspace'
})

const workspaceStore = useWorkspaceStore()
const leftTab = ref<'enunciado' | 'casos' | 'consola'>('enunciado')

const passedCount = computed(() => {
  return workspaceStore.publicTestCases.filter(tc => tc.passed === true).length
})

const lineCount = computed(() => {
  return Math.max(workspaceStore.code.split('\n').length, 18)
})

function formatMarkdown(raw: string) {
  return raw
    .replace(/### (.*?)\n/g, '<h4 class="font-bold text-xs text-base-texto-primario mt-2 mb-1">$1</h4>')
    .replace(/#### (.*?)\n/g, '<h5 class="font-bold text-xs text-base-texto-primario mt-2 mb-1">$1</h5>')
    .replace(/`([^`]+)`/g, '<code class="bg-base-bg-secundario px-1.5 py-0.5 rounded text-acento-ambar-fuerte font-codigo text-[11px] border border-base-borde-sutil">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
}
</script>
