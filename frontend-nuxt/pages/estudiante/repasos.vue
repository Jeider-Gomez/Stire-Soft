<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Cabecera de Repasos SM-2 (EST-V05) -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-acento-ambar/15 text-acento-ambar-fuerte uppercase tracking-wider">
            Memoria Activa • Motor SM-2
          </span>
          <span class="text-xs text-base-texto-secundario">Sesión Preventiva</span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Repasos Diarios de Algoritmia
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Consolidación de conceptos antes de que decaiga la curva del olvido
        </p>
      </div>

      <!-- Indicador de Sesión Corta -->
      <div class="p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil text-center flex-shrink-0">
        <span class="text-xs text-base-texto-secundario block">Tiempo Total Estimado:</span>
        <span class="text-lg font-bold text-acento-ambar-fuerte">~13 minutos</span>
      </div>
    </header>

    <!-- Leyenda de Triple Codificación Accesible (P06 — WCAG 2.1 AA) -->
    <section class="bg-base-blanco rounded-lg border border-base-borde-sutil p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-base-texto-secundario">
      <span class="font-bold text-base-texto-primario text-[11px]">Niveles de Urgencia Accesible:</span>
      <div class="flex items-center gap-4 text-[11px]">
        <span class="flex items-center gap-1.5 font-medium text-semantico-falla">
          <span>■</span>
          <span>Crítico (Repasar hoy)</span>
        </span>
        <span class="flex items-center gap-1.5 font-medium text-acento-ambar-fuerte">
          <span>▲</span>
          <span>Pendiente / Mañana</span>
        </span>
        <span class="flex items-center gap-1.5 font-medium text-semantico-pasa">
          <span>⬤</span>
          <span>Al día (Retención alta)</span>
        </span>
      </div>
    </section>

    <!-- Lista de Conceptos a Repasar -->
    <section class="space-y-3">
      <div
        v-for="item in studentStore.reviews"
        :key="item.id"
        class="bg-base-blanco rounded-xl border p-5 shadow-sm space-y-3 transition-all"
        :class="{
          'border-semantico-falla/40': item.urgency === 'critico',
          'border-acento-ambar-fuerte/40': item.urgency === 'vencido',
          'border-base-borde-sutil': item.urgency === 'al-dia'
        }">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <!-- Triple Codificación: Forma + Color + Texto (P06) -->
              <span
                class="px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
                :class="getUrgencyBadgeClass(item.urgency)">
                <span>{{ getUrgencyShape(item.urgency) }}</span>
                <span>{{ item.urgencyLabel }}</span>
              </span>

              <span class="text-xs text-base-texto-secundario font-medium">
                {{ item.moduleTitle }}
              </span>
            </div>

            <h3 class="text-sm font-bold text-base-texto-primario">
              {{ item.conceptTitle }}
            </h3>
          </div>

          <!-- Botón de Refuerzo Rápido -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <span class="text-xs text-base-texto-secundario">
              ⏱ ~{{ item.estimatedTimeMin }} min
            </span>

            <button
              @click="completeReview(item.id)"
              class="px-4 py-2 rounded-md font-bold text-xs transition-colors shadow-sm"
              :class="item.urgency === 'critico'
                ? 'bg-semantico-falla hover:opacity-90 text-base-blanco'
                : 'bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco'">
              Iniciar Refuerzo
            </button>
          </div>
        </div>

        <!-- Explicación pedagógica no punitiva (P04) -->
        <p class="text-xs text-base-texto-secundario bg-base-bg-secundario/60 p-2.5 rounded border border-base-borde-sutil/60">
          💡 <strong>Objetivo de retención:</strong> Refuerza este concepto ahora para elevar tu factor de estabilidad de memoria y evitar olvido en la siguiente evaluación.
        </p>
      </div>
    </section>

    <!-- Estado si todo está al día -->
    <div
      v-if="studentStore.reviews.length === 0"
      class="bg-base-blanco rounded-xl border border-semantico-pasa/40 p-8 text-center space-y-3 shadow-sm">
      <div class="w-12 h-12 rounded-full bg-semantico-pasa/15 text-semantico-pasa flex items-center justify-center text-xl mx-auto font-bold">
        ⬤
      </div>
      <h3 class="font-bold text-base text-base-texto-primario">¡Estás al día con todos tus repasos!</h3>
      <p class="text-xs text-base-texto-secundario max-w-md mx-auto">
        Tu memoria a largo plazo está consolidada según el algoritmo SM-2. Puedes continuar avanzando en nuevos módulos.
      </p>
      <NuxtLink
        to="/estudiante"
        class="inline-block px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs">
        Volver al Inicio
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStudentStore } from '~/stores/student'
import type { ReviewUrgency } from '~/types'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()

onMounted(() => {
  studentStore.fetchStudentData()
})

function getUrgencyBadgeClass(urgency: ReviewUrgency) {
  switch (urgency) {
    case 'critico': return 'bg-semantico-falla/15 text-semantico-falla'
    case 'vencido': return 'bg-urgencia-repaso-vencido/15 text-urgencia-repaso-vencido'
    case 'manana': return 'bg-acento-ambar-fuerte/15 text-acento-ambar-fuerte'
    case 'al-dia': return 'bg-semantico-pasa/15 text-semantico-pasa'
  }
}

function getUrgencyShape(urgency: ReviewUrgency) {
  switch (urgency) {
    case 'critico': return '■'
    case 'vencido': return '▲'
    case 'manana': return '▲'
    case 'al-dia': return '⬤'
  }
}

function completeReview(id: number) {
  studentStore.reviews = studentStore.reviews.filter(r => r.id !== id)
}
</script>
