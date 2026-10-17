<template>
  <!-- Plan del curso (MOD-01, Jeider 17/10): va DEBAJO de la navegación para no empujarla, un módulo abierto a la
       vez (el de la lección donde está, como el temario de Coursera o Udemy), nombres completos en dos líneas y
       cuántas lecciones lleva dominadas cada módulo. -->
  <div class="pt-3 mt-2 border-t border-base-borde-sutil ocultar-colapsado">
    <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Plan del curso</p>
    <div v-for="mod in studentStore.modules" :key="mod.id" class="mb-0.5">
      <button
        type="button"
        :aria-expanded="moduloAbierto === mod.id"
        :aria-controls="`plan-modulo-${mod.id}`"
        class="w-full flex items-start justify-between gap-2 min-h-[44px] px-3 py-2 text-xs font-semibold rounded-md hover:bg-base-bg-secundario text-base-texto-primario text-left transition-colors"
        @click="alternarModulo(mod.id)">
        <span class="flex items-start gap-1.5 min-w-0">
          <Lock v-if="studentStore.estadoModulo(mod.id)?.abierto === false" :size="12" class="shrink-0 mt-0.5 text-slate-500" aria-label="Bloqueado" />
          <span class="line-clamp-2" :title="mod.title">{{ mod.title }}</span>
        </span>
        <span class="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-base-texto-secundario">
          <span :aria-label="`${conteoModulo(mod).dominadas} de ${conteoModulo(mod).total} lecciones dominadas`">{{ conteoModulo(mod).dominadas }}/{{ conteoModulo(mod).total }}</span>
          <ChevronDown v-if="moduloAbierto === mod.id" :size="14" aria-hidden="true" />
          <ChevronRight v-else :size="14" aria-hidden="true" />
        </span>
      </button>

      <!-- Módulo cerrado (bloqueo suave, utils/bloqueoModulos.ts): se dice qué falta en vez de mostrar las lecciones. -->
      <p v-if="moduloAbierto === mod.id && studentStore.estadoModulo(mod.id)?.requiere" :id="`plan-modulo-${mod.id}`" class="mx-3 my-1 px-2.5 py-2 rounded-md bg-base-bg-secundario text-[11px] text-slate-600 leading-snug">
        Se abre con {{ studentStore.estadoModulo(mod.id)!.requiere!.umbral }} % de dominio en
        «{{ studentStore.estadoModulo(mod.id)!.requiere!.titulo.split(':')[0] }}». Vas en {{ studentStore.estadoModulo(mod.id)!.requiere!.dominio }} %.
      </p>
      <div v-else-if="moduloAbierto === mod.id" :id="`plan-modulo-${mod.id}`" class="pl-3 pr-1 py-1 space-y-0.5">
        <template v-for="tema in mod.topics" :key="tema.id">
          <p v-if="tema.units.length > 1" class="px-2.5 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-base-texto-secundario line-clamp-2">{{ tema.title }}</p>
          <NuxtLink
            v-for="unit in tema.units"
            :key="unit.id"
            :to="`/estudiante/unidad/${unit.id}`"
            :title="unit.title"
            :aria-current="route.path === `/estudiante/unidad/${unit.id}` ? 'page' : undefined"
            class="flex items-start justify-between gap-2 min-h-[40px] text-xs px-2.5 py-1.5 rounded transition-colors"
            :class="route.path === `/estudiante/unidad/${unit.id}` ? 'bg-base-bg-secundario font-semibold text-acento-ambar-fuerte' : 'text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario/60'">
            <span class="flex items-start gap-1.5 min-w-0">
              <span class="inline-block w-1.5 h-1.5 mt-1.5 rounded-full shrink-0" :class="getStatusDotClass(unit.status)" aria-hidden="true"></span>
              <span class="line-clamp-2">{{ unit.title }}</span>
            </span>
            <Check v-if="unit.status === 'dominado'" :size="14" class="shrink-0 mt-0.5 text-semantico-pasa" aria-label="Dominada" />
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronDown, ChevronRight, Lock } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { conteoModulo, leccionDeLaRuta, moduloInicial } from '~/utils/planLateral'

const studentStore = useStudentStore()
const route = useRoute()

// Un solo módulo abierto: el de la lección donde está (se sigue al cambiar de lección). Antes se abrían los ids 1 y 2,
// que no eran los módulos del curso, y abrir varios empujaba Repasos y Mi progreso fuera de la pantalla.
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
    case 'dominado': return 'bg-estado-unidad-dominado'
    case 'en-progreso': return 'bg-estado-unidad-en-progreso'
    case 'por-iniciar': return 'bg-estado-unidad-por-iniciar'
    case 'bloqueado': return 'bg-estado-unidad-bloqueado'
    default: return 'bg-base-texto-secundario'
  }
}
</script>
