<template>
  <!-- «Dejar activa mientras uso STIRE» (stores/asistenciaActiva.ts): la asistencia abierta pasa a un panel flotante que
       sigue en todas las pantallas del docente. Solo con la sesión abierta. -->
  <button v-if="abierta" type="button" :aria-pressed="activaAqui"
    class="px-3 py-2 rounded-md font-semibold text-xs inline-flex items-center gap-1.5"
    :class="activaAqui ? 'bg-semantico-pasa/10 text-semantico-pasa border border-semantico-pasa' : 'borde-afordancia'"
    :title="activaAqui ? 'La ves en una esquina mientras usas STIRE. Toca para quitarla.' : 'Sigue a la vista en una esquina mientras usas STIRE: cuántos llegaron, escanear y marcar a mano.'"
    @click="alternar">
    <PinOff v-if="activaAqui" :size="14" aria-hidden="true" /><Pin v-else :size="14" aria-hidden="true" />
    {{ activaAqui ? 'Activa en todas las pantallas' : 'Dejar activa mientras uso STIRE' }}
  </button>
</template>

<script setup lang="ts">
import { Pin, PinOff } from 'lucide-vue-next'
import { useAsistenciaActivaStore } from '~/stores/asistenciaActiva'

const props = defineProps<{ classId: number; sesionId: number; abierta: boolean }>()
const store = useAsistenciaActivaStore()
const activaAqui = computed(() => store.activa?.sesionId === props.sesionId)

function alternar() {
  if (activaAqui.value) store.desactivar()
  else store.activar(props.classId, props.sesionId)
}
// Si se cierra la sesión desde la página, el panel se va de una vez (sin esperar al siguiente refresco).
watch(() => props.abierta, (abierta) => { if (!abierta && activaAqui.value) store.desactivar() })
</script>
