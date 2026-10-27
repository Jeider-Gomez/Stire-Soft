<template>
  <!-- Plan del curso (MOD-01, Jeider 17/10), como el temario lateral de Coursera, Udemy o Open edX: el índice del curso con
       el avance siempre a mano. Para que quepa sin un segundo scroll (la barra entera se desplaza como una sola):
       - todo el plan se pliega con su título, y se recuerda;
       - un solo módulo abierto a la vez (el de la lección donde está);
       - módulos «M1, M2…» y lecciones «1.1, 1.2…» en una línea; el nombre completo sale al pasar el mouse, y la lección
         donde está se ve completa. -->
  <div class="py-1 my-1 border-y border-base-borde-sutil ocultar-colapsado">
    <button
      type="button"
      class="w-full flex items-center justify-between min-h-[36px] px-3 text-xs uppercase tracking-wider text-base-texto-secundario hover:text-base-texto-primario"
      :aria-expanded="planAbierto"
      aria-controls="plan-del-curso"
      @click="alternarPlan">
      Plan del curso
      <ChevronDown v-if="planAbierto" :size="14" aria-hidden="true" />
      <ChevronRight v-else :size="14" aria-hidden="true" />
    </button>
    <!-- Buscar y saltar a cualquier lección (Ctrl+K), como en Cursor (26/10) -->
    <button v-show="planAbierto && studentStore.modules.length" type="button"
      class="mx-2 mb-1.5 w-[calc(100%-1rem)] flex items-center gap-2 min-h-[36px] px-2.5 rounded-md border border-base-borde-sutil text-xs text-base-texto-secundario hover:text-base-texto-primario hover:border-base-borde-fuerte"
      @click="irALeccion = true">
      <Search :size="13" aria-hidden="true" />
      <span class="flex-1 text-left">Ir a una lección</span>
      <kbd class="text-[10px] border border-base-borde-sutil rounded px-1">Ctrl K</kbd>
    </button>
    <ul v-show="planAbierto" id="plan-del-curso" class="space-y-0.5 pb-1">
      <li v-for="(mod, i) in studentStore.modules" :key="mod.id">
        <button
          type="button"
          :aria-expanded="moduloAbierto === mod.id"
          :aria-controls="`plan-modulo-${mod.id}`"
          :title="mod.title"
          class="w-full flex items-center gap-2 min-h-[40px] px-3 py-1.5 text-xs rounded-md text-left transition-colors"
          :class="moduloAbierto === mod.id ? 'bg-base-bg-secundario font-semibold text-base-texto-primario' : 'text-base-texto-primario hover:bg-base-bg-secundario'"
          @click="alternarModulo(mod.id)">
          <span class="shrink-0 w-7 text-center rounded text-[10px] font-bold py-0.5" :class="conteoModulo(mod).dominadas === conteoModulo(mod).total && mod.units.length ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-base-bg-secundario text-base-texto-primario'">M{{ i + 1 }}</span>
          <Lock v-if="studentStore.estadoModulo(mod.id)?.abierto === false" :size="12" class="shrink-0 text-slate-500" aria-label="Bloqueado" />
          <span class="flex-1 min-w-0 truncate">{{ tituloCorto(mod.title) }}</span>
          <span class="shrink-0 text-[10px] font-semibold text-base-texto-secundario" :aria-label="`${conteoModulo(mod).dominadas} de ${conteoModulo(mod).total} lecciones dominadas`">{{ conteoModulo(mod).dominadas }}/{{ conteoModulo(mod).total }}</span>
        </button>

        <!-- Módulo cerrado (bloqueo suave, utils/bloqueoModulos.ts): se dice qué falta en vez de mostrar las lecciones. -->
        <p v-if="moduloAbierto === mod.id && studentStore.estadoModulo(mod.id)?.requiere" :id="`plan-modulo-${mod.id}`" class="mx-3 my-1 px-2.5 py-2 rounded-md bg-base-bg-secundario text-[11px] text-slate-600 leading-snug">
          Se abre con {{ studentStore.estadoModulo(mod.id)!.requiere!.umbral }} % de dominio en
          «{{ tituloCorto(studentStore.estadoModulo(mod.id)!.requiere!.titulo) }}». Vas en {{ studentStore.estadoModulo(mod.id)!.requiere!.dominio }} %.
        </p>
        <ul v-else-if="moduloAbierto === mod.id" :id="`plan-modulo-${mod.id}`" class="ml-5 pl-2 border-l border-base-borde-sutil py-0.5">
          <li v-for="(unit, j) in mod.units" :key="unit.id">
            <NuxtLink
              :to="`/estudiante/unidad/${unit.id}`"
              :title="unit.title"
              :aria-current="esActual(unit.id) ? 'page' : undefined"
              class="flex items-center gap-1.5 min-h-[36px] text-xs px-2 py-1 rounded transition-colors"
              :class="esActual(unit.id) ? 'bg-acento-ambar/10 font-semibold text-acento-ambar-fuerte' : 'text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario/60'">
              <span class="shrink-0 w-6 text-[10px] font-semibold text-base-texto-secundario">{{ i + 1 }}.{{ j + 1 }}</span>
              <span class="flex-1 min-w-0" :class="esActual(unit.id) ? 'line-clamp-2' : 'truncate'">{{ unit.title }}</span>
              <Check v-if="unit.status === 'dominado'" :size="13" class="shrink-0 text-semantico-pasa" aria-label="Dominada" />
              <span v-else class="inline-block w-1.5 h-1.5 rounded-full shrink-0" :class="getStatusDotClass(unit.status)" :aria-label="unit.status === 'en-progreso' ? 'Empezada' : 'Sin empezar'"></span>
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronDown, ChevronRight, Lock, Search } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { conteoModulo, leccionDeLaRuta, moduloInicial, tituloCorto } from '~/utils/planLateral'

const studentStore = useStudentStore()
const irALeccion = useState('ir-a-leccion', () => false)
const route = useRoute()
const esActual = (id: number) => route.path === `/estudiante/unidad/${id}`

// Todo el plan se pliega desde su título y se recuerda en este navegador.
const CLAVE_PLAN = 'stire-plan-plegado'
const planAbierto = ref(true)
onMounted(() => {
  try { planAbierto.value = localStorage.getItem(CLAVE_PLAN) !== '1' } catch { /* sin almacenamiento */ }
})
function alternarPlan() {
  planAbierto.value = !planAbierto.value
  try { localStorage.setItem(CLAVE_PLAN, planAbierto.value ? '0' : '1') } catch { /* se usa sin recordar */ }
}

// Un solo módulo abierto: el de la lección donde está (se sigue al cambiar de lección); abrir otro cierra el anterior.
const moduloAbierto = ref<number | null>(null)
watch([() => route.path, () => studentStore.modules.length], () => {
  const actual = leccionDeLaRuta(route.path)
  if (actual !== null || moduloAbierto.value === null) moduloAbierto.value = moduloInicial(studentStore.modules, actual)
}, { immediate: true })
function alternarModulo(id: number) {
  moduloAbierto.value = moduloAbierto.value === id ? null : id
}

function getStatusDotClass(status: string) {
  switch (status) {
    case 'en-progreso': return 'bg-estado-unidad-en-progreso'
    case 'por-iniciar': return 'bg-estado-unidad-por-iniciar'
    case 'bloqueado': return 'bg-estado-unidad-bloqueado'
    default: return 'bg-base-texto-secundario'
  }
}
</script>
