<template>
  <!-- Bloqueo suave por módulo (utils/bloqueoModulos.ts): opcional y configurable, como toda función del docente -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3" aria-labelledby="avance-titulo">
    <h2 id="avance-titulo" class="text-sm font-bold text-base-texto-primario">Avance entre módulos</h2>
    <form class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil" @submit.prevent="guardarAvance">
      <div class="space-y-1">
        <label for="dominio-avanzar" class="block text-xs font-semibold text-base-texto-primario">Dominio del módulo anterior para abrir el siguiente</label>
        <p id="dominio-avanzar-ayuda" class="text-[11px] text-slate-600 max-w-md">
          El estudiante ve cuánto le falta y lo que ya empezó nunca se le cierra. Con 0 % no hay bloqueo: puede abrir cualquier módulo.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <input id="dominio-avanzar" v-model.number="dominioAvanzar" type="number" inputmode="numeric" min="0" max="100" step="5" aria-describedby="dominio-avanzar-ayuda" class="w-20 min-h-[44px] px-2 rounded-md border border-base-borde-fuerte bg-base-blanco text-sm" />
        <span class="text-xs text-slate-600">%</span>
        <button type="submit" :disabled="guardandoAvance" class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-white disabled:opacity-40">
          {{ guardandoAvance ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>
    <p v-if="avisoAvance" role="status" class="text-[11px] font-semibold" :class="avisoAvance.error ? 'text-red-700' : 'text-semantico-pasa'">{{ avisoAvance.texto }}</p>
  </section>
</template>

<script setup lang="ts">
import type { EstadoAjustesClase } from '~/composables/useAjustesClase'

/** «Avance entre módulos» de Ajustes de la clase (PAT-04: una sección, un componente). */
const props = defineProps<{ ajustes: EstadoAjustesClase }>()
const { classInfo } = props.ajustes
const { messageOf } = useApiErrorMessage()

const dominioAvanzar = ref(50)
const guardandoAvance = ref(false)
const avisoAvance = ref<{ texto: string; error: boolean } | null>(null)
watch(() => classInfo.value?.dominioParaAvanzar, (v) => { if (typeof v === 'number') dominioAvanzar.value = v }, { immediate: true })

async function guardarAvance() {
  const v = Math.round(Number(dominioAvanzar.value))
  if (!Number.isFinite(v) || v < 0 || v > 100) {
    avisoAvance.value = { texto: 'Escribe un número de 0 a 100.', error: true }
    return
  }
  guardandoAvance.value = true
  try {
    await props.ajustes.guardarAvance(v)
    avisoAvance.value = { texto: v === 0 ? 'Guardado: los módulos ya no se bloquean.' : `Guardado: el siguiente módulo se abre con ${v} %.`, error: false }
  } catch (e: unknown) {
    avisoAvance.value = { texto: messageOf(e, 'No se pudo guardar. Intenta de nuevo.'), error: true }
  } finally {
    guardandoAvance.value = false
  }
}
</script>
