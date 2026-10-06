<template>
  <!-- D4: se apila arriba a la derecha en escritorio; abajo (encima de la barra) en móvil. No tapa el botón del Tutor. -->
  <Teleport to="body">
    <div
      aria-live="polite"
      aria-atomic="false"
      class="fixed z-[90] flex flex-col-reverse sm:flex-col gap-2
             bottom-20 sm:bottom-auto right-3 left-3 sm:left-auto sm:right-4 sm:top-4
             sm:w-96 max-w-full pointer-events-none"
    >
      <TransitionGroup
        name="aviso"
        tag="div"
        class="flex flex-col-reverse sm:flex-col gap-2"
      >
        <div
          v-for="aviso in avisos"
          :key="aviso.id"
          :role="aviso.tipo === 'error' ? 'alert' : 'status'"
          class="motion-reduce:transition-none pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold"
          :class="{
            'bg-semantico-pasa/15 border-semantico-pasa/40 text-emerald-800': aviso.tipo === 'exito',
            'bg-semantico-falla/10 border-semantico-falla/40 text-semantico-falla': aviso.tipo === 'error',
            'bg-acento-ambar/10 border-acento-ambar-fuerte/30 text-acento-ambar-fuerte': aviso.tipo === 'info',
          }"
        >
          <!-- Ícono según tipo -->
          <CheckCircle v-if="aviso.tipo === 'exito'" :size="16" class="shrink-0 mt-px text-semantico-pasa" aria-hidden="true" />
          <XCircle v-else-if="aviso.tipo === 'error'" :size="16" class="shrink-0 mt-px" aria-hidden="true" />
          <Info v-else :size="16" class="shrink-0 mt-px" aria-hidden="true" />

          <!-- Texto -->
          <span class="flex-1 leading-relaxed">{{ aviso.texto }}</span>

          <!-- Deshacer (opcional) -->
          <button
            v-if="aviso.deshacer"
            type="button"
            class="shrink-0 underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-current rounded"
            @click="aviso.deshacer?.(); cerrar(aviso.id)"
          >
            Deshacer
          </button>

          <!-- Cerrar -->
          <button
            type="button"
            aria-label="Cerrar aviso"
            class="shrink-0 p-0.5 rounded hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-current"
            @click="cerrar(aviso.id)"
          >
            <X :size="14" aria-hidden="true" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, Info, X, XCircle } from 'lucide-vue-next'
import { useAvisos } from '~/composables/useAvisos'

const { avisos, cerrar } = useAvisos()
</script>

<style scoped>
/* Respeta prefers-reduced-motion: la animación de posición se desactiva. */
.aviso-enter-active,
.aviso-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.aviso-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.aviso-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
@media (prefers-reduced-motion: reduce) {
  .aviso-enter-active,
  .aviso-leave-active {
    transition: opacity 0.2s;
  }
  .aviso-enter-from,
  .aviso-leave-to {
    transform: none;
  }
}
</style>
