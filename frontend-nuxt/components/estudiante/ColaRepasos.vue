<template>
  <!-- «Repasar los N seguidos» (cuadro «E-Repasos»): en la lección, «Repaso 2 de 3» y el paso a la siguiente, sin volver a la
       lista. El estudiante sale cuando quiera. La cola vive en esta pestaña del navegador (sessionStorage). -->
  <div v-if="lugar" class="cola-repasos flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 rounded-2xl border border-base-borde-sutil" role="status">
    <RotateCcw :size="16" class="shrink-0" aria-hidden="true" />
    <p class="m-0 flex-1 min-w-[180px] text-sm">
      <strong>Repaso {{ lugar.posicion }} de {{ lugar.total }}.</strong>
      {{ lugar.siguiente ? 'Cuando termines este, sigue el próximo.' : 'Es el último: al terminar, quedas al día.' }}
    </p>
    <NuxtLink v-if="lugar.siguiente" :to="`/estudiante/unidad/${lugar.siguiente}#ejercicios`" class="boton-practicar inline-flex min-h-[44px]">
      Siguiente repaso <ChevronRight :size="16" aria-hidden="true" />
    </NuxtLink>
    <NuxtLink v-else to="/estudiante/repasos" class="boton-practicar inline-flex min-h-[44px]" @click="salir">Volver a mis repasos</NuxtLink>
    <button type="button" class="min-h-[44px] px-2 text-sm font-semibold underline" @click="salir">Salir de los repasos seguidos</button>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, RotateCcw } from 'lucide-vue-next'
import { CLAVE_COLA, enLaCola } from '~/utils/repasosV3'

const props = defineProps<{ learningUnitId: number }>()
const cola = ref<number[]>([])
const lugar = computed(() => enLaCola(cola.value, props.learningUnitId))

onMounted(() => {
  try {
    const v = JSON.parse(sessionStorage.getItem(CLAVE_COLA) ?? '[]')
    cola.value = Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : []
  } catch { cola.value = [] }
})
function salir() {
  cola.value = []
  try { sessionStorage.removeItem(CLAVE_COLA) } catch { /* sin almacenamiento */ }
}
</script>

<style scoped>
.cola-repasos { background: rgb(var(--c-sec-sol-fondo)); color: rgb(var(--c-base-texto-primario)); animation: cola-entra 0.25s ease-out; }
@keyframes cola-entra { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .cola-repasos { animation: none; } }
</style>
