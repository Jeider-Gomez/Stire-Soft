<template>
  <div class="flex-1 flex flex-col lg:flex-row lg:h-full w-full lg:overflow-hidden bg-base-bg-primario">
    <!-- COLUMNA IZQUIERDA: Editor de pestañas HTML y CSS (toma todo lo que dejan los demás paneles) -->
    <div class="w-full lg:w-auto lg:flex-1 lg:min-w-0 flex flex-col h-[60vh] lg:h-full border-b lg:border-b-0 lg:border-r border-base-borde-sutil bg-editor-bg text-editor-text overflow-hidden">
      <!-- Barra superior con pestañas -->
      <div class="h-10 bg-editor-header border-b border-editor-border px-3 flex items-center justify-between text-xs flex-shrink-0">
        <div class="flex items-center gap-1">
          <button
            type="button"
            @click="activeEditorTab = 'html'"
            class="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            :class="activeEditorTab === 'html' ? 'bg-editor-bg text-[#fb923c] border border-editor-border shadow-xs' : 'text-editor-muted hover:text-editor-text hover:bg-editor-line'">
            <span class="font-bold">HTML</span>
            <span class="text-[10px] text-editor-muted">index.html</span>
          </button>

          <button
            type="button"
            @click="activeEditorTab = 'css'"
            class="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            :class="activeEditorTab === 'css' ? 'bg-editor-bg text-[#60a5fa] border border-editor-border shadow-xs' : 'text-editor-muted hover:text-editor-text hover:bg-editor-line'">
            <span class="font-bold">CSS</span>
            <span class="text-[10px] text-editor-muted">estilos.css</span>
          </button>
        </div>

        <div class="flex items-center gap-3 text-[11px] text-editor-muted">
          <ExerciseSelectorVistaWeb class="hidden lg:flex" />
          <span class="hidden xl:inline">{{ activeEditorTab === 'html' ? 'HTML5' : 'CSS3' }}</span>
        </div>
      </div>

      <!-- Área de Edición: Pestaña HTML (CodeMirror 6) -->
      <AvisoBorrador />
      <div v-if="activeEditorTab === 'html'" class="flex-1 relative overflow-hidden">
        <CodeEditor
          v-model="workspaceStore.htmlCode"
          language="html"
          aria-label="Editor HTML"
          placeholder="<!-- Escribe aquí tu estructura HTML -->"
          class="w-full h-full"
          @update:model-value="onCodeInput"
        />
      </div>

      <!-- Área de Edición: Pestaña CSS (CodeMirror 6) -->
      <div v-if="activeEditorTab === 'css'" class="flex-1 relative overflow-hidden">
        <CodeEditor
          v-model="workspaceStore.cssCode"
          language="css"
          aria-label="Editor CSS"
          placeholder="/* Escribe aquí tus estilos CSS */"
          class="w-full h-full"
          @update:model-value="onCodeInput"
        />
      </div>

      <!-- Barra de estado del editor -->
      <div class="h-7 bg-editor-header border-t border-editor-border px-3 flex items-center justify-between text-[11px] text-editor-muted flex-shrink-0">
        <div class="flex items-center gap-2">
          <span>{{ workspaceStore.lastAutosave }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span>Líneas: {{ (activeEditorTab === 'html' ? workspaceStore.htmlCode : workspaceStore.cssCode).split('\n').length }}</span>
          <span>•</span>
          <span>Caracteres: {{ (activeEditorTab === 'html' ? workspaceStore.htmlCode : workspaceStore.cssCode).length }}</span>
        </div>
      </div>
    </div>

    <!-- Divisor entre el código y la vista previa (mesa de trabajo, 14/11). -->
    <ExerciseDivisor v-show="!previaPlegada" class="hidden lg:flex" :model-value="anchoPrevia" :min="MEDIDAS.previa.min" :max="MEDIDAS.previa.max" :inicial="MEDIDAS.previa.inicial"
      etiqueta="Ancho de la vista previa" lado="derecha" @update:model-value="fijarAnchoPrevia" />

    <!-- COLUMNA DERECHA: vista previa y, si no están a la izquierda, las reglas. Se puede plegar a una franja. -->
    <div id="panel-previa" class="columna-previa w-full lg:w-[var(--ancho-previa)] flex flex-col lg:h-full bg-base-blanco lg:overflow-hidden" :class="{ 'lg:hidden': previaPlegada }" :style="{ '--ancho-previa': `${anchoPrevia}%` }">
      <div class="flex-1 flex flex-col min-h-[260px] lg:min-h-0 overflow-hidden" :class="reglasAqui ? 'lg:h-1/2 border-b border-base-borde-sutil' : ''">
        <div class="h-9 bg-base-bg-secundario border-b border-base-borde-sutil px-3 flex items-center justify-between gap-2 text-xs font-semibold text-base-texto-primario flex-shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <Globe :size="16" aria-hidden="true" />
            <span>Vista previa</span>
            <span class="hidden 2xl:inline text-[10px] font-normal text-base-texto-secundario truncate">(actualización en vivo)</span>
          </div>
          <span class="flex items-center gap-1">
            <span class="hidden 2xl:inline text-[10px] font-mono text-base-texto-secundario bg-base-blanco px-1.5 py-0.5 rounded border border-base-borde-sutil">sandbox seguro</span>
            <button type="button" class="hidden lg:inline-flex min-h-[32px] px-1.5 rounded-md items-center gap-1 text-[11px] text-slate-600 hover:text-base-texto-primario hover:bg-base-blanco"
              :aria-expanded="true" aria-controls="panel-previa" title="Plegar la vista previa para escribir con más espacio" @click="plegarPrevia(true)">
              <PanelRightClose :size="15" aria-hidden="true" /> Plegar<span class="sr-only"> la vista previa</span>
            </button>
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

      <!-- Las reglas: aquí, salvo con «Reglas a la izquierda» y el enunciado abierto (entonces van junto a él). -->
      <ExerciseReglasHtmlCss v-if="reglasAqui" class="lg:h-1/2" />
    </div>
    <ExerciseFranjaPanelPlegado v-if="previaPlegada" class="hidden lg:flex" controla="panel-previa" texto="Ver la vista previa" lado="derecha" @mostrar="plegarPrevia(false)" />
  </div>
</template>

<script setup lang="ts">
import { Globe, PanelRightClose } from 'lucide-vue-next'
import { MEDIDAS } from '~/utils/mesaEjercicio'
import { useWorkspaceStore } from '~/stores/workspace'
import type { WorkspaceQuestion } from '~/stores/workspace'

// La pregunta llega por prop; las reglas las lee ReglasHtmlCss.vue del store.
defineProps<{
  question?: WorkspaceQuestion | null
}>()

const workspaceStore = useWorkspaceStore()

const activeEditorTab = ref<'html' | 'css'>('html')

// Mesa de trabajo (14/11): el ancho de la vista previa, si está plegada y si las reglas van junto al enunciado.
const { valor: anchoPrevia, fijar: fijarAnchoPrevia } = useMedidaRecordada(MEDIDAS.previa.clave, MEDIDAS.previa.inicial, MEDIDAS.previa.min, MEDIDAS.previa.max)
const { plegado: previaPlegada, plegar: plegarPrevia } = usePanelPlegable('stire.ejercicio.previaPlegada')
const { plegado: reglasIzquierda } = usePanelPlegable('stire.ejercicio.reglasIzquierda')
const { plegado: enunciadoPlegado } = usePanelPlegable('stire.ejercicio.panelPlegado')
/** Si el enunciado está plegado, las reglas vuelven aquí: nunca quedan sin verse. */
const reglasAqui = computed(() => !reglasIzquierda.value || enunciadoPlegado.value)

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

</script>

