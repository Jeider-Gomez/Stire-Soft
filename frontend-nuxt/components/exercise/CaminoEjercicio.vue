<template>
  <!-- El camino de un ejercicio de programar (v3, Fase D, paso 3; cuadro «E-Ejercicio» v9): Escribe → Ejecuta → Prueba
       casos → Entrega, con lo que cuesta cada paso («no cuenta», «no gasta intentos», «gasta 1 de 3»). Es una guía, no un
       candado (utils/caminoEjercicio.ts). En el celular no va: la barra de abajo ya tiene Probar y Entregar. -->
  <nav aria-label="Cómo se hace este ejercicio" class="camino-ejercicio hidden md:flex items-center gap-1 px-4 py-1.5 border-b border-base-borde-sutil bg-base-blanco flex-shrink-0 overflow-x-auto">
    <ol class="flex items-center gap-1 m-0 p-0 list-none">
      <li v-for="(p, i) in pasos" :key="p.clave" class="flex items-center gap-1">
        <ChevronRight v-if="i" :size="14" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
        <span class="paso-ej" :class="`paso-${p.estado}`" :aria-current="p.estado === 'actual' ? 'step' : undefined">
          <span class="punto-ej" aria-hidden="true">
            <Check v-if="p.estado === 'hecho'" :size="13" :stroke-width="3" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <strong class="text-[13px]">{{ p.titulo }}</strong>
          <span class="text-xs text-base-texto-secundario whitespace-nowrap">{{ p.ayuda }}</span>
          <span class="sr-only">{{ p.estado === 'hecho' ? '(hecho)' : p.estado === 'actual' ? '(sigue)' : '' }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { Check, ChevronRight } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspace'
import { caminoEjercicio } from '~/utils/caminoEjercicio'

const ws = useWorkspaceStore()
// «Ejecuta»: lo marca useProbarConMisDatos al ejecutar con datos propios (guarda el ejercicio en el que lo hizo).
const ejecutoEn = useState<number | null>('ejecuto-con-mis-datos', () => null)

const props = defineProps<{ tipo?: 'codigo' | 'web' }>()

const pasos = computed(() => {
  const ej = ws.currentExercise
  if (props.tipo === 'web') {
    // En la página web, «Mira» se cumple apenas hay HTML (la vista previa es en vivo) y «Probar», cuando pasan las reglas.
    const hay = ws.htmlCode.trim().replace(/<!--[\s\S]*?-->/g, '').trim().length > 0
    return caminoEjercicio({
      cambio: hay,
      ejecuto: hay,
      cumple: ws.htmlCssResults?.allPassed === true,
      entrego: !!ws.submissionResult || ej.usedAttempts > 0,
      intentos: ej.maxAttempts,
    }, 'web')
  }
  return caminoEjercicio({
    cambio: ws.code.trim() !== (ej.initialCode ?? '').trim(),
    ejecuto: ejecutoEn.value === ej.activityId,
    cumple: ws.publicTestCases.length > 0 && ws.publicTestCases.every((tc) => tc.passed === true),
    entrego: !!ws.submissionResult || ej.usedAttempts > 0,
    intentos: ej.maxAttempts,
  })
})
</script>

<style scoped>
.paso-ej { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px 0 6px; border-radius: 999px; }
.punto-ej { width: 24px; height: 24px; flex: none; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.paso-hecho .punto-ej { background: #00c2a8; color: #14213d; }
.paso-actual { box-shadow: inset 0 0 0 2px #ffc94d; background: rgb(var(--c-sec-sol-fondo)); }
.paso-actual .punto-ej { background: #ffc94d; color: #14213d; }
.paso-pendiente .punto-ej { border: 2px solid rgb(var(--c-base-borde-fuerte)); color: rgb(var(--c-base-texto-secundario)); }
</style>
