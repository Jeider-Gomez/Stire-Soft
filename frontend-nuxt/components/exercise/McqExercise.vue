<template>
  <div class="space-y-5">
    <!-- Enunciado de la pregunta -->
    <div v-if="showStatement" class="prose prose-xs text-base-texto-primario">
      <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <!-- Opciones de selección única (radio). v3 (cuadro «E-Tipo-Opcion»): cada opción con su letra; la elegida, con la
         letra en tinta y el fondo celeste. El radio sigue ahí para el teclado y el lector de pantalla. -->
    <div class="space-y-2.5" role="radiogroup">
      <label
        v-for="(option, i) in options"
        :key="option.id"
        :for="`mcq-opt-${option.id}`"
        class="opcion-mcq flex items-center gap-3 min-h-[52px] px-3.5 py-2.5 rounded-xl cursor-pointer select-none"
        :class="{ elegida: selectedId === option.id }"
      >
        <input
          :id="`mcq-opt-${option.id}`"
          type="radio"
          :value="option.id"
          v-model="selectedId"
          class="sr-only"
        />
        <span class="letra-mcq" aria-hidden="true">{{ String.fromCharCode(65 + i) }}</span>
        <span class="text-[15px] text-base-texto-primario leading-relaxed">{{ option.text }}</span>
      </label>
    </div>

    <!-- Estado de selección -->
    <div class="text-xs text-base-texto-secundario flex items-center gap-1.5 pt-1">
      <span v-if="selectedId" class="text-semantico-pasa">Opción seleccionada.</span>
      <span v-else class="text-acento-ambar-fuerte">Selecciona una opción antes de entregar.</span>
      <span v-if="selectedId"> Cuando estés seguro, pulsa <strong>Entregar respuesta</strong>.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

interface McqOption {
  id: string
  text: string
}

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
  /** La pantalla del ejercicio ya muestra el enunciado con formato arriba. */
  showStatement?: boolean
}

const props = withDefaults(defineProps<Props>(), { showStatement: true })
const workspaceStore = useWorkspaceStore()

const options = computed<McqOption[]>(() => props.question.config?.options ?? [])
const selectedId = ref<string | null>(null)

// Actualizar pendingAnswer cada vez que el estudiante cambia la selección
watch(selectedId, (val) => {
  workspaceStore.pendingAnswer = val ? { selectedId: val } : null
})

// Limpiar al montar (nueva actividad)
onMounted(() => {
  selectedId.value = null
  workspaceStore.pendingAnswer = null
})
</script>

<style scoped>
.opcion-mcq { border: 1px solid rgb(var(--c-base-borde-fuerte)); background: rgb(var(--c-base-blanco)); transition: border-color 0.15s ease, background-color 0.15s ease; }
.opcion-mcq:hover { border-color: rgb(var(--c-base-texto-secundario)); }
.opcion-mcq:focus-within { outline: 2px solid rgb(var(--c-base-texto-primario)); outline-offset: 2px; }
.opcion-mcq.elegida { border: 2px solid rgb(var(--c-base-texto-primario)); background: rgb(var(--c-sec-cielo-fondo)); }
.letra-mcq { width: 28px; height: 28px; flex: none; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: rgb(var(--c-base-bg-secundario)); color: rgb(var(--c-base-texto-primario)); }
.elegida .letra-mcq { background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco)); }
</style>
