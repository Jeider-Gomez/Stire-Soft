<template>
  <!-- Se recuperó el código que el estudiante estaba escribiendo (copia local, UX-06): se avisa y se puede descartar. -->
  <div v-if="workspaceStore.borradorRecuperado" role="status" class="flex flex-wrap items-center gap-2 px-3 py-2 bg-semantico-info/10 border-b border-semantico-info/25 text-xs text-base-texto-primario">
    <History :size="14" class="shrink-0 text-semantico-info" aria-hidden="true" />
    <span class="flex-1 min-w-0">Recuperamos el código que estabas escribiendo en este ejercicio.</span>
    <button type="button" class="min-h-[36px] px-2.5 rounded-md font-semibold text-semantico-info hover:bg-semantico-info/10" @click="volver">
      Volver a la plantilla
    </button>
    <button type="button" class="min-h-[36px] px-2.5 rounded-md font-semibold text-slate-600 hover:bg-base-bg-secundario" @click="workspaceStore.borradorRecuperado = false">
      Entendido
    </button>
  </div>
</template>

<script setup lang="ts">
import { History } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspace'

const workspaceStore = useWorkspaceStore()
const { confirmar } = useConfirmar()

async function volver() {
  const ok = await confirmar({ titulo: '¿Volver a la plantilla?', mensaje: 'Se borra lo que escribiste en este ejercicio y vuelve el código inicial del docente.', accion: 'Volver a la plantilla', peligro: true })
  if (ok) workspaceStore.restaurarPlantilla()
}
</script>
