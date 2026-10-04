<template>
  <!-- Aviso transparente y no invasivo al perder la red (MOB-04, Pressman cap. 13): no bloquea la pantalla; dice qué
       pasa con el trabajo y desaparece solo al volver la conexión. -->
  <Transition name="aviso-red">
    <div
      v-if="!enLinea"
      role="status"
      class="fixed top-2 left-1/2 -translate-x-1/2 z-[80] max-w-[calc(100%-2rem)] flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-semibold shadow-lg">
      <WifiOff :size="14" aria-hidden="true" />
      <span>Sin conexión. Puedes seguir: tu código queda en este equipo y se enviará al volver la red.</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { WifiOff } from 'lucide-vue-next'

const { enLinea } = useConexion()
</script>

<style scoped>
.aviso-red-enter-active, .aviso-red-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.aviso-red-enter-from, .aviso-red-leave-to { opacity: 0; transform: translate(-50%, -0.5rem); }
@media (prefers-reduced-motion: reduce) {
  .aviso-red-enter-active, .aviso-red-leave-active { transition: none; }
}
</style>
