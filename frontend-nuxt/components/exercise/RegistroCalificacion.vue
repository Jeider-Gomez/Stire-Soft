<template>
  <!-- Pestaña «Registro» del ejercicio: el historial de calificación (salió de la página el 14/11 para hacer sitio a la mesa de trabajo). -->
  <div class="space-y-2">
    <div class="flex items-center justify-between pb-1 border-b border-base-borde-sutil">
      <span class="font-bold text-xs">Historial de calificación</span>
      <button
        @click="ws.consoleLog = ['Historial limpiado.']"
        class="text-[11px] text-base-texto-secundario hover:text-base-texto-primario underline">
        Limpiar
      </button>
    </div>

    <div class="bg-editor-bg text-editor-text p-3 rounded-lg font-codigo text-xs space-y-1 min-h-[220px] max-h-[350px] overflow-y-auto">
      <div v-for="(log, idx) in ws.consoleLog" :key="idx" class="leading-relaxed">
        <span v-if="log.startsWith('✔')" class="text-[#5eead4]">{{ log }}</span>
        <span v-else-if="log.startsWith('✖') || log.startsWith('⚠') || log.startsWith('⛔')" class="text-[#f87171]">{{ log }}</span>
        <span v-else-if="log.startsWith('🎯')" class="text-[#fcd34d] font-bold">{{ log }}</span>
        <span v-else class="text-[#7dd3fc]">{{ log }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

const ws = useWorkspaceStore()
</script>
