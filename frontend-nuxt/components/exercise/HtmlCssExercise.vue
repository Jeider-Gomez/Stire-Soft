<template>
  <div class="flex-1 flex flex-col lg:flex-row h-full w-full overflow-hidden bg-base-bg-primario">
    <!-- COLUMNA IZQUIERDA: Editor de pestañas HTML y CSS -->
    <div class="w-full lg:w-1/2 flex flex-col h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-base-borde-sutil bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden">
      <!-- Barra superior con pestañas -->
      <div class="h-10 bg-[#252526] border-b border-[#333333] px-3 flex items-center justify-between text-xs flex-shrink-0">
        <div class="flex items-center gap-1">
          <button
            type="button"
            @click="activeEditorTab = 'html'"
            class="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            :class="activeEditorTab === 'html' ? 'bg-[#1e1e1e] text-[#e34c26] border border-[#3e3e42] shadow-xs' : 'text-[#858585] hover:text-[#d4d4d4] hover:bg-[#2a2d2e]'">
            <span class="font-bold">HTML</span>
            <span class="text-[10px] text-[#858585]">index.html</span>
          </button>

          <button
            type="button"
            @click="activeEditorTab = 'css'"
            class="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            :class="activeEditorTab === 'css' ? 'bg-[#1e1e1e] text-[#264de4] border border-[#3e3e42] shadow-xs' : 'text-[#858585] hover:text-[#d4d4d4] hover:bg-[#2a2d2e]'">
            <span class="font-bold">CSS</span>
            <span class="text-[10px] text-[#858585]">estilos.css</span>
          </button>
        </div>

        <div class="flex items-center gap-3 text-[11px] text-[#858585]">
          <span>{{ activeEditorTab === 'html' ? 'HTML5' : 'CSS3' }}</span>
          <span>UTF-8</span>
        </div>
      </div>

      <!-- Área de Edición: Pestaña HTML -->
      <div v-show="activeEditorTab === 'html'" class="flex-1 relative flex overflow-hidden">
        <div class="w-10 bg-[#1e1e1e] py-3 text-right pr-2 text-[#5a5a5a] font-mono text-xs select-none border-r border-[#2d2d2d] flex flex-col flex-shrink-0">
          <span v-for="n in htmlLineCount" :key="n">{{ n }}</span>
        </div>
        <textarea
          v-model="workspaceStore.htmlCode"
          @input="onCodeInput"
          spellcheck="false"
          class="flex-1 h-full bg-transparent text-[#d4d4d4] font-mono text-xs p-3 leading-relaxed outline-none resize-none selection:bg-[#264f78]"
          placeholder="<!-- Escribe aquí tu estructura HTML -->"></textarea>
      </div>

      <!-- Área de Edición: Pestaña CSS -->
      <div v-show="activeEditorTab === 'css'" class="flex-1 relative flex overflow-hidden">
        <div class="w-10 bg-[#1e1e1e] py-3 text-right pr-2 text-[#5a5a5a] font-mono text-xs select-none border-r border-[#2d2d2d] flex flex-col flex-shrink-0">
          <span v-for="n in cssLineCount" :key="n">{{ n }}</span>
        </div>
        <textarea
          v-model="workspaceStore.cssCode"
          @input="onCodeInput"
          spellcheck="false"
          class="flex-1 h-full bg-transparent text-[#d4d4d4] font-mono text-xs p-3 leading-relaxed outline-none resize-none selection:bg-[#264f78]"
          placeholder="/* Escribe aquí tus estilos CSS */"></textarea>
      </div>

      <!-- Barra de estado del editor -->
      <div class="h-7 bg-[#252526] border-t border-[#333333] px-3 flex items-center justify-between text-[11px] text-[#858585] flex-shrink-0">
        <div class="flex items-center gap-2">
          <span>{{ workspaceStore.lastAutosave }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span>Líneas: {{ activeEditorTab === 'html' ? htmlLineCount : cssLineCount }}</span>
          <span>•</span>
          <span>Caracteres: {{ (activeEditorTab === 'html' ? workspaceStore.htmlCode : workspaceStore.cssCode).length }}</span>
        </div>
      </div>
    </div>

    <!-- COLUMNA DERECHA: Vista previa arriba y Reglas abajo -->
    <div class="w-full lg:w-1/2 flex flex-col h-1/2 lg:h-full bg-base-blanco overflow-hidden">
      <!-- PANEL SUPERIOR: Vista previa (Iframe aislado) -->
      <div class="flex-1 flex flex-col min-h-[180px] lg:h-1/2 border-b border-base-borde-sutil overflow-hidden">
        <div class="h-9 bg-base-bg-secundario border-b border-base-borde-sutil px-3 flex items-center justify-between text-xs font-semibold text-base-texto-primario flex-shrink-0">
          <div class="flex items-center gap-2">
            <span>🌐</span>
            <span>Vista previa</span>
            <span class="text-[10px] font-normal text-base-texto-secundario">(actualización en vivo)</span>
          </div>
          <span class="text-[10px] font-mono text-base-texto-secundario bg-base-blanco px-1.5 py-0.5 rounded border border-base-borde-sutil">
            sandbox seguro
          </span>
        </div>

        <div class="flex-1 w-full h-full bg-white relative overflow-hidden">
          <!-- CRITICAL SECURITY: sandbox vacio estricto sin permisos -->
          <iframe
            sandbox=""
            title="Vista previa del ejercicio"
            :srcdoc="previewDoc"
            class="w-full h-full border-0 bg-white"
          ></iframe>
        </div>
      </div>

      <!-- PANEL INFERIOR: Reglas y Botones de Acción -->
      <div class="flex-1 flex flex-col min-h-[220px] lg:h-1/2 overflow-hidden bg-base-blanco">
        <!-- Cabecera de Reglas -->
        <div class="h-9 bg-base-bg-secundario border-b border-base-borde-sutil px-3 flex items-center justify-between text-xs font-semibold text-base-texto-primario flex-shrink-0">
          <div class="flex items-center gap-2">
            <span>📋</span>
            <span>Reglas a cumplir</span>
            <span v-if="rulesSummary" class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="rulesSummary.allPassed ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
              {{ rulesSummary.passedCount }}/{{ rulesSummary.totalCount }}
            </span>
          </div>

          <div class="text-[11px] text-base-texto-secundario">
            {{ workspaceStore.htmlCssResults ? 'Reglas evaluadas' : 'Pendiente de probar' }}
          </div>
        </div>

        <!-- Lista de Reglas -->
        <div class="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          <!-- Alerta de Error (429 u otros) -->
          <div v-if="runErrorMessage" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 rounded-lg text-semantico-falla text-xs flex items-start gap-2">
            <span class="font-bold text-sm">⚠</span>
            <div class="flex-1 leading-snug">
              <p class="font-semibold">{{ isRateLimitError ? 'Límite alcanzado' : 'No se pudo probar' }}</p>
              <p class="text-[11px] mt-0.5">{{ runErrorMessage }}</p>
            </div>
          </div>

          <!-- Reglas públicas -->
          <div
            v-for="rule in publicRulesList"
            :key="rule.id"
            class="p-3 rounded-lg border transition-colors"
            :class="getRuleContainerClass(rule.id)">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <p class="font-medium text-base-texto-primario leading-snug">{{ rule.label }}</p>
                <p v-if="rule.hint" class="text-[11px] text-base-texto-secundario mt-1 italic">
                  💡 {{ rule.hint }}
                </p>
                <!-- Detalle de fallo si vino del servidor -->
                <p v-if="getRuleDetail(rule.id)" class="text-[11px] text-semantico-falla mt-1.5 font-medium bg-semantico-falla/5 p-1.5 rounded border border-semantico-falla/20">
                  {{ getRuleDetail(rule.id) }}
                </p>
              </div>

              <!-- Estado de la regla: Neutro «—» antes de probar; ✔ / ✘ después -->
              <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-mono" :class="getRuleBadgeClass(rule.id)">
                <span>{{ getRuleBadgeText(rule.id) }}</span>
              </div>
            </div>
          </div>

          <!-- Reglas ocultas -->
          <div class="pt-2 text-xs text-base-texto-secundario border-t border-base-borde-sutil">
            <p v-if="typeof hiddenRuleCount === 'number'" class="flex items-center gap-1.5 text-[11px]">
              <span>🔒</span>
              <span>
                {{ hiddenRuleCount === 1 ? '1 regla oculta se evalúa' : `${hiddenRuleCount} reglas ocultas se evalúan` }} al entregar.
              </span>
            </p>
            <p v-else class="text-[11px] font-mono">
              —
            </p>
          </div>
        </div>

        <!-- Botones de Acción (Zona D) -->
        <div class="p-3 border-t border-base-borde-sutil bg-base-bg-secundario/50 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            @click="handleRun"
            :disabled="workspaceStore.isRunning || workspaceStore.isSubmitting || isHtmlEmpty"
            class="borde-afordancia px-3 py-1.5 rounded text-xs font-bold text-base-texto-primario bg-base-blanco hover:bg-base-bg-secundario transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            :title="isHtmlEmpty ? 'El HTML no puede estar vacío' : 'Evalúa contra las reglas públicas sin consumir intentos'">
            <span v-if="workspaceStore.isRunning" class="animate-spin">⚙️</span>
            <span v-else>▶</span>
            <span>Probar</span>
          </button>

          <button
            type="button"
            @click="handleSubmit"
            :disabled="workspaceStore.isRunning || workspaceStore.isSubmitting || isHtmlEmpty"
            class="px-3.5 py-1.5 rounded text-xs font-bold text-base-blanco bg-acento-ambar-fuerte hover:bg-acento-ambar transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            :title="isHtmlEmpty ? 'El HTML no puede estar vacío' : 'Envía tu solución definitiva para calificación'">
            <span v-if="workspaceStore.isSubmitting" class="animate-spin">⏳</span>
            <span v-else>🚀</span>
            <span>Entregar solución</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'
import type { WorkspaceQuestion } from '~/stores/workspace'

const props = defineProps<{
  question?: WorkspaceQuestion | null
}>()

const workspaceStore = useWorkspaceStore()
const { messageOf, extract } = useApiErrorMessage()

const activeEditorTab = ref<'html' | 'css'>('html')
const runErrorMessage = ref<string | null>(null)
const isRateLimitError = ref(false)

// Config de la pregunta
const questionConfig = computed(() => {
  return props.question?.config || workspaceStore.currentQuestion?.config || {}
})

const publicRulesList = computed(() => {
  const rules = questionConfig.value.publicRules
  return Array.isArray(rules) ? rules : []
})

const hiddenRuleCount = computed(() => {
  const count = questionConfig.value.hiddenRuleCount
  return typeof count === 'number' ? count : null
})

const isHtmlEmpty = computed(() => {
  return !workspaceStore.htmlCode || !workspaceStore.htmlCode.trim()
})

const htmlLineCount = computed(() => {
  return Math.max(workspaceStore.htmlCode.split('\n').length, 12)
})

const cssLineCount = computed(() => {
  return Math.max(workspaceStore.cssCode.split('\n').length, 12)
})

// Vista previa con debounce ~300ms
const debouncedHtml = ref(workspaceStore.htmlCode)
const debouncedCss = ref(workspaceStore.cssCode)
let debounceTimer: ReturnType<typeof setTimeout> | undefined

function onCodeInput() {
  workspaceStore.triggerAutosave()
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedHtml.value = workspaceStore.htmlCode
    debouncedCss.value = workspaceStore.cssCode
  }, 300)
}

// Inicializar debounced con los valores cargados
watch(
  () => [workspaceStore.htmlCode, workspaceStore.cssCode],
  ([newHtml, newCss]) => {
    if (!debounceTimer) {
      debouncedHtml.value = newHtml
      debouncedCss.value = newCss
    }
  },
  { immediate: true }
)

/**
 * Genera el documento HTML completo con Content-Security-Policy estricto
 * y sin posibilidad de escape hacia la página padre.
 */
const previewDoc = computed(() => {
  const html = debouncedHtml.value || ''
  const css = debouncedCss.value || ''

  const cspMeta = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; font-src data:">'
  const styleTag = `<style>${css}</style>`

  if (html.toLowerCase().includes('<head>')) {
    // Si ya trae <head>, inserta CSP y estilo justo después de <head>
    return html.replace(/<head>/i, `<head>${cspMeta}${styleTag}`)
  } else if (html.toLowerCase().includes('<html>')) {
    return html.replace(/<html>/i, `<html><head>${cspMeta}${styleTag}</head>`)
  } else {
    // Si es un fragmento simple, envuélvelo en estructura completa
    return `<!DOCTYPE html><html><head>${cspMeta}${styleTag}</head><body>${html}</body></html>`
  }
})

// Resumen de reglas tras evaluación
const rulesSummary = computed(() => {
  const res = workspaceStore.htmlCssResults
  if (!res || !Array.isArray(res.results)) return null
  const passedCount = res.results.filter(r => r.passed).length
  return {
    passedCount,
    totalCount: res.results.length,
    allPassed: res.allPassed
  }
})

function getRuleResult(ruleId: string) {
  const res = workspaceStore.htmlCssResults
  if (!res || !Array.isArray(res.results)) return null
  return res.results.find(r => r.id === ruleId) ?? null
}

function getRuleBadgeText(ruleId: string): string {
  const result = getRuleResult(ruleId)
  if (!result) return '—'
  return result.passed ? '✔' : '✖'
}

function getRuleBadgeClass(ruleId: string): string {
  const result = getRuleResult(ruleId)
  if (!result) return 'bg-base-bg-secundario text-base-texto-secundario border border-base-borde-sutil'
  return result.passed
    ? 'bg-semantico-pasa/15 text-semantico-pasa border border-semantico-pasa/30'
    : 'bg-semantico-falla/15 text-semantico-falla border border-semantico-falla/30'
}

function getRuleContainerClass(ruleId: string): string {
  const result = getRuleResult(ruleId)
  if (!result) return 'bg-base-blanco border-base-borde-sutil'
  return result.passed
    ? 'bg-semantico-pasa/5 border-semantico-pasa/30'
    : 'bg-semantico-falla/5 border-semantico-falla/30'
}

function getRuleDetail(ruleId: string): string | null {
  const result = getRuleResult(ruleId)
  return result?.detail || null
}

// Acción: Probar reglas públicas
async function handleRun() {
  if (isHtmlEmpty.value) return
  runErrorMessage.value = null
  isRateLimitError.value = false

  try {
    await workspaceStore.runHtmlCss()
  } catch (err: any) {
    const { status } = extract(err)
    if (status === 429) {
      isRateLimitError.value = true
      runErrorMessage.value = 'Has superado el límite de intentos por minuto para probar. Espera un momento antes de volver a intentar.'
    } else {
      isRateLimitError.value = false
      runErrorMessage.value = messageOf(err, 'Ocurrió un error al evaluar tu HTML y CSS.')
    }
  }
}

// Acción: Entregar solución definitiva
async function handleSubmit() {
  if (isHtmlEmpty.value) return
  await workspaceStore.submitSolution()
}
</script>

