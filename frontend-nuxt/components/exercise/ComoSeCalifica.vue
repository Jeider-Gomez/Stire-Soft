<!-- «Cómo se califica» del ejercicio, según su tipo (salió de la página del ejercicio el 08/10, PAT-04). -->
<template>
  <div class="p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil space-y-1">
    <span class="font-bold text-base-texto-primario block">Cómo se califica</span>
    <ul v-if="codigo" class="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
      <li>{{ ws.publicTestCases.length }} {{ ws.publicTestCases.length === 1 ? 'ejemplo que puedes ver' : 'ejemplos que puedes ver' }} en la pestaña «Casos de prueba» y probar con «Probar código».</li>
      <li v-if="ws.hiddenTestCaseCount > 0">
        {{ ws.hiddenTestCaseCount }} {{ ws.hiddenTestCaseCount === 1 ? 'caso oculto' : 'casos ocultos' }} más, que se revisan al entregar (por ejemplo, los valores límite).
      </li>
      <li v-else>No hay casos ocultos: lo que ves es lo que se revisa.</li>
      <li v-if="ws.timeLimitMs">Límite de tiempo por ejecución: {{ ws.timeLimitMs }} ms.</li>
    </ul>
    <ul v-else-if="htmlCss" class="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
      <li>Reglas públicas visibles en el panel de evaluación.</li>
      <li>Puntaje proporcional al peso de las reglas cumplidas (públicas y ocultas).</li>
      <li>Puntaje sobre {{ ws.currentExercise.maxScore }} puntos según tu código HTML y CSS.</li>
    </ul>
    <ul v-else class="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
      <li>Evaluación formal inmediata al entregar.</li>
      <li>Consumo de intento al enviar solución definitiva.</li>
      <li>Puntaje sobre {{ ws.currentExercise.maxScore }} puntos según tu respuesta.</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

defineProps<{ codigo: boolean; htmlCss: boolean }>()
const ws = useWorkspaceStore()
</script>
