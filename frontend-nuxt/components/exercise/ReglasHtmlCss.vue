<template>
  <!-- «Reglas a cumplir» de la página web. Va bajo la vista previa o, con la distribución «Reglas a la izquierda», junto al
       enunciado (mesa de trabajo, 14/11; utils/mesaEjercicio.ts). -->
  <div class="flex-1 flex flex-col min-h-[220px] lg:min-h-0 overflow-hidden bg-base-blanco">
    <div class="h-9 bg-base-bg-secundario border-b border-base-borde-sutil px-3 flex items-center justify-between text-xs font-semibold text-base-texto-primario flex-shrink-0">
      <div class="flex items-center gap-2">
        <ClipboardList :size="16" aria-hidden="true" />
        <span>Reglas a cumplir</span>
        <span v-if="resumen" class="text-[10px] px-1.5 rounded-full font-bold" :class="resumen.allPassed ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
          {{ resumen.passedCount }}/{{ resumen.totalCount }}
        </span>
      </div>
      <div class="text-[11px] text-base-texto-secundario">
        {{ ws.htmlCssResults ? 'Reglas evaluadas' : 'Pendiente de probar' }}
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
      <!-- El error (429 u otro) queda en el store: se ve aquí se pulse «Probar» donde se pulse. -->
      <div v-if="ws.htmlCssRunError" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 rounded-lg text-semantico-falla text-xs flex items-start gap-2">
        <TriangleAlert :size="14" aria-hidden="true" />
        <div class="flex-1 leading-snug">
          <p class="font-semibold">{{ ws.htmlCssRateLimited ? 'Límite alcanzado' : 'No se pudo probar' }}</p>
          <p class="text-[11px] mt-0.5">{{ ws.htmlCssRunError }}</p>
        </div>
      </div>

      <div v-for="rule in reglas" :key="rule.id" class="p-3 rounded-lg border transition-colors" :class="claseCaja(rule.id)">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <p class="font-medium text-base-texto-primario leading-snug">{{ rule.label }}</p>
            <p v-if="rule.hint" class="text-[11px] text-base-texto-secundario mt-1 italic">{{ rule.hint }}</p>
            <p v-if="resultado(rule.id)?.detail" class="text-[11px] text-semantico-falla mt-1.5 font-medium bg-semantico-falla/5 p-1.5 rounded border border-semantico-falla/20">
              {{ resultado(rule.id)?.detail }}
            </p>
          </div>
          <!-- Neutro «—» antes de probar; ✔ / ✖ después. -->
          <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-mono" :class="claseMarca(rule.id)">
            <span>{{ marca(rule.id) }}</span>
          </div>
        </div>
      </div>

      <div class="pt-2 text-xs text-base-texto-secundario border-t border-base-borde-sutil">
        <p v-if="typeof ocultas === 'number'" class="flex items-center gap-1.5 text-[11px]">
          <Lock :size="16" aria-hidden="true" />
          <span>{{ ocultas === 1 ? '1 regla oculta se evalúa' : `${ocultas} reglas ocultas se evalúan` }} al entregar.</span>
        </p>
        <p v-else class="text-[11px] font-mono">—</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardList, Lock, TriangleAlert } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspace'

const ws = useWorkspaceStore()
const config = computed(() => ws.currentQuestion?.config || {})
const reglas = computed<Array<{ id: string; label: string; hint?: string }>>(() => (Array.isArray(config.value.publicRules) ? config.value.publicRules : []))
const ocultas = computed(() => (typeof config.value.hiddenRuleCount === 'number' ? config.value.hiddenRuleCount : null))

const resumen = computed(() => {
  const res = ws.htmlCssResults
  if (!res || !Array.isArray(res.results)) return null
  return { passedCount: res.results.filter((r) => r.passed).length, totalCount: res.results.length, allPassed: res.allPassed }
})

function resultado(id: string) {
  const res = ws.htmlCssResults
  return res && Array.isArray(res.results) ? res.results.find((r) => r.id === id) ?? null : null
}
const marca = (id: string) => { const r = resultado(id); return !r ? '—' : r.passed ? '✔' : '✖' }
function claseMarca(id: string) {
  const r = resultado(id)
  if (!r) return 'bg-base-bg-secundario text-slate-600 border border-base-borde-sutil'
  return r.passed ? 'bg-semantico-pasa/15 text-semantico-pasa border border-semantico-pasa/30' : 'bg-semantico-falla/15 text-semantico-falla border border-semantico-falla/30'
}
function claseCaja(id: string) {
  const r = resultado(id)
  if (!r) return 'bg-base-blanco border-base-borde-sutil'
  return r.passed ? 'bg-semantico-pasa/5 border-semantico-pasa/30' : 'bg-semantico-falla/5 border-semantico-falla/30'
}
</script>
