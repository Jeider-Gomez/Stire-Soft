<template>
  <!-- Arriba de la lección, siempre a la vista (v3, Fase D; cuadros «E-Leccion» y «E-Leccion-Cerrado»): «Anterior» con el
       nombre de la lección anterior, «Lección 7 de 24» (abre «Ir a una lección», Ctrl+K) y «Siguiente» con el nombre de la
       que sigue, destacado. En el celular lo hace la barra de abajo (NavegacionLeccion.vue). -->
  <nav aria-label="Moverse entre lecciones" class="saltos sticky top-[4.5rem] z-20 items-center justify-between gap-2 pointer-events-none">
    <div class="flex items-center gap-2 min-w-0">
      <!-- Con «Contenido del curso» recogido, este botón lo vuelve a abrir (cuadro «E-Leccion-Cerrado»; solo lg). -->
      <button v-if="!contenidoAbierto" type="button" class="salto-grande pointer-events-auto hidden lg:inline-flex" @click="alternarContenido">
        <ListTree :size="16" aria-hidden="true" /> Contenido
      </button>
      <NuxtLink v-if="nav.anterior" :to="`/estudiante/unidad/${nav.anterior.id}`" class="salto-grande pointer-events-auto" :aria-label="`Lección anterior: ${nav.anterior.titulo}`">
        <ChevronLeft :size="17" class="shrink-0" aria-hidden="true" />
        <span class="hidden lg:flex flex-col items-start leading-tight min-w-0" aria-hidden="true">
          <span class="text-[11px] font-medium text-base-texto-secundario">Anterior</span>
          <span class="max-w-[170px] truncate">{{ nav.anterior.titulo }}</span>
        </span>
      </NuxtLink>
    </div>

    <button type="button" class="pointer-events-auto min-h-[44px] px-3.5 rounded-full bg-base-blanco/90 border border-base-borde-sutil shadow-sm backdrop-blur-md text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario inline-flex items-center gap-2 shrink-0"
      title="Ir a otra lección (Ctrl+K)" @click="abrir = true">
      <span>{{ posicion ? `Lección ${posicion.n} de ${posicion.total}` : 'Lecciones' }}</span>
      <kbd class="text-[10px] font-normal text-base-texto-secundario border border-base-borde-sutil rounded px-1">Ctrl K</kbd>
    </button>

    <NuxtLink v-if="nav.siguiente" :to="`/estudiante/unidad/${nav.siguiente.id}`" class="salto-siguiente pointer-events-auto"
      :title="nav.siguiente.abierta ? undefined : 'Módulo cerrado: la lección se ve, pero su módulo aún no se abre'" :aria-label="`Siguiente lección: ${nav.siguiente.titulo}`">
      <span class="hidden lg:flex flex-col items-end leading-tight min-w-0" aria-hidden="true">
        <span class="text-[11px] font-medium opacity-80">Siguiente</span>
        <span class="max-w-[200px] truncate">{{ nav.siguiente.titulo }}</span>
      </span>
      <span class="lg:hidden" aria-hidden="true">Siguiente</span>
      <component :is="nav.siguiente.abierta ? ChevronRight : Lock" :size="17" class="shrink-0" aria-hidden="true" />
    </NuxtLink>
    <span v-else aria-hidden="true" />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ListTree, Lock } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { navegacionLeccion, posicionEnCurso } from '~/utils/navegacionLeccion'

const props = defineProps<{ unitId: number }>()
const studentStore = useStudentStore()
const abrir = useState('ir-a-leccion', () => false)
const { abierto: contenidoAbierto, alternar: alternarContenido } = useContenidoCurso()
const nav = computed(() => navegacionLeccion(studentStore.modules, studentStore.estadosModulos, props.unitId))
const posicion = computed(() => posicionEnCurso(nav.value.modulos, props.unitId))
</script>

<style scoped>
.saltos { display: none; }
@media (min-width: 768px) { .saltos { display: flex; } }
/* Sin «display» en estas clases: lo ponen hidden / lg:inline-flex o la regla de abajo (lección de la Fase C). */
.salto-grande, .salto-siguiente {
  align-items: center; gap: 8px; min-height: 44px; padding: 0 14px; border-radius: 12px; font-size: 13px; font-weight: 600;
  box-shadow: 0 1px 2px rgb(20 33 61 / 0.06); transition: filter 0.15s ease, background-color 0.15s ease;
}
a.salto-grande, a.salto-siguiente { display: inline-flex; }
.salto-grande { background: rgb(var(--c-base-blanco) / 0.92); border: 1px solid rgb(var(--c-base-borde-sutil)); color: rgb(var(--c-base-texto-primario)); backdrop-filter: blur(12px); }
.salto-grande:hover { background: rgb(var(--c-base-bg-secundario)); }
.salto-siguiente { background: linear-gradient(135deg, #14213d, #25407a); color: #fff; }
.salto-siguiente:hover { filter: brightness(1.12); }
:root[data-tema='oscuro'] .salto-siguiente { background: #e8f6ff; color: #14213d; }
</style>
