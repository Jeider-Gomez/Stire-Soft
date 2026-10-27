<template>
  <!-- En computador, anterior · «Lección 7 de 24» · siguiente, siempre a la vista arriba de la lección (como «Clase 1 de 55»
       de Platzi). El número abre «Ir a una lección» (Ctrl+K). En el celular lo hace la barra de abajo (NavegacionLeccion.vue). -->
  <div class="saltos sticky top-[4.5rem] z-20 justify-end pointer-events-none">
    <nav aria-label="Moverse entre lecciones" class="pointer-events-auto inline-flex items-center gap-0.5 p-1 rounded-full bg-base-blanco/90 border border-base-borde-sutil shadow-sm backdrop-blur-md">
      <NuxtLink v-if="nav.anterior" :to="`/estudiante/unidad/${nav.anterior.id}`" class="salto" :title="`Anterior: ${nav.anterior.titulo}`" :aria-label="`Lección anterior: ${nav.anterior.titulo}`">
        <ChevronLeft :size="16" aria-hidden="true" />
      </NuxtLink>
      <span v-else class="salto opacity-35" aria-hidden="true"><ChevronLeft :size="16" /></span>
      <button type="button" class="min-h-[32px] px-3 rounded-full text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario inline-flex items-center gap-2"
        title="Ir a otra lección (Ctrl+K)" @click="abrir = true">
        <span>{{ posicion ? `Lección ${posicion.n} de ${posicion.total}` : 'Lecciones' }}</span>
        <kbd class="text-[10px] font-normal text-base-texto-secundario border border-base-borde-sutil rounded px-1">Ctrl K</kbd>
      </button>
      <NuxtLink v-if="nav.siguiente" :to="`/estudiante/unidad/${nav.siguiente.id}`" class="salto"
        :title="`Siguiente: ${nav.siguiente.titulo}${nav.siguiente.abierta ? '' : ' (módulo cerrado)'}`" :aria-label="`Siguiente lección: ${nav.siguiente.titulo}`">
        <component :is="nav.siguiente.abierta ? ChevronRight : Lock" :size="16" aria-hidden="true" />
      </NuxtLink>
      <span v-else class="salto opacity-35" aria-hidden="true"><ChevronRight :size="16" /></span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { navegacionLeccion, posicionEnCurso } from '~/utils/navegacionLeccion'

const props = defineProps<{ unitId: number }>()
const studentStore = useStudentStore()
const abrir = useState('ir-a-leccion', () => false)
const nav = computed(() => navegacionLeccion(studentStore.modules, studentStore.estadosModulos, props.unitId))
const posicion = computed(() => posicionEnCurso(nav.value.modulos, props.unitId))
</script>

<style scoped>
.saltos { display: none; }
@media (min-width: 768px) { .saltos { display: flex; } }
.salto { @apply w-8 h-8 rounded-full inline-flex items-center justify-center text-base-texto-primario hover:bg-base-bg-secundario; }
</style>
