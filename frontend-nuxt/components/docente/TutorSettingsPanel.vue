<template>
  <div class="space-y-4">
    <!-- Cargando -->
    <div v-if="isLoading" class="text-xs text-base-texto-secundario animate-pulse">
      Cargando configuración del Tutor…
    </div>

    <!-- Error al cargar -->
    <div v-else-if="loadError" class="text-xs text-semantico-falla" role="alert">
      {{ loadError }}
    </div>

    <!-- Panel de configuración -->
    <div v-else-if="settings" class="space-y-3">

      <!-- 1. Tutor habilitado / desactivado -->
      <div>
        <label :for="`tutor-enabled-${scopeType}-${scopeId}`" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Tutor
        </label>
        <select
          :id="`tutor-enabled-${scopeType}-${scopeId}`"
          v-model="form.enabled"
          class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
        >
          <option :value="null">Heredar ({{ settings.effective.enabled ? 'Activado' : 'Desactivado' }})</option>
          <option :value="true">Activado</option>
          <option :value="false">Desactivado</option>
        </select>
        <p class="text-[10px] text-base-texto-secundario mt-1">
          Si lo desactivas, los estudiantes no podrán usar el Tutor en esta parte del curso y verán un aviso.
        </p>
      </div>

      <!-- 2. Nivel máximo de ayuda -->
      <div>
        <label :for="`tutor-level-${scopeType}-${scopeId}`" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Nivel máximo de ayuda
        </label>
        <select
          :id="`tutor-level-${scopeType}-${scopeId}`"
          v-model="form.maxGuideLevel"
          class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
        >
          <option :value="null">Heredar (hasta nivel {{ settings.effective.maxGuideLevel }})</option>
          <option :value="1">1 (solo pistas conceptuales)</option>
          <option :value="2">2 (hasta preguntas guía)</option>
          <option :value="3">3 (hasta señalar dónde está la falla)</option>
        </select>
        <p class="text-[10px] text-base-texto-secundario mt-1">
          El Tutor sube de nivel solo cuando el estudiante lleva varios intentos fallidos.
          Aquí decides hasta dónde puede llegar. Nunca entrega la solución completa.
        </p>
      </div>

      <!-- 3. Estilo -->
      <div>
        <label :for="`tutor-style-${scopeType}-${scopeId}`" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Estilo
        </label>
        <select
          :id="`tutor-style-${scopeType}-${scopeId}`"
          v-model="form.style"
          class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
        >
          <option :value="null">Heredar ({{ styleLabel(settings.effective.style) }})</option>
          <option value="equilibrado">Equilibrado</option>
          <option value="motivador">Motivador</option>
          <option value="tecnico">Técnico</option>
          <option value="breve">Breve (60 palabras o menos)</option>
        </select>
      </div>

      <!-- Resumen efectivo -->
      <div class="p-2 bg-base-bg-secundario rounded text-[10px] text-base-texto-secundario border border-base-borde-sutil">
        <span class="font-semibold">Resultado para tus estudiantes:</span>
        {{ effectiveSummary }}
      </div>

      <!-- Error al guardar -->
      <div v-if="saveError" role="alert" class="text-[11px] text-semantico-falla bg-semantico-falla/10 border border-semantico-falla/30 rounded p-2">
        {{ saveError }}
      </div>

      <!-- Confirmación de guardado -->
      <div v-if="savedOk" role="status" class="text-[11px] text-semantico-pasa bg-semantico-pasa/10 border border-semantico-pasa/30 rounded p-2">
        ✓ Configuración guardada
      </div>

      <!-- Botón guardar -->
      <button
        @click="handleSave"
        :disabled="isSaving"
        class="w-full py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs disabled:opacity-50 hover:bg-acento-ambar transition-colors"
        :aria-label="`Guardar configuración del Tutor para esta ${scopeTypeLabel}`"
      >
        {{ isSaving ? 'Guardando…' : 'Guardar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TutorSettings, TutorStyle } from '~/types'
import { useApi } from '~/composables/useApi'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'

const props = defineProps<{
  scopeType: 'class' | 'unit' | 'activity'
  scopeId: number
}>()

const api = useApi()
const { extract } = useApiErrorMessage()

const isLoading = ref(true)
const loadError = ref('')
const isSaving = ref(false)
const saveError = ref('')
const savedOk = ref(false)
const settings = ref<TutorSettings | null>(null)

interface FormState {
  enabled: boolean | null
  maxGuideLevel: 1 | 2 | 3 | null
  style: TutorStyle | null
}

const form = ref<FormState>({
  enabled: null,
  maxGuideLevel: null,
  style: null
})

const scopeTypeLabel = computed(() => {
  const labels: Record<string, string> = { class: 'clase', unit: 'unidad', activity: 'actividad' }
  return labels[props.scopeType] || props.scopeType
})

function styleLabel(s: TutorStyle | null): string {
  const labels: Record<string, string> = {
    equilibrado: 'Equilibrado',
    motivador: 'Motivador',
    tecnico: 'Técnico',
    breve: 'Breve'
  }
  return s ? (labels[s] || s) : 'Equilibrado'
}

const effectiveSummary = computed(() => {
  if (!settings.value) return ''
  const e = settings.value.effective
  const enabled = e.enabled ? 'activado' : 'desactivado'
  return `${enabled}, hasta nivel ${e.maxGuideLevel}, estilo ${styleLabel(e.style)}`
})

async function loadSettings() {
  isLoading.value = true
  loadError.value = ''
  try {
    const res = await api.get<TutorSettings>(`/tutor/settings/${props.scopeType}/${props.scopeId}`)
    settings.value = res
    // Inicializar formulario con los valores propios actuales
    form.value.enabled = res.own.enabled
    form.value.maxGuideLevel = res.own.maxGuideLevel
    form.value.style = res.own.style
  } catch (err: any) {
    const { detail, status } = extract(err)
    if (status === 403) {
      loadError.value = 'No puedes configurar el Tutor de una clase que no dictas.'
    } else {
      loadError.value = detail || 'No se pudo cargar la configuración del Tutor.'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  isSaving.value = true
  saveError.value = ''
  savedOk.value = false
  try {
    const body: Partial<{ enabled: boolean | null; maxGuideLevel: number | null; style: string | null }> = {
      enabled: form.value.enabled,
      maxGuideLevel: form.value.maxGuideLevel,
      style: form.value.style
    }
    const res = await api.put<TutorSettings>(`/tutor/settings/${props.scopeType}/${props.scopeId}`, body)
    settings.value = res
    savedOk.value = true
    // Limpiar confirmación tras 3 segundos
    setTimeout(() => { savedOk.value = false }, 3000)
  } catch (err: any) {
    const { detail, status } = extract(err)
    if (status === 403) {
      saveError.value = 'No puedes configurar el Tutor de una clase que no dictas.'
    } else if (status === 400) {
      saveError.value = detail || 'Valor inválido. Revisa los campos.'
    } else {
      saveError.value = 'No se pudo guardar la configuración. Inténtalo de nuevo.'
    }
  } finally {
    isSaving.value = false
  }
}

// Cargar configuración al montar el componente
onMounted(loadSettings)

// Recargar si cambia el scopeId
watch(() => props.scopeId, loadSettings)
</script>
